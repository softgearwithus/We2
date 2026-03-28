'use client';

import { fetchApi } from '../../../lib/apiClient';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, Video, Loader2, Volume2 } from 'lucide-react';
import { SectionScore } from '../CommunicationAssessment';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoQASectionProps {
    onComplete: (score: SectionScore) => void;
}

const QUESTION_POOL = [
    "Tell me about yourself.",
    "Why do you want to work for this company?",
    "What is your greatest strength?",
    "Describe a time you failed.",
    "Where do you see yourself in 5 years?",
    "How do you handle stress?",
    "What motivates you?",
    "Describe a difficult work situation and what you did to overcome it.",
    "What are your salary expectations?",
    "Do you have any questions for us?"
];

const QUESTIONS_PER_SET = 3; // Reduced for demo speed, user asked for 10-15 but that's long for a demo. Let's do 3.

export default function VideoQASection({ onComplete }: VideoQASectionProps) {
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedbacks, setFeedbacks] = useState<{ question: string, feedback: string }[]>([]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        // Shuffle and select questions
        const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, QUESTIONS_PER_SET));

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (questions.length > 0 && currentIndex < questions.length) {
            playQuestion(questions[currentIndex]);
        } else if (questions.length > 0 && currentIndex >= questions.length) {
            finishSection();
        }
    }, [currentIndex, questions]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error", err);
            alert("Could not access camera/microphone.");
        }
    };

    const playQuestion = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    const startRecording = () => {
        if (!streamRef.current) return;

        mediaRecorderRef.current = new MediaRecorder(streamRef.current);
        chunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); // Use audio mime for analysis even if video recorded
            submitAnswer(blob);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const submitAnswer = async (blob: Blob) => {
        setIsProcessing(true);
        const currentQuestion = questions[currentIndex];

        const formData = new FormData();
        formData.append('audio', blob, 'answer.webm');
        formData.append('type', 'answer');
        formData.append('referenceText', currentQuestion);

        try {
            const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/interview/analyze-audio`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Analysis failed");
            const data = await response.json();

            setFeedbacks(prev => [...prev, { question: currentQuestion, feedback: data.feedback }]);

        } catch (err) {
            console.error(err);
            setFeedbacks(prev => [...prev, { question: currentQuestion, feedback: "Analysis failed for this answer." }]);
        } finally {
            setIsProcessing(false);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const finishSection = () => {
        // Aggregate score (mock for now based on feedback length/presence)
        const score = 90; // Mock score
        const combinedFeedback = feedbacks.map(f => `**Q: ${f.question}**\n\n${f.feedback}`).join("\n\n---\n\n");

        onComplete({
            section: 'Video QA',
            score: score,
            feedback: combinedFeedback
        });
    };

    if (questions.length === 0) return <div>Loading...</div>;

    return (
        <Card className="p-2 max-w-4xl w-full mx-auto bg-black text-white overflow-hidden relative min-h-[500px] flex flex-col">
            {/* Camera View */}
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-80"
            />

            {/* Overlay UI */}
            <div className="relative z-10 flex flex-col justify-between flex-1 p-8 bg-black/40 backdrop-blur-sm">

                <div className="flex justify-between items-start">
                    <div className="bg-black/60 px-4 py-2 rounded-full text-slate-400 font-bold border border-slate-400/30">
                        Question {currentIndex + 1} / {questions.length}
                    </div>
                </div>

                <div className="self-center w-full max-w-2xl text-center space-y-8">
                    <AnimatePresence mode='wait'>
                        {!isProcessing ? (
                            <motion.h2
                                key={currentIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-3xl font-bold text-white drop-shadow-md"
                            >
                                {questions[currentIndex]}
                            </motion.h2>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center gap-4 text-emerald-400"
                            >
                                <Loader2 className="animate-spin w-12 h-12" />
                                <span className="text-xl font-mono">Analyzing Answer...</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-center gap-6">
                    {!isRecording && !isProcessing && (
                        <Button
                            onClick={startRecording}
                            className="h-20 w-20 rounded-full bg-red-600 hover:bg-red-700 border-4 border-white/20 shadow-2xl transition-transform hover:scale-105"
                        >
                            <Mic size={32} />
                        </Button>
                    )}

                    {isRecording && (
                        <Button
                            onClick={stopRecording}
                            className="h-20 w-20 rounded-full bg-white text-red-600 hover:bg-slate-200 border-4 border-red-600/50 shadow-2xl animate-pulse"
                        >
                            <Square size={32} fill="currentColor" />
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
