'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, ArrowRight, Loader2, Timer } from 'lucide-react';
import { SectionScore } from '../CommunicationAssessment';
import { motion } from 'framer-motion';

interface ExtemporeSectionProps {
    onComplete: (score: SectionScore) => void;
}

const TOPICS = [
    "The impact of social media on society",
    "Remote work vs Office work",
    "Is AI a threat to human jobs?",
    "The importance of continuous learning"
];

export default function ExtemporeSection({ onComplete }: ExtemporeSectionProps) {
    const [topic, setTopic] = useState("");
    const [phase, setPhase] = useState<'prep' | 'speak' | 'review'>('prep');
    const [timeLeft, setTimeLeft] = useState(30); // 30s prep, 60s speak

    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        setTopic(TOPICS[Math.floor(Math.random() * TOPICS.length)]);
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
            startRecording(); // Auto start recording? Maybe better to let user click or auto-start. Let's auto-start for pressure.
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
        clearInterval(timerRef.current); // Stop timer if manually stopped
        setPhase('review');
    };

    const handleSubmit = async () => {
        if (!audioBlob) return;
        setIsAnalyzing(true);

        const formData = new FormData();
        formData.append('audio', audioBlob, 'extempore.webm');
        formData.append('type', 'extempore');
        formData.append('referenceText', topic);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/interview/analyze-audio`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Analysis failed");
            const data = await response.json();

            onComplete({
                section: 'Extempore',
                score: 88, // Mock
                feedback: data.feedback
            });

        } catch (err) {
            console.error(err);
            alert("Analysis failed.");
            setIsAnalyzing(false);
        }
    };

    return (
        <Card className="p-8 max-w-2xl w-full mx-auto space-y-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800 border-b pb-4">Part 3: Extempore</h2>

            {phase === 'prep' && (
                <div className="space-y-6">
                    <p className="text-slate-500">Prepare to speak on the following topic. Recording starts automatically in:</p>
                    <div className="text-6xl font-bold text-indigo-600 font-mono">{timeLeft}s</div>
                    <Card className="p-6 bg-indigo-50 border-indigo-100">
                        <h3 className="text-xl font-bold text-slate-800">"{topic}"</h3>
                    </Card>
                    <Button onClick={() => { clearInterval(timerRef.current); handleTimerEnd(); }} variant="outline">Skip Prep</Button>
                </div>
            )}

            {phase === 'speak' && (
                <div className="space-y-6">
                    <p className="text-slate-500">Recording... Speak on the topic!</p>
                    <Card className="p-6 bg-indigo-50 border-indigo-100 mb-6">
                        <h3 className="text-xl font-bold text-slate-800">"{topic}"</h3>
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
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-800">Recording Complete</h3>
                    <p className="text-slate-500">Ready to submit your speech for analysis?</p>
                    {audioBlob && <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />}

                    <div className="flex justify-center gap-4 pt-4">
                        <Button variant="outline" onClick={() => window.location.reload()}>Retry (New Topic)</Button>
                        <Button onClick={handleSubmit} disabled={isAnalyzing} className="bg-indigo-600 hover:bg-indigo-700">
                            {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="mr-2" />}
                            {isAnalyzing ? 'Analyzing...' : 'Generate Final Report'}
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
