import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff, Volume2, Loader2, Play, Clock, ChevronLeft } from 'lucide-react';
import { useVapi } from '@/app/hooks/useVapi';
import { cn } from '@/app/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoMetrics } from './AssessmentReport';

interface InterviewSessionProps {
    interviewId?: string;
    onEnd: (metrics: VideoMetrics) => void;
    onCancel: () => void;
}

export default function InterviewSession({ interviewId = `mock-${Date.now()}`, onEnd, onCancel }: InterviewSessionProps) {
    const { status, isMuted, volumeLevel, messages, startInterview, stopInterview, toggleMute } = useVapi();
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '';
    const videoRef = useRef<HTMLVideoElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [sessionState, setSessionState] = useState<'idle' | 'active' | 'processing'>('idle');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (sessionState === 'active') {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleEnd();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [sessionState]);

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

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); // Audio handled by Vapi
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            // alert("Please allow camera access to continue.");
        }
    };

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const handleStart = async () => {
        if (!assistantId) return alert('System Error: Missing Assistant ID');
        try {
            await startInterview(assistantId);
            setSessionState('active');
        } catch (e) {
            console.error("Failed to start:", e);
        }
    };

    const handleEnd = () => {
        stopInterview();
        stopCamera();
        setSessionState('processing');

        // Mock generation of report data
        // in real app, this would come from backend analysis of transcript
        setTimeout(() => {
            const mockMetrics: VideoMetrics = {
                overall: 82,
                technical: 85,
                communication: 78,
                problemSolving: 88,
                feedback: [
                    { type: 'strength', text: "Excellent usage of technical terminology related to React." },
                    { type: 'strength', text: "Clear structuring of the system design approach." },
                    { type: 'improvement', text: "Could improve on eye contact and pacing during complex explanations." },
                    { type: 'improvement', text: "Missed some edge cases in the error handling discussion." }
                ]
            };
            onEnd(mockMetrics);
        }, 3000);
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
                <p className="text-slate-500">Prep0 AI is generating your detailed scorecard...</p>
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
                            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Prep0 AI Live</span>
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
                            <h3 className="font-bold text-lg text-slate-900">Sophia</h3>
                            <p className="text-xs font-medium text-indigo-600 uppercase tracking-widest">Prep0 AI Lead</p>
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
                                {messages.map((msg, idx) => (
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
                                            {msg.role === 'user' ? 'You' : 'Sophia'}
                                        </span>
                                    </motion.div>
                                ))}
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

                        {/* Start Overlay */}
                        {sessionState === 'idle' && (
                            <div className="absolute inset-0 z-20 bg-white/30 backdrop-blur-md flex flex-col items-center justify-center p-8">
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
