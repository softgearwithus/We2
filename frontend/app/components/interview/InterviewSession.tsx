import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff, Volume2, Loader2, Play, Clock, ChevronLeft } from 'lucide-react';
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

export default function InterviewSession({ onEnd, onCancel, initialSeconds = 600 }: InterviewSessionProps) {
    const { status, isMuted, volumeLevel, messages, callId, error: vapiError, startInterview, stopInterview, toggleMute } = useVapi();
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '';
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisHint, setAnalysisHint] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [sessionState, setSessionState] = useState<'idle' | 'active' | 'processing'>('idle');
    const [timeLeft, setTimeLeft] = useState(() => Math.max(0, Math.min(initialSeconds, 600)));
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sessionStartedAtRef = useRef<number | null>(null);
    const durationSecondsRef = useRef<number | null>(null);
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

    // Handle Vapi Errors / Ejections
    useEffect(() => {
        if (vapiError && sessionState === 'active') {
            console.warn("Vapi session interrupted:", vapiError);
            handleEnd(); // Auto-finalize session on remote termination
        }
    }, [vapiError, sessionState]);

    const [permissionsGranted, setPermissionsGranted] = useState(false);

    // ... existing refs ...

    // Auto-scroll chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setCameraActive(false);
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
                setCameraActive(true);
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
            if (pollTimeoutRef.current) {
                clearTimeout(pollTimeoutRef.current);
            }
        };
    }, []);

    const startAnalysisPolling = useCallback(async () => {
        if (!callId) {
            setAnalysisError('We could not find the call id yet. Please wait a moment and try again.');
            setAnalysisHint('You can also open the analysis dashboard and check later.');
            return;
        }

        setAnalysisError(null);
        setAnalysisHint('Vapi is preparing your report. This can take a few minutes.');

        const token = localStorage.getItem('accessToken');
        const tryFetchAnalysis = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/interview/vapi/analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ callId })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch Vapi analysis');
            }

            return response.json();
        };

        let attempts = 0;
        const maxAttempts = 24;
        const startTime = Date.now();
        const timeoutMs = 6 * 60 * 1000;

        const poll = async () => {
            try {
                const session = await tryFetchAnalysis();
                const metrics = session?.analysis?.metrics || {};
                const feedback = Array.isArray(session?.analysis?.feedback) ? session.analysis.feedback : [];

                if (session?.analysisProvider !== 'vapi' || !session?.analysis?.raw) {
                    throw new Error('Analysis not ready');
                }

                const durationSeconds = durationSecondsRef.current ?? 0;
                const token = localStorage.getItem('accessToken');
                if (token) {
                    try {
                        if (durationSeconds === 0) {
                            durationSecondsRef.current = Math.max(0, initialSeconds - timeLeft);
                        }
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/interviews/${session.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ duration: durationSecondsRef.current ?? durationSeconds })
                        });
                    } catch (err) {
                        console.warn('Failed to update interview duration', err);
                    }
                }

                const finalMetrics: VideoMetrics = {
                    overall: typeof session?.overallScore === 'number' ? session.overallScore : 0,
                    technical: typeof metrics.technical === 'number' ? metrics.technical : 0,
                    communication: typeof metrics.communication === 'number' ? metrics.communication : 0,
                    problemSolving: typeof metrics.problemSolving === 'number' ? metrics.problemSolving : 0,
                    feedback,
                    transcript: session?.analysis?.transcript || session?.analysis?.raw?.transcript,
                    summary: session?.analysis?.summary || session?.feedback || session?.analysis?.raw?.summary,
                    logs: session?.analysis?.logs || session?.analysis?.raw?.messages || session?.analysis?.raw?.conversation,
                    logUrl: session?.analysis?.logUrl
                };

                onEnd(finalMetrics, durationSeconds);
            } catch (error) {
                attempts += 1;
                if (Date.now() - startTime > timeoutMs) {
                    console.error('Timed out waiting for Vapi analysis', error);
                    setAnalysisError('Analysis is taking longer than expected. Check your analysis dashboard in a few minutes.');
                    setAnalysisHint('We will keep it synced once Vapi finishes.');
                    return;
                }
                const delay = attempts >= maxAttempts ? 3500 : 2500;
                pollTimeoutRef.current = setTimeout(poll, delay);
            }
        };

        poll();
    }, [callId, onEnd]);

    const handleStart = async () => {
        if (!assistantId) return alert('System Error: Missing Assistant ID');
        try {
            const userId = localStorage.getItem('userId');
            const metadata = userId ? { userId } : undefined;
            await startInterview(assistantId, metadata);
            sessionStartedAtRef.current = Date.now();
            durationSecondsRef.current = null;
            setSessionState('active');
        } catch (e) {
            console.error("Failed to start:", e);
        }
    };

    const handleEnd = async () => {
        const elapsed = sessionStartedAtRef.current
            ? Math.max(0, Math.round((Date.now() - sessionStartedAtRef.current) / 1000))
            : Math.max(0, initialSeconds - timeLeft);
        durationSecondsRef.current = elapsed;
        // TTS Announcement
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance("Interview Ended");
            window.speechSynthesis.speak(utterance);
        }

        stopInterview();
        stopCamera();
        setSessionState('processing');
        setAnalysisError(null);
        startAnalysisPolling();
    };

    if (sessionState === 'processing') {
        return (
            <div className="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-center text-center p-8 font-sans">
                <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Performance</h2>
                <p className="text-slate-500">Placement Mode AI is generating your detailed scorecard...</p>
                {analysisHint && (
                    <div className="mt-4 text-xs text-slate-500">{analysisHint}</div>
                )}
                {analysisError && (
                    <div className="mt-6 text-sm text-amber-700 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl">
                        {analysisError}
                    </div>
                )}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Button onClick={startAnalysisPolling} className="h-10 px-4 rounded-xl">Check Again</Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard/interview?mode=analysis')}
                        className="h-10 px-4 rounded-xl"
                    >
                        Open Analysis Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[#f8fafc] flex font-sans text-slate-900 overflow-hidden">
            {/* Soft Ambient Background */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-50/50 via-white to-emerald-50/30" />

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-20 z-50 px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-500">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Mock Interview #402</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Placement Mode AI Live</span>
                        </div>
                    </div>
                </div>

                {sessionState === 'active' && (
                    <div className="bg-white/80 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-full shadow-sm flex items-center gap-3">
                        <Clock size={16} className={cn("text-slate-400", timeLeft < 60 && "text-red-500")} />
                        <span className={cn("font-mono font-bold text-lg", timeLeft < 60 ? "text-red-600" : "text-slate-700")}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                )}
            </div>

            {/* Main Workspace */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-8 pt-24 gap-8">

                {/* Visualizer & Chat (Left) */}
                <div className="w-[400px] h-full flex flex-col gap-6">
                    {/* AI Avatar / Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-white flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent" />
                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-4 shadow-lg flex items-center justify-center">
                                <Volume2 className={cn("w-10 h-10 text-white transition-opacity", status === 'speaking' ? "opacity-100" : "opacity-50")} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900">EMBLE AI</h3>
                            <p className="text-xs font-medium text-indigo-600 uppercase tracking-widest">Placement Mode AI Lead</p>
                        </div>

                        {/* Audio Waveform */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center gap-1.5 pb-6 opacity-30">
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 bg-indigo-600 rounded-full"
                                    animate={{ height: status === 'speaking' ? [10, 30 + Math.random() * 20, 10] : 10 }}
                                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Chat Feed */}
                    <div className="flex-1 bg-white/60 backdrop-blur-xl rounded-3xl border border-white shadow-sm overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
                            <AnimatePresence initial={false}>
                                {messages.length === 0 && (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
                                        Waiting to start...
                                    </div>
                                )}
                                {messages.map((msg, idx) => {
                                    if (idx === 0) return null; // Hide the initial automated prompt message
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={cn(
                                                "flex flex-col gap-1",
                                                msg.role === 'user' ? "items-end" : "items-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                                                msg.role === 'user'
                                                    ? "bg-slate-900 text-white rounded-tr-sm"
                                                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-sm"
                                            )}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 px-2">
                                                {msg.role === 'user' ? 'You' : 'EMBLE AI'}
                                            </span>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Main Camera Stage (Right) */}
                <div className="flex-1 h-full relative">
                    <div className="h-full bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-white overflow-hidden relative group">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className="w-full h-full object-cover transform -scale-x-100"
                        />

                        {/* Start Overlay / Permissions Modal */}
                        {sessionState === 'idle' && (
                            <div className="absolute inset-0 z-20 bg-white/30 backdrop-blur-md flex flex-col items-center justify-center p-8">
                                {!permissionsGranted ? (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md border border-slate-100"
                                    >
                                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                                            <Mic size={32} fill="currentColor" />
                                        </div>
                                        <h2 className="text-2xl font-[900] text-slate-900 mb-3">Permissions Required</h2>
                                        <p className="text-slate-500 mb-8 leading-relaxed">
                                            Please enable your camera and microphone to proceed with the AI interview.
                                        </p>
                                        <Button onClick={requestPermissions} className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30">
                                            Enable Camera & Mic
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md border border-slate-100"
                                    >
                                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                                            <Play size={32} fill="currentColor" />
                                        </div>
                                        <h2 className="text-2xl font-[900] text-slate-900 mb-3">Ready to Begin?</h2>
                                        <p className="text-slate-500 mb-8 leading-relaxed">
                                            You're about to start a 10-minute technical screening with our AI. Speak clearly and take your time.
                                        </p>
                                        <Button onClick={handleStart} className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30">
                                            Start Interview
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Controls Bar */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 backdrop-blur-md p-2 pl-6 pr-2 rounded-full shadow-2xl transition-all duration-300 transform translate-y-20 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 group-hover:visible" style={{ opacity: sessionState === 'active' ? 1 : 0, transform: sessionState === 'active' ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)' }}>
                            <div className="flex items-center gap-4 mr-4">
                                <button onClick={toggleMute} className={cn("p-3 rounded-full transition-all", isMuted ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white hover:bg-white/20")}>
                                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>
                            </div>
                            <Button onClick={handleEnd} variant="destructive" className="rounded-full px-6 h-12 bg-red-600 hover:bg-red-700 font-bold">
                                End Call
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
