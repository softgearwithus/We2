import { useState, useEffect, useRef } from 'react';
import { startInterviewSession, sendInterviewMessage, endInterviewSession } from '../lib/interview.service';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
    length: number;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: Event) => void;
    onend: () => void;
}

export type InterviewStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'completed';

export interface Message {
    id: string;
    sender: 'ai' | 'user';
    text: string;
    timestamp: Date;
}

export function useInterview() {
    const [status, setStatus] = useState<InterviewStatus>('idle');
    const [messages, setMessages] = useState<Message[]>([]);
    const [interviewId, setInterviewId] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);

    // Initialize Speech APIs
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Speech Recognition (STT)
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-US';

                recognition.onresult = (event: SpeechRecognitionEvent) => {
                    const transcript = event.results[0][0].transcript;
                    handleUserResponse(transcript);
                };

                recognition.onerror = (event: any) => {
                    // Ignore "no speech" errors to avoid loop breaking
                    if (event.error !== 'no-speech') {
                        console.error('Speech recognition error', event.error);
                    }
                    if (status === 'listening') {
                        // Restart if we were supposed to be listening
                        // setTimeout(() => startListening(), 100);
                    }
                };

                recognitionRef.current = recognition;
            }

            // Speech Synthesis (TTS)
            if ('speechSynthesis' in window) {
                synthesisRef.current = window.speechSynthesis;
            }
        }
    }, [status]); // Re-bind if status changes? No, just once.

    const startInterview = async () => {
        setStatus('processing');
        setMessages([]);
        try {
            const session = await startInterviewSession();
            setInterviewId(session.id);

            // Initial Greeting (Manual trigger or from backend? Let's manually trigger for now)
            const initialGreeting = "Hello! I'm your AI Interviewer. Could you please introduce yourself?";
            speakAI(initialGreeting);
        } catch (error) {
            console.error("Failed to start interview", error);
            setStatus('idle');
        }
    };

    const speakAI = (text: string) => {
        setStatus('speaking');

        const newMessage: Message = {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);

        if (synthesisRef.current) {
            // Cancel any ongoing speech
            synthesisRef.current.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => {
                setStatus('listening');
                startListening();
            };
            synthesisRef.current.speak(utterance);
        } else {
            // Fallback
            setTimeout(() => {
                setStatus('listening');
                startListening();
            }, 2000);
        }
    };

    const startListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e: any) {
                if (e.name !== 'InvalidStateError') {
                    console.error("Speech recognition error", e);
                }
            }
        }
    };

    const handleUserResponse = async (text: string) => {
        if (!interviewId) return;
        setStatus('processing');

        const userMsg: Message = {
            id: crypto.randomUUID(),
            sender: 'user',
            text: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);

        try {
            // Call Backend API
            const response = await sendInterviewMessage(interviewId, text);
            speakAI(response.text);
        } catch (error) {
            console.error("Error sending message", error);
            // Retry or inform user?
        }
    };

    const endInterview = async () => {
        if (interviewId) {
            try {
                await endInterviewSession(interviewId);
            } catch (e) {
                console.error(e);
            }
        }
        setStatus('completed');
        const endMsg: Message = {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: "Interview ended. Thank you.",
            timestamp: new Date()
        };
        setMessages(prev => [...prev, endMsg]);

        if (synthesisRef.current) {
            synthesisRef.current.cancel();
            synthesisRef.current.speak(new SpeechSynthesisUtterance(endMsg.text));
        }
    };

    return {
        status,
        messages,
        currentQuestion: "", // Deprecated in favor of dynamic chat
        startInterview,
        endInterview
    };
}
