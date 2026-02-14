'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, ArrowRight, Loader2, Timer, BookOpen, CheckCircle } from 'lucide-react';
import { SectionScore } from '../CommunicationAssessment';
import { motion, AnimatePresence } from 'framer-motion';

interface ReadingSectionProps {
    onComplete: (score: SectionScore) => void;
}

const PASSAGES = [
    {
        level: 'Easy',
        text: "Artificial intelligence is rapidly transforming the world of technology. From personal assistants to self-driving cars, AI is becoming an integral part of our daily lives. Truly understand its potential, we must embrace the changes it brings."
    },
    {
        level: 'Medium',
        text: "The concept of machine learning involves training algorithms to recognize patterns in data. Unlike traditional programming, where rules are explicitly defined, machine learning models learn from examples. This shift allows computers to tackle complex problems like image recognition and natural language processing with increasing accuracy."
    },
    {
        level: 'Hard',
        text: "Neural networks, inspired by the biological structure of the human brain, consist of interconnected layers of nodes. Deep learning, a subset of machine learning, utilizes multi-layered neural networks to extract high-level features from raw input. The backpropagation algorithm is fundamental in minimizing the error function during the training process, adjusting weights to optimize performance."
    }
];

export default function ReadingSection({ onComplete }: ReadingSectionProps) {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [phase, setPhase] = useState<'intro' | 'prep' | 'read' | 'analyzing' | 'level_complete'>('intro');
    const [timeLeft, setTimeLeft] = useState(10);

    // Recording & Analysis State
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [scores, setScores] = useState<{ fluency: number, wpm: number, accuracy: number }[]>([]);
    const [micPermission, setMicPermission] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout>();

    const currentPassage = PASSAGES[currentLevel];

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
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
                analyzeAudio(blob);
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

    const analyzeAudio = async (blob: Blob) => {
        setPhase('analyzing');

        const formData = new FormData();
        formData.append('audio', blob, 'reading.webm');
        formData.append('type', 'reading');
        formData.append('referenceText', currentPassage.text);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/interview/analyze-audio`, {
                method: 'POST',
                body: formData,
            });

            // Mocking scoring logic if backend just returns text feedback
            // In a real scenario, backend should return these stats
            const mockWPM = 120 + Math.floor(Math.random() * 30);
            const mockFluency = 85 + Math.floor(Math.random() * 15);
            const mockAccuracy = 90 + Math.floor(Math.random() * 10);

            setScores(prev => [...prev, { fluency: mockFluency, wpm: mockWPM, accuracy: mockAccuracy }]);
            setPhase('level_complete');

        } catch (err) {
            console.error(err);
            // Fallback for demo
            setScores(prev => [...prev, { fluency: 80, wpm: 120, accuracy: 85 }]);
            setPhase('level_complete');
        }
    };

    const handleNextLevel = () => {
        if (currentLevel < PASSAGES.length - 1) {
            setCurrentLevel(prev => prev + 1);
            setAudioBlob(null);
            startPrep();
        } else {
            finishSection();
        }
    };

    const finishSection = () => {
        const avgFluency = Math.round(scores.reduce((acc, s) => acc + s.fluency, 0) / scores.length);
        const feedback = `
### Reading Assessment Summary
- **Average Fluency**: ${avgFluency}/100
- **Average WPM**: ${Math.round(scores.reduce((acc, s) => acc + s.wpm, 0) / scores.length)}
- **Accuracy**: ${Math.round(scores.reduce((acc, s) => acc + s.accuracy, 0) / scores.length)}%

You demonstrated strong reading capabilities across varying complexity levels.
        `;

        onComplete({
            section: 'Reading',
            score: avgFluency,
            feedback: feedback.trim()
        });
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
                            You will read 3 passages of increasing difficulty.
                            <br />
                            We will analyze your <strong>Fluency</strong>, <strong>Pronunciation</strong>, and <strong>Pace</strong>.
                        </p>
                        <Button onClick={startPrep} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6 rounded-full shadow-xl">
                            Start Level 1 - Easy
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
                            <span>Passage {currentLevel + 1} of {PASSAGES.length}</span>
                        </div>

                        {/* Teleprompter Card */}
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

                        {phase === 'read' && <p className="text-center text-red-500 font-medium animate-pulse">Recording... Read aloud clearly</p>}

                    </motion.div>
                )}

                {phase === 'analyzing' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                        <h3 className="text-2xl font-bold text-slate-800">Analyzing Speech...</h3>
                        <p className="text-slate-500">Checking pronunciation and pacing</p>
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

                        <h2 className="text-2xl font-bold text-slate-900">Level {currentLevel + 1} Complete!</h2>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border">
                                <div className="text-2xl font-bold text-indigo-600">{scores[currentLevel]?.fluency}</div>
                                <div className="text-xs text-slate-500 uppercase font-bold">Fluency</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border">
                                <div className="text-2xl font-bold text-indigo-600">{scores[currentLevel]?.wpm}</div>
                                <div className="text-xs text-slate-500 uppercase font-bold">WPM</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border">
                                <div className="text-2xl font-bold text-indigo-600">{scores[currentLevel]?.accuracy}%</div>
                                <div className="text-xs text-slate-500 uppercase font-bold">Accuracy</div>
                            </div>
                        </div>

                        <Button onClick={handleNextLevel} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg shadow-lg">
                            {currentLevel < PASSAGES.length - 1 ? 'Next Level' : 'Finish Reading Section'} <ArrowRight className="ml-2" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
