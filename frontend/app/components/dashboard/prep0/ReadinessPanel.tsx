'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function ReadinessPanel({ readinessScore = 0 }: { readinessScore?: number }) {
    const score = Math.min(100, Math.max(0, Math.round(readinessScore)));
    const dashOffset = 440 - (440 * (score / 100));

    const quote =
        score >= 85
            ? 'You are no longer preparing for chance, you are preparing for responsibility.'
            : score >= 70
                ? 'Momentum is already on your side. Stay consistent and let discipline compound.'
                : score >= 50
                    ? 'Progress is built in quiet sessions. Keep showing up and your confidence will follow.'
                    : 'Every expert started as a beginner. Your comeback begins with today\'s next focused step.';

    const mantra =
        score >= 85
            ? 'Lead with clarity. Finish strong.'
            : score >= 70
                ? 'Consistency beats intensity.'
                : score >= 50
                    ? 'One session. One win. Repeat.'
                    : 'Small progress is still progress.';

    return (
        <div className="w-full bg-white border border-slate-100 rounded-3xl p-8 relative overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] group transition-all hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]">
            {/* Background Blob (Subtle) */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-50 rounded-full blur-[40px] group-hover:bg-indigo-100/50 transition-all duration-700"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Score Circle */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="#F1F5F9"
                            strokeWidth="10"
                            fill="transparent"
                        />
                        <motion.circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="#4F46E5" // Indigo-600
                            strokeWidth="10"
                            fill="transparent"
                            strokeDasharray="440"
                            initial={{ strokeDashoffset: 440 }}
                            animate={{ strokeDashoffset: dashOffset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{score}%</span>
                        <span className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-1">Ready</span>
                    </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Placement Readiness</h2>
                    <p className="text-slate-500 mb-6 max-w-md leading-relaxed text-sm lg:text-base">
                        "{quote}"
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100 shadow-sm">
                            <Sparkles size={18} className="text-indigo-600" />
                            <span className="text-sm text-indigo-700 font-bold">{mantra}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100 shadow-sm">
                            <span className="text-sm text-amber-700 font-bold">Own your preparation. Own your result.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
