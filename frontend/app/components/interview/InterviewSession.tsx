import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, Loader2, Play, Clock, ChevronLeft } from 'lucide-react';
import { useAiInterview } from '@/app/hooks/useAiInterview';
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
    const sessionIdRef = useRef<string | null>(null);
    const [aiBackendSessionId, setAiBackendSessionId] = useState<string | null>(null);
    const aiBackendSessionIdRef = useRef<string | null>(null);
    const [aiExternalSessionId, setAiExternalSessionId] = useState<string | null>(null);
    const aiExternalSessionIdRef = useRef<string | null>(null);
    const { connected, lastQuestion, warnings, terminated, sendTranscript, sendStart, sendEnd } = useAiInterview(aiExternalSessionId || undefined);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisHint, setAnalysisHint] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [sessionState, setSessionState] = useState<'idle' | 'active' | 'processing'>('idle');
    const [timeLeft, setTimeLeft] = useState(() => Math.max(0, Math.min(initialSeconds, 900)));
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sessionStartedAtRef = useRef<number | null>(null);
    const durationSecondsRef = useRef<number | null>(null);
    const endRequestedRef = useRef(false);
    const [chatHistory, setChatHistory] = useState<Array<{ role: 'assistant' | 'user'; text: string }>>([]);
    const [isListening, setIsListening] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('');
    const recognitionRef = useRef<any | null>(null);
    const transcriptRef = useRef('');
    const [pendingStartPayload, setPendingStartPayload] = useState<Record<string, any> | null>(null);
    const authTokenRef = useRef<string | null>(null);
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

    const [permissionsGranted, setPermissionsGranted] = useState(false);

    const isSpeaking = false;

    // Auto-scroll chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, lastQuestion]);

    useEffect(() => {
        if (!lastQuestion) return;
        setChatHistory((prev) => [...prev, { role: 'assistant', text: lastQuestion }]);
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(lastQuestion);
            window.speechSynthesis.speak(utterance);
        }
    }, [lastQuestion]);

    useEffect(() => {
        if (!connected || !pendingStartPayload || !aiExternalSessionIdRef.current) return;
        sendStart(
            { ...pendingStartPayload, aiSessionId: aiExternalSessionIdRef.current },
            authTokenRef.current || pendingStartPayload?.token,
        );
        setPendingStartPayload(null);
    }, [connected, pendingStartPayload, sendStart]);

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

    const startRecognition = () => {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechRecognition) {
            alert('Live transcription is not supported in this browser.');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
            let finalText = '';
            let interimText = '';
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                const res = event.results[i];
                if (res.isFinal) {
                    finalText += res[0].transcript;
                } else {
                    interimText += res[0].transcript;
                }
            }
            if (finalText) {
                transcriptRef.current = `${transcriptRef.current} ${finalText}`.trim();
            }
            setLiveTranscript(`${transcriptRef.current} ${interimText}`.trim());
        };
        recognition.onerror = () => {
            setIsListening(false);
        };
        recognition.onend = () => {
            setIsListening(false);
        };
        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
    };

    const stopRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
    };

    const submitAnswer = () => {
        const answer = liveTranscript.trim();
        if (!answer) return;
        setChatHistory((prev) => [...prev, { role: 'user', text: answer }]);
        sendTranscript(answer, { warnings }, authTokenRef.current || undefined);
        transcriptRef.current = '';
        setLiveTranscript('');
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
        setAnalysisError(null);
        setAnalysisHint('Emble AI is preparing your report. This can take a few minutes.');

        const { getActiveToken } = await import('@/app/lib/auth-storage');
        const token = getActiveToken();
        const tryFetchReport = async () => {
            if (!aiBackendSessionIdRef.current) throw new Error('Missing session');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-interviewer/sessions/${aiBackendSessionIdRef.current}/report`, {
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
                const finalMetrics: VideoMetrics = {
                    overall: report?.overall_score ?? 0,
                    technical: report?.dimension_scores?.technical ?? 0,
                    communication: report?.dimension_scores?.communication ?? 0,
                    problemSolving: report?.dimension_scores?.problemSolving ?? 0,
                    feedback: Array.isArray(report?.strengths)
                        ? report.strengths.map((text: string) => ({ type: 'strength', text }))
                        : [],
                    transcript: report?.transcript,
                    summary: report?.summary,
                    logs: report?.logs,
                    logUrl: report?.log_url,
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
            authTokenRef.current = token || null;
            endRequestedRef.current = false;

            // Deduct video credit upfront before starting session
            const deductRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews/video/deduct-credit`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!deductRes.ok) {
                const errData = await deductRes.json().catch(() => null);
                alert(errData?.message || 'Monthly video interview limit exhausted.');
                return;
            }

            if (!token) {
                alert('Please login again.');
                return;
            }

            const createSessionRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: 'technical',
                    difficulty: 'intermediate',
                    role: 'Software Engineer',
                    duration: 15
                })
            });
            if (!createSessionRes.ok) {
                throw new Error('Failed to create interview session');
            }
            const interviewSession = await createSessionRes.json();
            sessionIdRef.current = interviewSession?.id || sessionIdRef.current;

            const resumeId = sessionStorage.getItem('emble.ai.resumeId');
            const createAiSessionRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-interviewer/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    interviewSessionId: sessionIdRef.current,
                    resumeId,
                    role: 'Software Engineer'
                })
            });
            if (!createAiSessionRes.ok) {
                throw new Error('Failed to create AI interview session');
            }
            const createAiData = await createAiSessionRes.json();
            const backendSessionId = createAiData?.id;
            const externalSessionId = createAiData?.externalSessionId || createAiData?.external_session_id || createAiData?.externalSessionID;

            if (backendSessionId) {
                setAiBackendSessionId(backendSessionId);
                aiBackendSessionIdRef.current = backendSessionId;
            }
            if (externalSessionId) {
                setAiExternalSessionId(externalSessionId);
                aiExternalSessionIdRef.current = externalSessionId;
            }

            if (aiBackendSessionIdRef.current) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-interviewer/sessions/${aiBackendSessionIdRef.current}/start`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            }

            sessionStartedAtRef.current = Date.now();
            durationSecondsRef.current = null;
            setSessionState('active');
            setPendingStartPayload({ userId, interviewSessionId: sessionIdRef.current, token });
        } catch (e) {
            console.error("Failed to start:", e);
        }
    };

    const handleEnd = async () => {
        if (endRequestedRef.current) return;
        endRequestedRef.current = true;
        const elapsed = sessionStartedAtRef.current
            ? Math.max(0, Math.round((Date.now() - sessionStartedAtRef.current) / 1000))
            : Math.max(0, initialSeconds - timeLeft);
        durationSecondsRef.current = elapsed;
        // TTS Announcement
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance("Interview Ended");
            window.speechSynthesis.speak(utterance);
        }

        stopRecognition();
        if (aiExternalSessionIdRef.current) {
            sendEnd({ durationSeconds: durationSecondsRef.current || 0 }, authTokenRef.current || undefined);
        }
        stopCamera();
        setSessionState('processing');
        setAnalysisError(null);
        startAnalysisPolling();
    };

    useEffect(() => {
        if (!terminated) return;
        if (sessionState !== 'active') return;
        handleEnd();
    }, [terminated, sessionState]);

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
                                <Volume2 className={cn("w-10 h-10 text-white transition-opacity", isSpeaking ? "opacity-100" : "opacity-50")} />
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
                                    animate={{ height: isSpeaking ? [10, 30 + Math.random() * 20, 10] : 10 }}
                                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Chat Feed */}
                    <div className="flex-1 bg-white/60 backdrop-blur-xl rounded-3xl border border-white shadow-sm overflow-hidden flex flex-col">
                        {sessionState === 'active' && (
                            <div className="px-4 py-3 border-b border-white/60 bg-white/70 text-xs text-slate-500 flex items-center justify-between">
                                <span>{connected ? 'AI Connected' : 'Connecting...'}</span>
                                <span className={cn('font-bold', warnings > 0 ? 'text-rose-600' : 'text-emerald-600')}>
                                    Warnings: {warnings}/3
                                </span>
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
                            <AnimatePresence initial={false}>
                                {chatHistory.length === 0 && (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
                                        Waiting to start...
                                    </div>
                                )}
                                {chatHistory.map((msg, idx) => (
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
                                ))}
                            </AnimatePresence>
                        </div>
                        {sessionState === 'active' && (
                            <div className="px-4 py-3 border-t border-white/60 bg-white/70">
                                <div className="text-[11px] font-semibold text-slate-400 mb-1">Your answer</div>
                                <div className="text-sm text-slate-700 min-h-[40px]">
                                    {liveTranscript || 'Start speaking to generate a response...'}
                                </div>
                            </div>
                        )}
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
                                            You're about to start a 15-minute technical screening with our AI. Speak clearly and take your time.
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
                                <button onClick={isListening ? stopRecognition : startRecognition} className={cn("p-3 rounded-full transition-all", isListening ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white hover:bg-white/20")}>
                                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>
                                <button onClick={submitAnswer} className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
                                    <Volume2 size={18} />
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
