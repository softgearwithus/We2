'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Square, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import { SectionScore } from '../CommunicationAssessment';
import { motion, AnimatePresence } from 'framer-motion';

interface ReadingSectionProps {
    onComplete: (score: SectionScore) => void;
    passages: { level: string, text: string }[];
}

export default function ReadingSection({ onComplete, passages }: ReadingSectionProps) {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [phase, setPhase] = useState<'intro' | 'prep' | 'read' | 'level_complete'>('intro');
    const [timeLeft, setTimeLeft] = useState(10);

    // Recording State
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [micPermission, setMicPermission] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<any>(null);

    const currentPassage = passages[currentLevel];

    // Collect recordings
    const [recordings, setRecordings] = useState<{ level: number, blob: Blob, text: string }[]>([]);

    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    const startPrep = () => {
        setPhase('prep');
        setTimeLeft(10);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    startReading();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startReading = async () => {
        setPhase('read');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicPermission(true);
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());
                saveRecording(blob);
            };

            mediaRecorderRef.current.start();
        } catch (err) {
            console.error("Mic error", err);
            alert("Please enable microphone access.");
        }
    };

    const stopReading = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const saveRecording = (blob: Blob) => {
        setRecordings(prev => [...prev, { level: currentLevel, blob, text: currentPassage.text }]);
        setPhase('level_complete');
    };

    const handleNextLevel = () => {
        if (currentLevel < passages.length - 1) {
            setCurrentLevel(prev => prev + 1);
            setPhase('intro'); // Or prep
            startPrep();
        } else {
            // Done -> Pass all recordings to parent
            // We need to merge the *last* recording which was just added to state?
            // React state updates are async. 'recordings' here might not have the last one yet if we call this immediately?
            // Actually, handleNextLevel is called by user button click, so state should be updated.
            // Filter to ensure we only send valid recordings
            const finalRecordings = recordings.filter(r => r.blob instanceof Blob);
            console.log("Reading Section Complete: Sending", finalRecordings.length, "recordings");

            onComplete({
                section: 'Reading',
                score: 0,
                feedback: '',
                data: finalRecordings
            });
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto min-h-[500px] flex flex-col items-center justify-center p-6">
            <AnimatePresence mode='wait'>
                {phase === 'intro' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center space-y-8"
                    >
                        <div className="bg-indigo-100 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center text-indigo-600">
                            <BookOpen size={48} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900">Reading Comprehension</h2>
                        <p className="text-xl text-slate-600 max-w-lg mx-auto">
                            Read the following 3 passages clearly and naturally.
                        </p>
                        <Button onClick={startPrep} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6 rounded-full shadow-xl">
                            Start Level {currentLevel + 1}
                        </Button>
                    </motion.div>
                )}

                {(phase === 'prep' || phase === 'read') && (
                    <motion.div
                        key="reading-ui"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full space-y-8"
                    >
                        <div className="flex justify-between items-center text-slate-500 font-medium tracking-wide uppercase text-sm">
                            <span>Level {currentLevel + 1}: {currentPassage.level}</span>
                            <span>Passage {currentLevel + 1} of {passages.length}</span>
                        </div>

                        <Card className={`relative overflow-hidden transition-all duration-500 ${phase === 'read' ? 'border-indigo-500 shadow-indigo-100 shadow-2xl scale-105' : 'border-slate-200'}`}>
                            {phase === 'prep' && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                                    <span className="text-slate-500 text-lg mb-2">Read silently. Recording starts in...</span>
                                    <span className="text-6xl font-black text-indigo-600">{timeLeft}</span>
                                </div>
                            )}

                            <div className="p-10 md:p-14 text-center">
                                <p className={`text-2xl md:text-3xl leading-relaxed font-serif transition-colors duration-300 ${phase === 'read' ? 'text-slate-900' : 'text-slate-400 blur-sm'}`}>
                                    {currentPassage.text}
                                </p>
                            </div>

                            {phase === 'read' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-100">
                                    <motion.div
                                        className="h-full bg-indigo-500"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: currentPassage.text.split(' ').length * 0.4, ease: "linear" }}
                                    />
                                </div>
                            )}
                        </Card>

                        <div className="flex justify-center">
                            {phase === 'prep' && (
                                <Button variant="outline" onClick={() => { clearInterval(timerRef.current); startReading(); }} className="rounded-full">
                                    Skip Timer
                                </Button>
                            )}

                            {phase === 'read' && (
                                <Button onClick={stopReading} className="bg-red-500 hover:bg-red-600 rounded-full h-16 w-16 shadow-2xl animate-pulse flex items-center justify-center">
                                    <Square size={24} fill="white" />
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}

                {phase === 'level_complete' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6 max-w-md mx-auto"
                    >
                        <div className="bg-emerald-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center text-emerald-600">
                            <CheckCircle size={40} />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900">Passage Complete!</h2>

                        <Button onClick={handleNextLevel} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg shadow-lg">
                            {currentLevel < passages.length - 1 ? 'Next Passage' : 'Finish Reading Section'} <ArrowRight className="ml-2" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
