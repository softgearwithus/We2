import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, PhoneOff, Volume2, Loader2 } from 'lucide-react';
import { useVapi } from '@/app/hooks/useVapi';
import { cn } from '@/app/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface InterviewSessionProps {
    interviewId?: string;
    onEnd: () => void;
}

export default function InterviewSession({ interviewId = `mock-${Date.now()}`, onEnd }: InterviewSessionProps) {
    const { status, isMuted, volumeLevel, messages, startInterview, stopInterview, toggleMute } = useVapi();
    const [assistantId, setAssistantId] = useState(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '');
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraActive, setCameraActive] = useState(false);

    useEffect(() => {
        if (assistantId && status === 'idle') {
            // Auto-start or wait for user? Let's wait for user to click "Start"
        }
    }, [assistantId, status]);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setCameraActive(true);
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        };

        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleStart = () => {
        if (!assistantId) {
            alert('Please configure VAPI_ASSISTANT_ID in .env');
            return;
        }
        startInterview(assistantId);
    };

    const handleEnd = () => {
        stopInterview();
        onEnd();
    };

    return (
        <div className="flex flex-col h-[600px] max-w-6xl mx-auto p-4 gap-6 relative">
            {/* Main Stage */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* AI / Visualizer Panel */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-8 shadow-2xl">
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/5">
                        <div className={cn("h-2 w-2 rounded-full animate-pulse",
                            status === 'active' || status === 'speaking' || status === 'listening' ? "bg-emerald-500" : "bg-slate-500"
                        )} />
                        <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                            {status === 'idle' ? 'AI Ready' : status}
                        </span>
                    </div>

                    {/* Central Orb */}
                    <div className="relative z-10">
                        <motion.div
                            animate={{
                                scale: status === 'speaking' ? [1, 1.1, 1] : 1,
                                opacity: 0.5
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-indigo-500 rounded-full blur-[80px]"
                        />
                        <motion.div
                            animate={{
                                scale: 1 + volumeLevel,
                            }}
                            className="relative w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl flex items-center justify-center border-4 border-white/10"
                        >
                            <div className="w-24 h-24 rounded-full bg-slate-950 flex items-center justify-center">
                                {status === 'loading' ? (
                                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                ) : (
                                    <Volume2 className={cn("w-10 h-10 transition-colors", status === 'speaking' ? "text-indigo-400" : "text-slate-700")} />
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <div className="mt-8 text-center px-6">
                        {messages.length > 0 ? (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-lg font-medium text-slate-200 leading-relaxed"
                            >
                                "{messages[messages.length - 1].text}"
                            </motion.p>
                        ) : (
                            <p className="text-slate-500 italic">Waiting for conversation to start...</p>
                        )}
                    </div>
                </div>

                {/* User Camera Panel */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 relative overflow-hidden flex items-center justify-center bg-black/50">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                    />
                    {!cameraActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                            <Loader2 className="text-slate-500 animate-spin" />
                        </div>
                    )}

                    <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                        <span className="text-xs font-bold text-white">You</span>
                    </div>

                    <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                        {isMuted ? <MicOff size={14} className="text-red-400" /> : <Mic size={14} className="text-emerald-400" />}
                        <div className="h-3 w-px bg-white/20"></div>
                        <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-emerald-500"
                                style={{ width: `${volumeLevel * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-center items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                {status === 'idle' ? (
                    <Button size="lg" onClick={handleStart} className="rounded-xl px-8 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                        Start Interview
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn("h-12 w-12 rounded-xl border-2 transition-all", isMuted ? "bg-red-50 border-red-200 text-red-600" : "bg-slate-50 border-slate-200 hover:border-slate-300")}
                            onClick={toggleMute}
                        >
                            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </Button>
                        <Button
                            variant="destructive"
                            size="lg"
                            className="rounded-xl px-8 font-bold gap-2"
                            onClick={handleEnd}
                        >
                            <PhoneOff className="w-5 h-5" />
                            End Call
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
