'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { SectionScore } from '../CommunicationAssessment';
import { motion, AnimatePresence } from 'framer-motion';

interface ExtemporeSectionProps {
    onComplete: (score: SectionScore) => void;
    topicContent: { topic: string, keyPoints: string[] };
    globalStream: MediaStream;
    previousRecordings?: {
        reading?: { level: number, blob: Blob, text: string }[];
        listening?: { index: number, blob: Blob, text: string }[];
    };
}

export default function ExtemporeSection({ onComplete, topicContent, globalStream, previousRecordings }: ExtemporeSectionProps) {
    const [phase, setPhase] = useState<'prep' | 'speak' | 'review'>('prep');
    const [timeLeft, setTimeLeft] = useState(30);

    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        startTimer(30);
        return () => clearInterval(timerRef.current);
    }, []);

    const startTimer = (seconds: number) => {
        setTimeLeft(seconds);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleTimerEnd();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleTimerEnd = () => {
        if (phase === 'prep') {
            setPhase('speak');
            startRecording();
            startTimer(60);
        } else if (phase === 'speak') {
            stopRecording();
            setPhase('review');
        }
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
        setPhase('review');
    };

    const handleSubmit = () => {
        if (!audioBlob) return;

        onComplete({
            section: 'Extempore',
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
                            <div className="bg-pink-50 border border-pink-100 p-4 rounded-3xl w-20 h-20 mx-auto flex items-center justify-center text-pink-600 shadow-xl shadow-pink-50 mb-6">
                                <Sparkles size={40} />
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Extempore Speech</h2>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">
                                Prepare your thoughts
                            </p>
                        </div>

                        <Card className="p-8 md:p-12 bg-white border-slate-200 shadow-xl shadow-slate-100 rounded-[2.5rem] relative overflow-hidden text-center">
                            <div className="mb-8">
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-indigo-100 bg-indigo-50 text-indigo-600 mb-6">
                                    <span className="text-4xl font-black font-mono animate-pulse">{timeLeft}</span>
                                </div>
                                <p className="text-slate-500 font-medium">Recording starts automatically in {timeLeft} seconds</p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 max-w-2xl mx-auto text-left space-y-6 shadow-inner">
                                <div>
                                    <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Topic</h3>
                                    <p className="text-2xl font-bold text-slate-900 leading-snug">"{topicContent.topic}"</p>
                                </div>

                                {topicContent.keyPoints && topicContent.keyPoints.length > 0 && (
                                    <div className="pt-4 border-t border-slate-200">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Suggested Key Points</h3>
                                        <ul className="space-y-3">
                                            {topicContent.keyPoints.map((kp, i) => (
                                                <li key={i} className="flex items-start gap-3 text-slate-700">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2 shrink-0" />
                                                    <span className="text-[15px]">{kp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="mt-10">
                                <Button
                                    onClick={() => { clearInterval(timerRef.current); handleTimerEnd(); }}
                                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-14 px-10 shadow-lg font-bold transition-all"
                                >
                                    Skip Prep & Start Speaking <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {phase === 'speak' && (
                    <motion.div
                        key="speak"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                    >
                        <div className="text-center space-y-4 mb-8 flex flex-col items-center">
                            <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-full font-bold text-sm border border-rose-100 shadow-sm animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-rose-500" /> Live Recording
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">"{topicContent.topic}"</h2>
                        </div>

                        <Card className="p-8 md:p-12 bg-white border-indigo-200 shadow-2xl shadow-indigo-100 ring-4 ring-indigo-50 rounded-[2.5rem] text-center flex flex-col items-center justify-center min-h-[400px]">
                            <div className="relative h-40 w-40 flex items-center justify-center mb-10">
                                <div className="absolute inset-0 bg-rose-100 rounded-full animate-ping opacity-60" />
                                <div className="absolute inset-4 bg-rose-50 rounded-full" />
                                <div className="relative text-rose-500 font-black text-5xl font-mono">
                                    {timeLeft}s
                                </div>
                            </div>

                            <p className="text-slate-500 font-medium mb-10">Speak clearly and concisely about the topic.</p>

                            <Button
                                onClick={stopRecording}
                                className="bg-rose-500 hover:bg-rose-600 rounded-2xl h-16 w-64 shadow-xl shadow-rose-200 text-lg font-bold group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay" />
                                <Square size={20} fill="currentColor" className="mr-3" /> Stop Recording Early
                            </Button>
                        </Card>
                    </motion.div>
                )}

                {phase === 'review' && (
                    <motion.div
                        key="review"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full"
                    >
                        <div className="text-center space-y-4 mb-8">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Drill Complete!</h2>
                            <p className="text-slate-500 text-lg">Review your recordings before final submission.</p>
                        </div>

                        <Card className="p-8 bg-white border-slate-200 shadow-xl shadow-slate-100 rounded-[2.5rem]">
                            <div className="grid grid-cols-1 gap-6 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar mb-8">

                                {/* 1. Reading Preview */}
                                {previousRecordings?.reading && previousRecordings.reading.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-3 text-sm font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2">
                                            <div className="w-2 h-2 bg-indigo-600 rounded-full" /> Part 1: Reading
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {previousRecordings.reading.map((r, i) => (
                                                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                                    <p className="text-xs font-bold text-slate-500 mb-3">Passage {i + 1}</p>
                                                    <audio controls src={URL.createObjectURL(r.blob)} className="h-10 w-full" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 2. Listening Preview */}
                                {previousRecordings?.listening && previousRecordings.listening.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-3 text-sm font-bold text-purple-600 uppercase tracking-widest border-b border-purple-50 pb-2">
                                            <div className="w-2 h-2 bg-purple-600 rounded-full" /> Part 2: Listening
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {previousRecordings.listening.map((l, i) => (
                                                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                                    <p className="text-xs font-bold text-slate-500 mb-3">Phrase {i + 1}</p>
                                                    <audio controls src={URL.createObjectURL(l.blob)} className="h-10 w-full" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 3. Extempore Preview */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-3 text-sm font-bold text-pink-600 uppercase tracking-widest border-b border-pink-50 pb-2">
                                        <div className="w-2 h-2 bg-pink-600 rounded-full" /> Part 3: Extempore
                                    </h4>
                                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                                        <p className="text-sm font-bold text-indigo-900 mb-4 tracking-tight leading-snug">"{topicContent.topic}"</p>
                                        {audioBlob ? (
                                            <audio controls src={URL.createObjectURL(audioBlob)} className="h-12 w-full" />
                                        ) : (
                                            <div className="flex items-center gap-2 text-rose-500 text-sm font-bold bg-rose-50 p-3 rounded-xl">
                                                <AlertCircle size={16} /> No recording found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-slate-100">
                                <Button variant="outline" onClick={() => window.location.reload()} className="rounded-full h-14 px-10 text-slate-600 font-bold border-slate-200 w-full sm:w-auto">
                                    Discard & Restart Drill
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!audioBlob}
                                    className="bg-slate-900 hover:bg-indigo-600 text-white rounded-full h-14 px-10 shadow-lg shadow-slate-200 hover:shadow-indigo-200 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
                                >
                                    Proceed to Technical Section <ArrowRight size={18} />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
