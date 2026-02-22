'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Square, ArrowRight, BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { SectionScore } from '../CommunicationAssessment';
import { motion, AnimatePresence } from 'framer-motion';

interface ReadingSectionProps {
    onComplete: (score: SectionScore) => void;
    passages: { level: string, text: string }[];
    globalStream: MediaStream;
}

export default function ReadingSection({ onComplete, passages, globalStream }: ReadingSectionProps) {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [phase, setPhase] = useState<'intro' | 'prep' | 'read' | 'level_complete'>('intro');
    const [timeLeft, setTimeLeft] = useState(10);

    // Recording State
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

    const startReading = () => {
        setPhase('read');
        try {
            // Create a new stream with ONLY the audio track from the global stream to record audio only
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
                saveRecording(blob);
            };

            mediaRecorderRef.current.start();
        } catch (err) {
            console.error("Recording start error", err);
            alert("Failed to start recording. Please check microphone permissions.");
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
            setPhase('intro');
            // Alternatively, go straight to prep: setPhase('prep'); startPrep();
        } else {
            // Wait for state to settle, then complete
            setTimeout(() => {
                // Because recordings state update might be slightly delayed, we pass the current state
                // Actually React state might not be fully updated here due to closure. 
                // We use a functional update approach or rely on the effect, but let's just pass what we have
                // The newest recording is already pushed to `recordings`.
                onComplete({
                    section: 'Reading',
                    score: 0,
                    feedback: '',
                    data: recordings
                });
            }, 100);
        }
    };

    // Need a special hook to trigger onComplete when 'recordings' reaches full length if we transition directly
    useEffect(() => {
        if (phase === 'level_complete' && recordings.length === passages.length) {
            // Let the user click "Finish" first, handled in handleNextLevel
        }
    }, [phase, recordings.length, passages.length]);


    const handleFinalize = () => {
        onComplete({
            section: 'Reading',
            score: 0,
            feedback: '',
            data: recordings
        });
    }

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4 md:p-6 pb-20">
            <AnimatePresence mode='wait'>
                {phase === 'intro' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                        className="text-center space-y-8 w-full"
                    >
                        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem] w-28 h-28 mx-auto flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-100">
                            <BookOpen size={48} />
                        </div>
                        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Reading Comprehension</h2>
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-slate-600 max-w-lg mx-auto text-left space-y-3">
                            <div className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" /><span>Read the following passages clearly and naturally.</span></div>
                            <div className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" /><span>You have 10 seconds to prepare before recording starts.</span></div>
                            <div className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" /><span>Maintain good posture and eye contact with the camera.</span></div>
                        </div>
                        <Button onClick={startPrep} className="bg-slate-900 hover:bg-indigo-600 text-white text-lg px-10 h-16 rounded-2xl shadow-xl shadow-slate-200 hover:shadow-indigo-200 transition-all font-bold group">
                            Start Level {currentLevel + 1} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
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
                        <div className="flex justify-between items-center text-slate-500 font-bold tracking-wider uppercase text-xs">
                            <span className="bg-slate-100 px-4 py-2 rounded-xl text-slate-700">Level {currentLevel + 1}: <span className="text-indigo-600">{currentPassage.level}</span></span>
                            <span>Passage {currentLevel + 1} of {passages.length}</span>
                        </div>

                        <Card className={`relative overflow-hidden transition-all duration-500 border-none rounded-[2.5rem] bg-slate-50 ${phase === 'read' ? 'shadow-2xl shadow-indigo-100 ring-4 ring-indigo-50' : 'shadow-sm ring-1 ring-slate-200'}`}>
                            {phase === 'prep' && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-10 flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 rounded-full border-4 border-indigo-100 flex items-center justify-center mb-4">
                                        <span className="text-5xl font-black text-indigo-600 animate-pulse">{timeLeft}</span>
                                    </div>
                                    <span className="text-slate-600 text-lg font-medium">Read silently. Recording starts soon.</span>
                                </div>
                            )}

                            <div className="p-10 md:p-14 text-center min-h-[400px] flex items-center justify-center">
                                <p className={`text-2xl md:text-3xl leading-relaxed font-serif transition-colors duration-500 ${phase === 'read' ? 'text-slate-900' : 'text-slate-400 blur-[2px]'}`}>
                                    {currentPassage.text}
                                </p>
                            </div>

                            {phase === 'read' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-indigo-50">
                                    <motion.div
                                        className="h-full bg-indigo-500"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: currentPassage.text.split(' ').length * 0.4, ease: "linear" }}
                                    />
                                </div>
                            )}
                        </Card>

                        <div className="flex justify-center h-20 items-center">
                            {phase === 'prep' && (
                                <Button variant="ghost" onClick={() => { clearInterval(timerRef.current); startReading(); }} className="rounded-2xl text-slate-500 font-bold px-8 hover:bg-slate-100">
                                    Skip Timer
                                </Button>
                            )}

                            {phase === 'read' && (
                                <Button onClick={stopReading} className="bg-rose-500 hover:bg-rose-600 rounded-2xl h-16 w-48 shadow-lg shadow-rose-200 group text-lg font-bold transition-all relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay" />
                                    <Square size={20} fill="currentColor" className="mr-3" />
                                    Stop Recording
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}

                {phase === 'level_complete' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6 max-w-md mx-auto w-full pt-10"
                    >
                        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl w-24 h-24 mx-auto flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-50">
                            <CheckCircle size={48} />
                        </div>

                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Passage Recorded!</h2>
                        <p className="text-slate-500">Great job. Prepare for the next section.</p>

                        <div className="pt-8 flex justify-center gap-4">
                            {currentLevel < passages.length - 1 ? (
                                <Button onClick={handleNextLevel} className="bg-slate-900 hover:bg-indigo-600 h-14 text-base font-bold rounded-full shadow-lg transition-all flex items-center justify-center gap-2 px-10 w-auto text-white">
                                    Next Passage <ArrowRight size={18} />
                                </Button>
                            ) : (
                                <Button onClick={handleFinalize} className="bg-emerald-500 hover:bg-emerald-600 h-14 text-base font-bold rounded-full shadow-lg shadow-emerald-200 transition-all text-white flex items-center justify-center gap-2 px-10 w-auto">
                                    Submit Reading Section <ArrowRight size={18} />
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
