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

    useEffect(() => {
        if (assistantId && status === 'idle') {
            // Auto-start or wait for user? Let's wait for user to click "Start"
        }
    }, [assistantId, status]);

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
        <div className="flex flex-col h-[600px] max-w-4xl mx-auto p-4 gap-4">
            {/* Header / Status */}
            <div className="flex justify-between items-center bg-card p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-3">
                    <div className={cn("h-3 w-3 rounded-full animate-pulse",
                        status === 'active' || status === 'speaking' || status === 'listening' ? "bg-green-500" : "bg-gray-400"
                    )} />
                    <span className="font-medium">
                        {status === 'idle' && 'Ready'}
                        {status === 'loading' && 'Connecting...'}
                        {status === 'active' && 'Connected'}
                        {status === 'speaking' && 'AI Speaking...'}
                        {status === 'listening' && 'Listening...'}
                    </span>
                </div>
                <div className="text-sm text-muted-foreground">
                    Interview ID: {interviewId.slice(0, 8)}
                </div>
            </div>

            {/* Main Visualizer Area */}
            <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl relative overflow-hidden flex items-center justify-center">
                {/* Orb Helper */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{
                            scale: status === 'speaking' ? [1, 1.2, 1] : status === 'listening' ? [1, 1.1, 1] : 1,
                            opacity: status === 'idle' ? 0.3 : 1
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={cn(
                            "w-48 h-48 rounded-full blur-3xl",
                            status === 'speaking' ? "bg-indigo-500/50" : "bg-blue-500/30"
                        )}
                    />
                    <motion.div
                        style={{
                            width: 100 + (volumeLevel * 100),
                            height: 100 + (volumeLevel * 100)
                        }}
                        className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl transition-all duration-75"
                    />
                </div>

                {/* Status Text in Center */}
                <div className="z-10 text-center space-y-2">
                    {status === 'idle' && (
                        <Button size="lg" onClick={handleStart} className="rounded-full px-8 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700">
                            Start Interview
                        </Button>
                    )}
                    {status === 'loading' && <Loader2 className="w-12 h-12 text-white animate-spin mx-auto" />}
                </div>
            </div>

            {/* Transcript / Subtitles (Optional) */}
            <div className="h-32 bg-card rounded-lg border p-4 overflow-y-auto space-y-2">
                {messages.length === 0 && <p className="text-muted-foreground text-center italic">Conversation will appear here...</p>}
                {messages.map((msg, idx) => (
                    <div key={idx} className={cn("text-sm", msg.role === 'user' ? "text-right text-blue-600" : "text-left text-gray-700")}>
                        <span className="font-bold block text-xs uppercase opacity-70 mb-1">{msg.role}</span>
                        {msg.text}
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-6 p-4">
                <Button
                    variant="outline"
                    size="icon"
                    className={cn("h-14 w-14 rounded-full border-2", isMuted ? "bg-red-50 border-red-200 text-red-600" : "border-gray-200")}
                    onClick={toggleMute}
                    disabled={status === 'idle' || status === 'loading'}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>

                <Button
                    variant="destructive"
                    size="lg"
                    className="rounded-full px-8 gap-2"
                    onClick={handleEnd}
                >
                    <PhoneOff className="w-5 h-5" />
                    End Call
                </Button>
            </div>
        </div>
    );
}
