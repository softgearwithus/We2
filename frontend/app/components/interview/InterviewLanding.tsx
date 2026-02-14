'use client';

import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InterviewLandingProps {
    onStart: () => void;
}

export default function InterviewLanding({ onStart }: InterviewLandingProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleStartInterview = async () => {
        setIsLoading(true);
        // Simulate API call to start session
        setTimeout(() => {
            setIsLoading(false);
            onStart();
        }, 1500);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            <div className="space-y-4 max-w-2xl">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    AI-Powered Mock Interviews
                </h1>
                <p className="text-lg text-slate-600">
                    Practice with our realistic AI interviewer. Get instant feedback on your answers,
                    body language, and tone. Master your soft skills before the real deal.
                </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md">
                <div className="mb-6 flex justify-center">
                    <div className="h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 animate-pulse">
                        <Play size={40} fill="currentColor" />
                    </div>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to Start?</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Ensure your camera and microphone are ready. The session will last approximately 15 minutes.
                </p>

                <button
                    onClick={handleStartInterview}
                    disabled={isLoading}
                    className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3
                        ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}
                    `}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={24} />
                            Initializing...
                        </>
                    ) : (
                        <>
                            <Play size={24} fill="currentColor" />
                            Start Interview Now
                        </>
                    )}
                </button>
            </div>

            <div className="flex gap-8 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Microphone Ready
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Camera Ready
                </div>
            </div>
        </div>
    );
}
