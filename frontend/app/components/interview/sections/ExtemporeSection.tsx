'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, ArrowRight, Loader2 } from 'lucide-react';
import { SectionScore } from '../CommunicationAssessment';

interface ExtemporeSectionProps {
    onComplete: (score: SectionScore) => void;
    topicContent: { topic: string, keyPoints: string[] };
    previousRecordings?: {
        reading?: { level: number, blob: Blob, text: string }[];
        listening?: { index: number, blob: Blob, text: string }[];
    };
}

export default function ExtemporeSection({ onComplete, topicContent, previousRecordings }: ExtemporeSectionProps) {
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

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error(err);
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

    const handleSubmit = async () => {
        if (!audioBlob) return;

        onComplete({
            section: 'Extempore',
            score: 0,
            feedback: "",
            data: { topic: topicContent.topic, blob: audioBlob }
        });
    };

    return (
        <Card className="p-8 max-w-2xl w-full mx-auto space-y-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800 border-b pb-4">Part 3: Extempore</h2>

            {phase === 'prep' && (
                <div className="space-y-6">
                    <p className="text-slate-500">Prepare to speak on the following topic. Recording starts automatically in:</p>
                    <div className="text-6xl font-bold text-indigo-600 font-mono">{timeLeft}s</div>
                    <Card className="p-6 bg-indigo-50 border-indigo-100">
                        <h3 className="text-xl font-bold text-slate-800">"{topicContent.topic}"</h3>
                        {topicContent.keyPoints && (
                            <div className="mt-4 text-left">
                                <p className="text-sm font-semibold text-slate-500 mb-2">Key Points to Cover:</p>
                                <ul className="list-disc pl-5 text-sm text-slate-600">
                                    {topicContent.keyPoints.map((kp, i) => <li key={i}>{kp}</li>)}
                                </ul>
                            </div>
                        )}
                    </Card>
                    <Button onClick={() => { clearInterval(timerRef.current); handleTimerEnd(); }} variant="outline">Skip Prep</Button>
                </div>
            )}

            {phase === 'speak' && (
                <div className="space-y-6">
                    <p className="text-slate-500">Recording... Speak on the topic!</p>
                    <Card className="p-6 bg-indigo-50 border-indigo-100 mb-6">
                        <h3 className="text-xl font-bold text-slate-800">"{topicContent.topic}"</h3>
                    </Card>
                    <div className="relative h-32 w-32 mx-auto flex items-center justify-center">
                        <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
                        <div className="relative bg-white rounded-full h-full w-full flex items-center justify-center border-4 border-red-500 text-red-600 font-bold text-3xl font-mono">
                            {timeLeft}s
                        </div>
                    </div>
                    <Button onClick={stopRecording} className="bg-red-600 hover:bg-red-700 w-full max-w-xs">Stop Recording</Button>
                </div>
            )}

            {phase === 'review' && (
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900">Drill Complete</h3>
                        <p className="text-slate-500 text-sm">Review all your recordings before submitting for final analysis.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-left max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {/* 1. Reading Preview */}
                        {previousRecordings?.reading && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" /> Part 1: Reading
                                </h4>
                                {previousRecordings.reading.map((r, i) => (
                                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                                        <p className="text-[10px] text-slate-400 font-medium">Passage {i + 1}</p>
                                        <audio controls src={URL.createObjectURL(r.blob)} className="h-8 w-full" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 2. Listening Preview */}
                        {previousRecordings?.listening && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" /> Part 2: Listening
                                </h4>
                                {previousRecordings.listening.map((l, i) => (
                                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                                        <p className="text-[10px] text-slate-400 font-medium">Sentence {i + 1}</p>
                                        <audio controls src={URL.createObjectURL(l.blob)} className="h-8 w-full" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 3. Extempore Preview */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-pink-600 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-pink-600 rounded-full" /> Part 3: Extempore
                            </h4>
                            <div className="block p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                {audioBlob && <audio controls src={URL.createObjectURL(audioBlob)} className="h-10 w-full" />}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-slate-100">
                        <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl h-12">
                            Retry Drill
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!audioBlob}
                            className="bg-indigo-600 hover:bg-indigo-700 h-12 text-lg shadow-lg shadow-indigo-100 rounded-xl flex-1 max-w-sm"
                        >
                            Generate Final Report <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
