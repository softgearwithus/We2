import { fetchApi } from '../../lib/apiClient';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, Loader2, Play, Clock, ChevronLeft } from 'lucide-react';
import { useVapi } from '@/app/hooks/useVapi';
import { cn } from '@/app/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoMetrics } from './AssessmentReport';
import { useRouter } from 'next/navigation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';

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
            const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/interview/vapi/sessions/${aiBackendSessionIdRef.current}/report`, {
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
            const createAiSessionRes = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/interview/vapi/sessions`, {
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
            <div className="fixed inset-0 z-[110] bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-4 sm:p-8 font-sans">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-card p-8 sm:p-10 rounded-3xl shadow-xl border border-border max-w-md w-full"
                >
                    <div className="relative mb-8 mx-auto w-24 h-24">
                        <div className="absolute inset-0 rounded-full border-4 border-muted border-t-primary animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">Analyzing Performance</h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">Placement Mode AI is generating your detailed scorecard. This might take a few moments...</p>
                    
                    {analysisHint && (
                        <div className="mb-4 text-xs font-medium text-foreground bg-muted py-2 px-3 rounded-lg">
                            {analysisHint}
                        </div>
                    )}
                    
                    {analysisError && (
                        <div className="mb-6 text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl text-left">
                            {analysisError}
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-3">
                        <Button 
                            onClick={startAnalysisPolling} 
                            className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                        >
                            Check Status Again
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/dashboard/interview?mode=analysis')}
                            className="w-full h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted font-medium"
                        >
                            Go to Analysis Dashboard
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col font-sans text-foreground overflow-hidden md:p-4">
            {/* Top Bar */}
            <header className="h-16 lg:h-20 shrink-0 z-50 px-4 lg:px-8 flex items-center justify-between border-b bg-card/50 backdrop-blur-xl md:rounded-t-3xl border md:border-b-0 shadow-sm relative">
                <div className="flex items-center gap-2 sm:gap-4">
                    <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-base lg:text-lg font-bold tracking-tight">AI Mock Interview</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-500 uppercase tracking-widest hidden sm:inline-block">Live Session</span>
                        </div>
                    </div>
                </div>

                {sessionState === 'active' && (
                    <div className="bg-muted border border-border px-3 py-1.5 lg:px-4 lg:py-2 rounded-full flex items-center gap-2 sm:gap-3 shadow-inner">
                        <Clock size={14} className={cn("text-muted-foreground", timeLeft < 60 && "text-destructive animate-pulse")} />
                        <span className={cn("font-mono font-medium text-sm lg:text-base tabular-nums", timeLeft < 60 ? "text-destructive" : "text-foreground")}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                )}
            </header>

            {/* Main Workspace */}
            <main className="flex-1 w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 pt-2 lg:p-6 lg:pt-6 overflow-y-auto lg:overflow-hidden relative">

                {/* Camera Stage (Top/Left) */}
                <div className="w-full lg:flex-1 relative flex flex-col min-h-[340px] lg:min-h-0 bg-black rounded-3xl border border-border shadow-md overflow-hidden group shrink-0 lg:shrink">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                    />
                    
                    {sessionState === 'active' && permissionsGranted && (
                        <div className="absolute top-4 left-4 bg-background/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-sm">
                            <span className="text-xs font-medium text-white/90">You</span>
                        </div>
                    )}

                    {/* Start Overlay / Permissions Modal */}
                    {sessionState === 'idle' && (
                        <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center p-6 sm:p-8">
                            {!permissionsGranted ? (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="bg-card p-6 sm:p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border border-border"
                                >
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary ring-1 ring-primary/20">
                                        <Mic size={24} className="sm:w-7 sm:h-7" />
                                    </div>
                                    <h2 className="text-lg sm:text-2xl font-bold mb-2 tracking-tight">Camera & Mic Access</h2>
                                    <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                                        We need access to your camera and microphone to conduct the mock interview effectively.
                                    </p>
                                    <Button onClick={requestPermissions} className="w-full h-11 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-md transition-all">
                                        Allow Access
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="bg-card p-6 sm:p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border border-border"
                                >
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary ring-1 ring-primary/20">
                                        <Play size={24} className="ml-1 sm:w-7 sm:h-7" />
                                    </div>
                                    <h2 className="text-lg sm:text-2xl font-bold mb-2 tracking-tight">Ready to Begin?</h2>
                                    <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                                        You're about to start a 15-minute technical screening. Make sure you're in a quiet environment.
                                    </p>
                                    <Button onClick={handleStart} className="w-full h-11 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-md transition-all">
                                        Start Interview
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* Controls Bar for Video */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-xl p-1.5 pl-3 pr-1.5 rounded-2xl border border-border shadow-lg transition-all duration-300 transform translate-y-16 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 peer" style={{ opacity: sessionState === 'active' ? 1 : 0, transform: sessionState === 'active' ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)' }}>
                        <Button
                            variant={isMuted ? "destructive" : "ghost"}
                            size="icon"
                            onClick={toggleMute}
                            className={cn(
                                "rounded-xl w-10 h-10 transition-colors",
                                isMuted ? "bg-destructive/20 hover:bg-destructive/30 text-destructive" : "hover:bg-accent"
                            )}
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                        </Button>
                        
                        <div className="w-px h-6 bg-border mx-1" />
                        
                        <Button 
                            onClick={handleEnd} 
                            variant="destructive" 
                            className="rounded-xl px-4 h-10 font-semibold shadow-md"
                        >
                            End Call
                        </Button>
                    </div>
                </div>

                {/* Right Sidebar: AI Visualizer & Chat */}
                <div className="w-full lg:w-[400px] xl:w-[480px] flex flex-col gap-3 lg:gap-6 lg:h-full relative flex-1 lg:flex-none">
                    
                    {/* Simplified AI Visualizer Header (Sticks top) */}
                    <div className="bg-card rounded-3xl p-4 lg:p-6 shadow-sm border border-border flex items-center gap-4 relative overflow-hidden shrink-0">
                        {isSpeaking && (
                            <div className="absolute inset-0 bg-primary/5 transition-opacity duration-700 blur-xl opacity-100" />
                        )}
                        <div className="relative w-12 h-12 lg:w-14 lg:h-14 shrink-0">
                            {isSpeaking && (
                                <motion.div 
                                    className="absolute inset-0 rounded-full border-2 border-primary/50"
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            )}
                            <div className={cn(
                                "absolute inset-0 rounded-full bg-gradient-to-tr from-primary/90 to-primary flex items-center justify-center shadow-md transition-transform duration-300",
                                isSpeaking ? "scale-105" : "scale-100"
                            )}>
                                <Volume2 className={cn("w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground transition-opacity", isSpeaking ? "opacity-100" : "opacity-80")} />
                            </div>
                        </div>
                        
                        <div className="flex-1 relative z-10">
                            <h3 className="font-bold text-base lg:text-lg tracking-tight">Emble AI</h3>
                            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lead Interviewer</p>
                        </div>

                        {/* Audio Waveform visualization */}
                        <div className="flex items-end justify-center gap-1 h-8 opacity-60 relative z-10">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1 lg:w-1.5 bg-primary rounded-t-full"
                                    animate={{ height: isSpeaking ? [4, 8 + Math.random() * 16, 4] : 4 }}
                                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Chat Feed */}
                    <div className="flex-1 bg-card rounded-3xl border border-border shadow-sm flex flex-col relative overflow-hidden min-h-[380px] lg:min-h-0">
                        {sessionState === 'active' && (
                            <div className="px-4 py-2 border-b border-border bg-card/90 backdrop-blur-md z-10 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", vapiStatus === 'active' || vapiStatus === 'speaking' || vapiStatus === 'listening' ? "bg-emerald-500" : "bg-amber-500")} />
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        {vapiStatus === 'active' || vapiStatus === 'speaking' || vapiStatus === 'listening' ? 'Connected' : 'Connecting...'}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-6" ref={scrollRef}>
                            <AnimatePresence initial={false}>
                                {chatHistory.length === 0 && (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm flex-col gap-2">
                                        <span>Transcript will appear here</span>
                                    </div>
                                )}
                                {chatHistory.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div className={cn("flex items-center gap-2 mb-1.5 px-1", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{msg.role === 'assistant' ? 'Emble AI' : 'You'}</span>
                                        </div>
                                        <Message from={msg.role as "user" | "assistant"}>
                                            <MessageContent>
                                                {msg.role === 'assistant' && msg.followup && (
                                                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-bold mb-1.5 flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" /> Follow-up
                                                    </div>
                                                )}
                                                <MessageResponse>{msg.text}</MessageResponse>
                                            </MessageContent>
                                        </Message>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        
                        {/* Live Live Transcript Footer */}
                        {sessionState === 'active' && (
                            <div className="p-3 lg:p-4 border-t border-border bg-muted/30 shrink-0 relative transition-colors">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex justify-between items-center px-1">
                                    <span>Live Context</span>
                                    {(vapiStatus === 'listening' || vapiStatus === 'speaking') && <span className="text-primary animate-pulse flex items-center gap-1"><Mic size={10} /> Active</span>}
                                </div>
                                <div className={cn(
                                    "w-full text-xs sm:text-sm min-h-[50px] max-h-[100px] overflow-y-auto whitespace-pre-wrap p-3 rounded-xl border transition-all duration-300",
                                    (vapiStatus === 'listening' || vapiStatus === 'speaking') ? "bg-background border-primary/20 text-foreground" : "bg-card border-transparent text-muted-foreground"
                                )}>
                                    {liveTranscript || (vapiStatus === 'listening' ? 'Listening for your response...' : 'Transcript will appear as you speak.')}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
