'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, ArrowRight, Loader2, Code2, AlertCircle } from 'lucide-react';
import { SectionScore } from '../CommunicationAssessment';
import { motion, AnimatePresence } from 'framer-motion';

interface TechnicalSectionProps {
    onComplete: (score: SectionScore) => void;
    topicContent: { topic: string, role: string };
    globalStream: MediaStream;
}

export default function TechnicalSection({ onComplete, topicContent, globalStream }: TechnicalSectionProps) {
    const [phase, setPhase] = useState<'prep' | 'interview' | 'complete'>('prep');

    // Total 10 minutes = 600 seconds
    const TOTAL_TIME = 600;
    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<any>(null);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const startInterview = () => {
        setPhase('interview');
        startRecording();
        startTimer();
    };

    const startTimer = () => {
        setTimeLeft(TOTAL_TIME);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    stopRecording();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startRecording = () => {
        try {
            const audioTrack = globalStream.getAudioTracks()[0];
            if (!audioTrack) {
                console.warn("No audio track found in global stream!");
                return;
            }

            const audioOnlyStream = new MediaStream([audioTrack]);
            mediaRecorderRef.current = new MediaRecorder(audioOnlyStream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Recording start error", err);
            alert("Failed to start recording. Please check microphone permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
        clearInterval(timerRef.current);
        setPhase('complete');
    };

    const handleSubmit = () => {
        if (!audioBlob) return;
        onComplete({
            section: 'Technical',
            score: 0,
            feedback: "",
            data: { topic: topicContent.topic, blob: audioBlob }
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-6 lg:p-12">
            <AnimatePresence mode="wait">
                {phase === 'prep' && (
                    <motion.div
                        key="prep"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                        className="w-full"
                    >
                        <div className="text-center space-y-4 mb-8">
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl w-20 h-20 mx-auto flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-50 mb-6">
                                <Code2 size={40} />
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Technical Deep Dive</h2>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">
                                {topicContent.role} Interview
                            </p>
                        </div>

                        <Card className="p-8 md:p-12 bg-white border-slate-200 shadow-xl shadow-slate-100 rounded-[2.5rem] relative overflow-hidden text-center space-y-8">
                            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 max-w-2xl mx-auto text-left shadow-inner">
                                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">Prompt</h3>
                                <p className="text-xl font-bold text-slate-900 leading-relaxed mb-6">
                                    "{topicContent.topic}"
                                </p>
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <p className="text-sm text-emerald-800 font-medium">
                                        You will have exactly 10 minutes to walk through your solution. Explain your thought process, data structures, and edge cases clearly. The AI will evaluate your technical logic.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={startInterview}
                                className="bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl h-16 px-10 shadow-lg shadow-slate-200 text-lg font-bold hover:shadow-emerald-200 transition-all w-full max-w-sm group"
                            >
                                Start 10-Min Interview <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Card>
                    </motion.div>
                )}

                {phase === 'interview' && (
                    <motion.div
                        key="interview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                    >
                        <div className="text-center space-y-4 mb-8 flex flex-col items-center">
                            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-full font-bold text-sm border border-emerald-100 shadow-sm animate-pulse">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Active Technical Session
                            </div>
                        </div>

                        <Card className="p-8 md:p-12 bg-white border-emerald-200 shadow-2xl shadow-emerald-100 ring-4 ring-emerald-50 rounded-[2.5rem] flex flex-col items-center min-h-[500px]">

                            <div className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-left mb-12 shadow-inner">
                                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Your Prompt</h3>
                                <p className="text-lg font-bold text-slate-800 leading-snug">"{topicContent.topic}"</p>
                            </div>

                            <div className="relative flex items-center justify-center mb-12">
                                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30 blur-xl" />
                                <div className="text-7xl font-black font-mono text-emerald-600 tracking-tighter">
                                    {formatTime(timeLeft)}
                                </div>
                            </div>

                            <p className="text-slate-500 font-medium mb-10 max-w-sm text-center">
                                Walk through your reasoning out loud. You can end early if you finish your explanation.
                            </p>

                            <Button
                                onClick={stopRecording}
                                className="bg-rose-500 hover:bg-rose-600 rounded-2xl h-16 w-64 shadow-xl shadow-rose-200 text-lg font-bold group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay" />
                                <Square size={20} fill="currentColor" className="mr-3" /> Finish Early
                            </Button>
                        </Card>
                    </motion.div>
                )}

                {phase === 'complete' && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full text-center space-y-8 pt-10"
                    >
                        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl w-24 h-24 mx-auto flex items-center justify-center text-indigo-500 shadow-xl shadow-indigo-50">
                            <Code2 size={48} />
                        </div>

                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Technical Response Recorded!</h2>
                        <p className="text-slate-500 text-lg max-w-lg mx-auto">
                            Your 10-minute technical response has been saved. You have now completed all 4 steps of the assessment.
                        </p>

                        <div className="pt-8">
                            <Button onClick={handleSubmit} className="w-full max-w-md mx-auto bg-slate-900 hover:bg-indigo-600 h-16 text-lg font-bold rounded-2xl shadow-xl transition-all flex justify-between px-8 text-white">
                                Finalize & View Full AI Report <ArrowRight size={20} />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
