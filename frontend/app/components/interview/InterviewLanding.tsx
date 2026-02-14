'use client';

import { useState } from 'react';
import { Play, Loader2, Mic, Video, ArrowRight } from 'lucide-react';
import AudioInterview from './AudioInterview';
import PreInterviewInstructions from './PreInterviewInstructions';
import InterviewSession from './InterviewSession';

interface InterviewLandingProps {
    onStart: () => void;
}

type Mode = 'landing' | 'audio' | 'instructions' | 'video_session';

export default function InterviewLanding({ onStart }: InterviewLandingProps) {
    const [mode, setMode] = useState<Mode>('landing');
    const [isLoading, setIsLoading] = useState(false);

    const handleStartVideoFlow = () => {
        setMode('instructions');
    };

    const handleStartAudioFlow = () => {
        setMode('audio');
    };

    const startVideoSession = () => {
        setIsLoading(true);
        // Simulate initialization
        setTimeout(() => {
            setIsLoading(false);
            setMode('video_session');
        }, 1500);
    };

    if (mode === 'audio') {
        return <AudioInterview onBack={() => setMode('landing')} />;
    }

    if (mode === 'instructions') {
        return <PreInterviewInstructions onStart={startVideoSession} onBack={() => setMode('landing')} />;
    }

    if (mode === 'video_session') {
        return <InterviewSession onEnd={() => setMode('landing')} />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12">
            <div className="space-y-6 max-w-3xl">
                <div className="inline-flex items-center justify-center p-2 px-4 bg-indigo-50 rounded-full text-indigo-600 text-sm font-bold mb-4 border border-indigo-100">
                    ✨ Now with AI Audio Analysis
                </div>
                <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Master Your Interview Skills
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mt-2">
                        With Real-Time AI Feedback
                    </span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    Choose your path to perfection. Practice with our audio-focused drills or simulate a full pressure video interview environment.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
                {/* Audio Mode Card */}
                <div className="group relative p-8 bg-white rounded-3xl border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="h-20 w-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                            <Mic size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Audio Drill</h3>
                        <p className="text-slate-500 mb-8 text-sm">
                            Focus on your verbal delivery. Answer rapid-fire questions and get instant analysis on your tone and clarity.
                        </p>
                        <button
                            onClick={handleStartAudioFlow}
                            className="w-full py-3 rounded-xl bg-white text-indigo-600 font-bold border-2 border-indigo-100 group-hover:border-indigo-600 transition-all flex items-center justify-center gap-2"
                        >
                            Start Audio Practice <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Video Mode Card */}
                <div className="group relative p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="h-20 w-20 bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform shadow-inner shadow-black/50">
                            <Video size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Live Video Sim</h3>
                        <p className="text-slate-400 mb-8 text-sm">
                            The full experience. Test your body language, eye contact, and nerve in a realistic face-to-face AI interview.
                        </p>
                        <button
                            onClick={handleStartVideoFlow}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg group-hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> initializing...
                                </>
                            ) : (
                                <>
                                    Enter Simulation <Play size={16} fill="currentColor" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-8 text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    AI Models Online
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    Gemini Flash 1.5 Ready
                </div>
            </div>
        </div>
    );
}
