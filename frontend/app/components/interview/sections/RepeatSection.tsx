'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, ArrowRight, Volume2, Play } from 'lucide-react';
import { SectionScore } from '../CommunicationAssessment';

interface RepeatSectionProps {
    onComplete: (score: SectionScore) => void;
    sentences: string[];
}

export default function RepeatSection({ onComplete, sentences }: RepeatSectionProps) {
    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // State to store recordings
    const [recordings, setRecordings] = useState<{ index: number, blob: Blob, text: string }[]>([]);

    const playSentence = () => {
        setIsPlaying(true);
        const utterance = new SpeechSynthesisUtterance(sentences[step]);
        utterance.rate = 0.9; // Slightly slower for clarity
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

        const currentRecording = { index: step, blob: audioBlob, text: sentences[step] };
        const updatedRecordings = [...recordings, currentRecording];

        setRecordings(updatedRecordings);
        setAudioBlob(null);

        if (step < sentences.length - 1) {
            setStep(s => s + 1);
        } else {
            console.log("Listening Section Complete: Sending", updatedRecordings.length, "recordings");
            onComplete({
                section: 'Listening',
                score: 0,
                feedback: "",
                data: updatedRecordings
            });
        }
    };

    return (
        <Card className="p-8 max-w-2xl w-full mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 border-b pb-4">Part 2: Listen & Repeat</h2>
            <div className="flex justify-between text-sm text-slate-400">
                <span>Sentence {step + 1} of {sentences.length}</span>
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
                {audioBlob && (
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setAudioBlob(null)}>Retry</Button>
                        <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700">
                            {step < sentences.length - 1 ? 'Next Sentence' : 'Finish Section'} <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}
