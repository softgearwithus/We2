'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, ArrowRight, Volume2, Play, CheckCircle } from 'lucide-react';
import { SectionScore } from '../CommunicationAssessment';
import { motion, AnimatePresence } from 'framer-motion';

interface RepeatSectionProps {
    onComplete: (score: SectionScore) => void;
    sentences: string[];
    globalStream: MediaStream;
}

export default function RepeatSection({ onComplete, sentences, globalStream }: RepeatSectionProps) {
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
    };

    const handleNext = () => {
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
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4 md:p-6 pb-20">
            <AnimatePresence mode="wait">
                <motion.div
                    key={`step-${step}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full space-y-8"
                >
                    <div className="text-center space-y-4 mb-8">
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl w-20 h-20 mx-auto flex items-center justify-center text-slate-800 shadow-xl shadow-slate-50 mb-6">
                            <Volume2 size={40} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Listening</h2>
                        <div className="flex justify-center items-center gap-3 text-sm text-slate-500 font-bold uppercase tracking-wider">
                            <span className="bg-slate-100 px-4 py-2 rounded-xl text-slate-700">Phrase {step + 1} of {sentences.length}</span>
                            <span>Listen carefully and repeat</span>
                        </div>
                    </div>

                    <Card className="p-8 md:p-12 bg-white border-slate-200 shadow-xl shadow-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[300px] space-y-10 relative overflow-hidden">

                        {/* Audio Playback Controls */}
                        <div className="relative group">
                            <div className={`absolute -inset-4 bg-slate-500 rounded-full blur-xl opacity-0 transition-opacity duration-500 ${isPlaying ? 'opacity-20 animate-pulse' : 'group-hover:opacity-10'}`} />
                            <Button
                                onClick={playSentence}
                                disabled={isPlaying || isRecording}
                                className={`relative h-24 w-24 rounded-full border-[6px] shadow-2xl transition-all duration-300 flex items-center justify-center ${isPlaying
                                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                                    : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800 hover:border-slate-500 hover:scale-105'
                                    }`}
                            >
                                {isPlaying ? <Volume2 size={36} className="animate-bounce" /> : <Play size={36} fill="currentColor" className="ml-2" />}
                            </Button>
                        </div>

                        <div className="text-center">
                            <p className="text-slate-500 font-medium">
                                {isPlaying ? 'Listen closely...' : 'Click to play the phrase'}
                            </p>
                        </div>

                        {/* Recording Controls */}
                        <div className="flex flex-col items-center justify-center gap-4 pt-6 w-full border-t border-slate-100">
                            {!isRecording && !audioBlob && (
                                <Button
                                    onClick={startRecording}
                                    disabled={isPlaying}
                                    className="bg-rose-500 hover:bg-rose-600 rounded-2xl h-16 px-8 shadow-lg shadow-rose-200 text-lg font-bold group w-48 disabled:opacity-50"
                                >
                                    <Mic size={20} className="mr-3 group-hover:scale-110 transition-transform" /> Start Speaking
                                </Button>
                            )}

                            {isRecording && (
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="flex gap-1.5 h-6 items-center">
                                        {[...Array(6)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1.5 bg-rose-500 rounded-full"
                                                animate={{ height: ['4px', '20px', '8px', '24px', '4px'] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                                            />
                                        ))}
                                    </div>
                                    <Button
                                        onClick={stopRecording}
                                        className="bg-slate-900 border-2 border-slate-800 hover:bg-rose-600 hover:border-rose-500 rounded-2xl h-16 px-8 shadow-xl text-lg font-bold transition-all w-48"
                                    >
                                        <Square size={20} fill="currentColor" className="mr-3" /> Stop Recording
                                    </Button>
                                </div>
                            )}

                            {audioBlob && (
                                <div className="flex flex-col items-center w-full space-y-6">
                                    <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-full font-bold">
                                        <CheckCircle size={20} /> Audio captured successfully
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-6">
                                        <Button variant="outline" onClick={() => setAudioBlob(null)} className="rounded-full h-14 w-full sm:w-auto px-10 font-bold text-slate-600 border-slate-200">
                                            Retry
                                        </Button>
                                        <Button onClick={handleNext} className="bg-slate-900 hover:bg-slate-800 rounded-full h-14 w-full sm:w-auto px-10 font-bold text-base shadow-lg hover:shadow-slate-200 transition-all text-white flex items-center justify-center gap-2">
                                            {step < sentences.length - 1 ? 'Next Phrase' : 'Submit Listening Section'} <ArrowRight size={18} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
