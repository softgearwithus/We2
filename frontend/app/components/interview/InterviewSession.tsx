import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, Loader2, Play, Clock, ChevronLeft } from 'lucide-react';
import { useVapi } from '@/app/hooks/useVapi';
import { cn } from '@/app/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoMetrics } from './AssessmentReport';
import { useRouter } from 'next/navigation';

interface InterviewSessionProps {
    onEnd: (metrics: VideoMetrics, durationSeconds: number) => void;
    onCancel: () => void;
    initialSeconds?: number;
}

export default function InterviewSession({ onEnd, onCancel, initialSeconds = 900 }: InterviewSessionProps) {
    const aiBackendSessionIdRef = useRef<string | null>(null);
    const { status: vapiStatus, messages: vapiMessages, error: vapiError, startInterview, stopInterview, toggleMute, isMuted } = useVapi();
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisHint, setAnalysisHint] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [sessionState, setSessionState] = useState<'idle' | 'active' | 'processing'>('idle');
    const [timeLeft, setTimeLeft] = useState(() => Math.max(0, Math.min(initialSeconds, 900)));
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sessionStartedAtRef = useRef<number | null>(null);
    const durationSecondsRef = useRef<number | null>(null);
    const endRequestedRef = useRef(false);
    const [chatHistory, setChatHistory] = useState<Array<{ role: 'assistant' | 'user'; text: string; followup?: boolean }>>([]);
    const router = useRouter();

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (sessionState === 'active') {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        // Trigger end on next tick to avoid render loops
                        setTimeout(() => handleEnd(), 0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [sessionState]);

    useEffect(() => {
        if (sessionState !== 'active') return;
        if (!aiBackendSessionIdRef.current) return;
        // no-op: keeping hook for future real-time time sync if needed
    }, [sessionState]);

    const [permissionsGranted, setPermissionsGranted] = useState(false);

    // Auto-scroll chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory]);

    useEffect(() => {
        if (!vapiMessages?.length) return;
        setChatHistory(
            vapiMessages.map((m: any) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                text: m.text || m.content || '',
            })),
        );
        const last = vapiMessages[vapiMessages.length - 1];
        if (last?.role === 'user' && (last?.text || last?.content)) {
            setLiveTranscript(String(last.text || last.content));
        }
    }, [vapiMessages]);

    useEffect(() => {
        setIsSpeaking(vapiStatus === 'speaking');
        if (sessionState === 'active' && vapiStatus === 'idle') {
            handleEnd();
        }
    }, [vapiStatus, sessionState]);

    useEffect(() => {
        if (!vapiError) return;
        setAnalysisError(typeof vapiError === 'string' ? vapiError : 'Vapi error occurred.');
    }, [vapiError]);


    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const requestPermissions = async () => {
        try {
            // Request both to trigger the browser prompt for both as requested
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            // We only need video for the preview, Vapi handles its own audio stream usually, 
            // but requesting it here ensures the user has granted permission.
            // We can keep the video track and stop the audio track to avoid echo/conflict if needed,
            // or just mute the video element (which is already muted).

            if (videoRef.current) {
                videoRef.current.srcObject = new MediaStream(stream.getVideoTracks());
                setPermissionsGranted(true);
            }

            // We can stop the audio track from this specific stream since Vapi will likely request its own
            // or we can leave it. To be safe/clean, let's stop the audio track we just got 
            // since we only wanted to trigger the permission prompt and get the video.
            // *correction*: keeping it might be safer to prove access, but Vapi usually creates a new stream.
            // Let's stop the audio tracks to prevent feedback loops in case Vapi echoes it.
            stream.getAudioTracks().forEach(track => track.stop());

        } catch (err) {
            console.error("Error accessing media devices:", err);
            alert("Camera and Microphone access is required for the interview. Please enable them in your browser settings.");
        }
    };


    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
            stopInterview();
            if (pollTimeoutRef.current) {
                clearTimeout(pollTimeoutRef.current);
            }
        };
    }, [stopInterview]);

    const startAnalysisPolling = useCallback(async () => {
        setAnalysisError(null);
        setAnalysisHint('Emble AI is preparing your report. This can take a few minutes.');

        const { getActiveToken } = await import('@/app/lib/auth-storage');
        const token = getActiveToken();
        const tryFetchReport = async () => {
            if (!aiBackendSessionIdRef.current) throw new Error('Missing session');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interview/vapi/sessions/${aiBackendSessionIdRef.current}/report`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Report not ready');
            return response.json();
        };

        let attempts = 0;
        const startTime = Date.now();
        const timeoutMs = 6 * 60 * 1000;

        const poll = async () => {
            try {
                const report = await tryFetchReport();
                const durationSeconds = durationSecondsRef.current ?? 0;
                const analysis = report?.analysis || {};
                const metrics = analysis?.metrics || report?.analysis?.metrics || {};
                const finalMetrics: VideoMetrics = {
                    overall: report?.overallScore ?? metrics?.overallScore ?? analysis?.overallScore ?? 0,
                    technical: metrics?.technical ?? 0,
                    communication: metrics?.communication ?? 0,
                    problemSolving: metrics?.problemSolving ?? 0,
                    feedback: Array.isArray(analysis?.feedback)
                        ? analysis.feedback
                        : Array.isArray(report?.strengths)
                            ? report.strengths.map((text: string) => ({ type: 'strength', text }))
                            : [],
                    transcript: analysis?.transcript,
                    summary: analysis?.summary,
                    logs: analysis?.logs,
                    logUrl: analysis?.logUrl,
                };
                onEnd(finalMetrics, durationSeconds);
            } catch (error) {
                attempts += 1;
                if (Date.now() - startTime > timeoutMs) {
                    console.error('Timed out waiting for analysis', error);
                    setAnalysisError('Analysis is taking longer than expected. Check your analysis dashboard in a few minutes.');
                    setAnalysisHint('We will keep it synced once Emble AI finishes.');
                    return;
                }
                pollTimeoutRef.current = setTimeout(poll, 2500 + (attempts > 10 ? 1000 : 0));
            }
        };
        poll();
    }, [onEnd]);

    const handleStart = async () => {
        try {
            const { getActiveUserId, getActiveToken } = await import('@/app/lib/auth-storage');
            const userId = getActiveUserId();
            const token = getActiveToken();
            endRequestedRef.current = false;

            if (!token) {
                alert('Please login again.');
                return;
            }

            const resumeAssetId = sessionStorage.getItem('emble.ai.resumeId');
            const createAiSessionRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interview/vapi/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    resumeAssetId,
                    role: 'Software Engineer',
                    difficulty: 'intermediate'
                })
            });
            if (!createAiSessionRes.ok) {
                throw new Error('Failed to create Vapi interview session');
            }
            const createAiData = await createAiSessionRes.json();
            const backendSessionId = createAiData?.id;
            const assistantId = createAiData?.aiInterviewerId || createAiData?.assistantId || createAiData?.ai_interviewer_id;

            if (backendSessionId) {
                aiBackendSessionIdRef.current = backendSessionId;
            }
            if (!assistantId) {
                throw new Error('Missing Vapi assistant id');
            }

            sessionStartedAtRef.current = Date.now();
            durationSecondsRef.current = null;
            setSessionState('active');
            await startInterview(assistantId, { userId, interviewSessionId: backendSessionId });
        } catch (e) {
            console.error("Failed to start:", e);
            setAnalysisError('Failed to start interview. Please try again.');
        }
    };

    const handleEnd = async () => {
        if (endRequestedRef.current) return;
        endRequestedRef.current = true;
        const elapsed = sessionStartedAtRef.current
            ? Math.max(0, Math.round((Date.now() - sessionStartedAtRef.current) / 1000))
            : Math.max(0, initialSeconds - timeLeft);
        durationSecondsRef.current = elapsed;
        stopInterview();
        stopCamera();
        setSessionState('processing');
        setAnalysisError(null);
        startAnalysisPolling();
    };

    if (sessionState === 'processing') {
        return (
            <div className="fixed inset-0 z-[110] bg-slate-50 flex flex-col items-center justify-center text-center p-8 font-sans">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full"
                >
                    <div className="relative mb-8 mx-auto w-24 h-24">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-50 border-t-slate-600 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-slate-800 animate-spin" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Analyzing Performance</h2>
                    <p className="text-slate-500 mb-6 leading-relaxed">Placement Mode AI is generating your detailed scorecard. This might take a few moments...</p>
                    
                    {analysisHint && (
                        <div className="mb-4 text-xs font-medium text-slate-800 bg-slate-50 py-2 px-3 rounded-lg">
                            {analysisHint}
                        </div>
                    )}
                    
                    {analysisError && (
                        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl text-left">
                            {analysisError}
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-3">
                        <Button 
                            onClick={startAnalysisPolling} 
                            className="w-full h-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold"
                        >
                            Check Status Again
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/dashboard/interview?mode=analysis')}
                            className="w-full h-12 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
                        >
                            Go to Analysis Dashboard
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex font-sans text-slate-100 overflow-hidden">
            {/* Soft Ambient Background for Dark Theme */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900/20 via-slate-950 to-slate-950" />

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-20 z-50 px-8 flex items-center justify-between border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">AI Mock Interview</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Session</span>
                        </div>
                    </div>
                </div>

                {sessionState === 'active' && (
                    <div className="bg-slate-900/80 border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 shadow-lg">
                        <Clock size={16} className={cn("text-slate-400", timeLeft < 60 && "text-red-400 animate-pulse")} />
                        <span className={cn("font-mono font-medium text-lg tabular-nums", timeLeft < 60 ? "text-red-400" : "text-white")}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                )}
            </div>

            {/* Main Workspace */}
            <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center p-6 pt-28 gap-6 max-w-7xl mx-auto">

                {/* Main Camera Stage (Left/Top) */}
                <div className="flex-1 w-full h-full relative min-h-[400px]">
                    <div className="h-full w-full bg-slate-900 rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl group flex items-center justify-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className="w-full h-full object-cover transform -scale-x-100"
                        />
                        
                        {sessionState === 'active' && permissionsGranted && (
                            <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                <span className="text-xs font-medium text-white/90">You</span>
                            </div>
                        )}

                        {/* Start Overlay / Permissions Modal */}
                        {sessionState === 'idle' && (
                            <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8">
                                {!permissionsGranted ? (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-center max-w-md border border-white/10"
                                    >
                                        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-400 ring-1 ring-blue-500/30">
                                            <Mic size={32} />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Camera & Mic Access</h2>
                                        <p className="text-slate-400 mb-8 leading-relaxed text-sm">
                                            We need access to your camera and microphone to conduct the mock interview effectively.
                                        </p>
                                        <Button onClick={requestPermissions} className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all">
                                            Allow Access
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-center max-w-md border border-white/10"
                                    >
                                        <div className="w-16 h-16 bg-slate-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400 ring-1 ring-slate-200">
                                            <Play size={32} className="ml-1" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Ready to Begin?</h2>
                                        <p className="text-slate-400 mb-8 leading-relaxed text-sm">
                                            You're about to start a 15-minute technical screening. Make sure you're in a quiet environment.
                                        </p>
                                        <Button onClick={handleStart} className="w-full h-12 text-base bg-slate-800 hover:bg-slate-500 text-white rounded-xl font-semibold shadow-lg shadow-slate-200 transition-all">
                                            Start Interview
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Controls Bar */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/80 backdrop-blur-xl p-2 pl-4 pr-2 rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 transform translate-y-20 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 group-hover:visible" style={{ opacity: sessionState === 'active' ? 1 : 0, transform: sessionState === 'active' ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)' }}>
                            <button
                                onClick={toggleMute}
                                className={cn(
                                    "p-3.5 rounded-xl transition-all flex items-center gap-2",
                                    isMuted
                                        ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                                        : "bg-white/5 text-white hover:bg-white/10"
                                )}
                            >
                                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                            
                            <div className="w-px h-8 bg-white/10 mx-1" />
                            
                            <Button 
                                onClick={handleEnd} 
                                variant="destructive" 
                                className="rounded-xl px-5 h-[46px] bg-rose-600 hover:bg-rose-500 font-semibold shadow-lg shadow-rose-900/20"
                            >
                                End Call
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Visualizer & Chat (Right) */}
                <div className="w-full lg:w-full max-w-full max-w-[420px] h-full flex flex-col gap-6">
                    {/* AI Avatar / Status */}
                    <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shrink-0 h-[220px]">
                        {/* Animated background glow when speaking */}
                        <div className={cn(
                            "absolute inset-0 bg-slate-500/10 transition-opacity duration-700 blur-3xl",
                            isSpeaking ? "opacity-100" : "opacity-0"
                        )} />
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="relative w-20 h-20 mb-4">
                                {/* Outer pulsing ring */}
                                {isSpeaking && (
                                    <motion.div 
                                        className="absolute inset-0 rounded-full border-2 border-slate-400"
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}
                                
                                <div className={cn(
                                    "absolute inset-0 rounded-full bg-gradient-to-tr from-slate-600 to-slate-600 flex items-center justify-center shadow-lg transition-transform duration-300",
                                    isSpeaking ? "scale-105 shadow-slate-200" : "scale-100"
                                )}>
                                    <Volume2 className={cn("w-8 h-8 text-white transition-opacity", isSpeaking ? "opacity-100" : "opacity-70")} />
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-lg text-white tracking-tight">Emble AI</h3>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Lead Interviewer</p>
                        </div>

                        {/* Audio Waveform */}
                        <div className="absolute bottom-6 left-0 right-0 h-10 flex items-end justify-center gap-1.5 opacity-50">
                            {[...Array(12)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 bg-slate-400 rounded-t-full"
                                    animate={{ height: isSpeaking ? [4, 15 + Math.random() * 20, 4] : 4 }}
                                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Chat Feed */}
                    <div className="flex-1 bg-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative">
                        {sessionState === 'active' && (
                            <div className="absolute top-0 left-0 right-0 px-5 py-3 border-b border-white/5 bg-slate-900/90 backdrop-blur-md z-10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", vapiStatus === 'active' || vapiStatus === 'speaking' || vapiStatus === 'listening' ? "bg-emerald-500" : "bg-amber-500")} />
                                    <span className="text-xs font-medium text-slate-300">{vapiStatus === 'active' || vapiStatus === 'speaking' || vapiStatus === 'listening' ? 'Connected' : 'Connecting...'}</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex-1 overflow-y-auto p-5 pt-14 space-y-5" ref={scrollRef}>
                            <AnimatePresence initial={false}>
                                {chatHistory.length === 0 && (
                                    <div className="flex items-center justify-center h-full text-slate-500 text-sm font-medium">
                                        Transcript will appear here
                                    </div>
                                )}
                                {chatHistory.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex flex-col",
                                            msg.role === 'user' ? "items-end" : "items-start"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 mb-1.5 px-1">
                                            {msg.role === 'assistant' && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emble AI</span>}
                                            {msg.role === 'user' && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">You</span>}
                                        </div>
                                        <div className={cn(
                                            "max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm",
                                            msg.role === 'user'
                                                ? "bg-slate-800 text-white rounded-2xl rounded-tr-sm"
                                                : "bg-slate-800 text-slate-200 border border-white/5 rounded-2xl rounded-tl-sm"
                                        )}>
                                            {msg.role === 'assistant' && msg.followup && (
                                                <div className="text-[10px] uppercase tracking-widest text-slate-300 font-bold mb-1.5 flex items-center gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-slate-400" /> Follow-up
                                                </div>
                                            )}
                                            {msg.text}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        
                        {sessionState === 'active' && (
                            <div className="p-4 border-t border-white/5 bg-slate-900 shrink-0">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex justify-between items-center">
                                    <span>Live Transcript</span>
                                    {(vapiStatus === 'listening' || vapiStatus === 'speaking') && <span className="text-rose-400 animate-pulse">Live</span>}
                                </div>
                                <div className={cn(
                                    "w-full text-sm min-h-[60px] max-h-[100px] overflow-y-auto whitespace-pre-wrap p-3 rounded-xl border transition-colors",
                                    (vapiStatus === 'listening' || vapiStatus === 'speaking') ? "bg-slate-800 border-white/10 text-slate-200" : "bg-slate-900 border-transparent text-slate-500"
                                )}>
                                    {liveTranscript || (vapiStatus === 'listening' ? 'Listening for your response...' : 'Transcript will appear as you speak.')}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
