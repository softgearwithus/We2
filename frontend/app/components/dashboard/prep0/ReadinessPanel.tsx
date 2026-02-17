'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, Zap } from 'lucide-react';

export default function ReadinessPanel() {
    return (
        <div className="w-full bg-white border border-slate-100 rounded-3xl p-8 relative overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] group transition-all hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]">
            {/* Background Blob (Subtle) */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] group-hover:bg-indigo-100/50 transition-all duration-700"></div>

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
                            animate={{ strokeDashoffset: 440 - (440 * 0.72) }} // 72%
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-4xl font-extrabold text-slate-900 tracking-tight">72%</span>
                        <span className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-1">Ready</span>
                    </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Placement Readiness</h2>
                    <p className="text-slate-500 mb-6 max-w-md leading-relaxed text-sm lg:text-base">
                        Your profile is stronger than <span className="text-indigo-600 font-bold">85%</span> of candidates.
                        Your focus should be on <span className="text-slate-900 font-semibold border-b-2 border-indigo-200 border-dashed">Dynamic Programming</span>.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100 shadow-sm">
                            <TrendingUp size={18} className="text-emerald-600" />
                            <span className="text-sm text-emerald-700 font-bold">+12% Gain</span>
                        </div>
                        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100 shadow-sm">
                            <Zap size={18} className="text-indigo-600" />
                            <span className="text-sm text-indigo-700 font-bold">Top 500</span>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-slate-200 hover:shadow-slate-300 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2 group/btn">
                    View Analysis <TrendingUp size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
