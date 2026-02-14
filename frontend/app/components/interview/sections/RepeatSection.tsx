'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, ArrowRight, Loader2, Volume2, Play } from 'lucide-react';
import { SectionScore } from '../CommunicationAssessment';

interface RepeatSectionProps {
    onComplete: (score: SectionScore) => void;
}

const SENTENCES = [
    "The quick brown fox jumps over the lazy dog.",
    "Communication is the key to professional success.",
    "Please submit your assignment by the end of the day."
];

export default function RepeatSection({ onComplete }: RepeatSectionProps) {
    const [step, setStep] = useState(0); // 0 to SENTENCES.length
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [feedbacks, setFeedbacks] = useState<string[]>([]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const playSentence = () => {
        setIsPlaying(true);
        const utterance = new SpeechSynthesisUtterance(SENTENCES[step]);
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
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
    };

    const handleNext = async () => {
        if (!audioBlob) return;
        setIsAnalyzing(true);

        // Analyze logic for current sentence
        const formData = new FormData();
        formData.append('audio', audioBlob, 'repeat.webm');
        formData.append('type', 'repeat');
        formData.append('referenceText', SENTENCES[step]);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/interview/analyze-audio`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Analysis failed");
            const data = await response.json();

            setFeedbacks(prev => [...prev, data.feedback]);
            setAudioBlob(null);

            if (step < SENTENCES.length - 1) {
                setStep(s => s + 1);
            } else {
                // Done
                onComplete({
                    section: 'Listening',
                    score: 80, // Mock for now
                    feedback: "Good listening skills, minor pronunciation errors." // Summary
                });
            }

        } catch (err) {
            console.error(err);
            alert("Analysis failed.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <Card className="p-8 max-w-2xl w-full mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 border-b pb-4">Part 2: Listen & Repeat</h2>
            <div className="flex justify-between text-sm text-slate-400">
                <span>Sentence {step + 1} of {SENTENCES.length}</span>
                <span>Listen carefully and repeat exactly.</span>
            </div>

            <div className="flex flex-col items-center justify-center py-12 gap-6 bg-slate-50 rounded-xl border border-slate-100">
                <Button
                    onClick={playSentence}
                    disabled={isPlaying || isRecording}
                    variant="outline"
                    className="h-16 w-16 rounded-full border-2 border-indigo-100 hover:border-indigo-500 hover:text-indigo-600 transition-all"
                >
                    {isPlaying ? <Volume2 className="animate-pulse" /> : <Play fill="currentColor" />}
                </Button>
                <p className="text-sm text-slate-400">Click to play audio</p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
                {!isRecording && !audioBlob && (
                    <Button onClick={startRecording} disabled={isPlaying} className="bg-red-500 hover:bg-red-600 rounded-full h-16 w-16 shadow-xl">
                        <Mic size={28} />
                    </Button>
                )}
                {isRecording && (
                    <Button onClick={stopRecording} className="bg-slate-800 hover:bg-slate-900 rounded-full h-16 w-16 shadow-xl animate-pulse">
                        <Square size={24} />
                    </Button>
                )}
                {audioBlob && !isAnalyzing && (
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setAudioBlob(null)}>Retry</Button>
                        <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700">
                            {step < SENTENCES.length - 1 ? 'Next Sentence' : 'Finish Section'} <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                )}
                {isAnalyzing && (
                    <Button disabled className="bg-indigo-400">
                        <Loader2 className="animate-spin mr-2" /> Analyzing...
                    </Button>
                )}
            </div>
        </Card>
    );
}
