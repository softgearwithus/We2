'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Lock, ChevronRight, ExternalLink, Play, SkipForward } from 'lucide-react';
import { roadmapData } from '@/app/lib/data/roadmapData';

export default function PreparationPage() {
    // State to track completed phases. Default: Phase 1 is unlocked (so 0 completed).
    const [completedPhases, setCompletedPhases] = useState<string[]>([]);

    // Helper to check if a phase is locked
    const isLocked = (index: number) => {
        // Phase 0 is always unlocked.
        if (index === 0) return false;
        // Phase N is unlocked if Phase N-1 is completed.
        const previousPhaseId = roadmapData[index - 1].id;
        return !completedPhases.includes(previousPhaseId);
    };

    const handleSkip = (id: string) => {
        if (!completedPhases.includes(id)) {
            setCompletedPhases([...completedPhases, id]);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 max-w-5xl mx-auto p-6 lg:p-12">
                {/* Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors group">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                            Placement Preparation <span className="text-brand-orange">.</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl">
                            Your interactive path to success. Complete or skip phases to unlock the next steps.
                        </p>
                    </div>
                    <Link href="/dashboard/preparation/test-series" className="group relative bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-300 transition-all flex items-center gap-3 overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative">Explore Test Series</span>
                        <ChevronRight size={20} className="relative group-hover:translate-x-1 transition-transform" />
                    </Link>
                </header>

                {/* Timeline */}
                <div className="relative border-l-2 border-slate-200 ml-6 lg:ml-10 space-y-12 pb-12">
                    {roadmapData.map((step, index) => {
                        const locked = isLocked(index);
                        const completed = completedPhases.includes(step.id);
                        const current = !locked && !completed;

                        return (
                            <div key={step.id} className={`relative pl-8 lg:pl-12 transition-opacity duration-500 ${locked ? 'opacity-60 grayscale-[0.8] blur-[1px] hover:blur-0 hover:grayscale-0 hover:opacity-100' : 'opacity-100'}`}>
                                {/* Icon Dot */}
                                <div className={`absolute -left-[21px] lg:-left-[25px] top-0 w-10 h-10 lg:w-12 lg:h-12 rounded-full border-4 border-slate-50 flex items-center justify-center bg-white shadow-sm z-10
                                    ${completed ? 'bg-emerald-500 text-white shadow-emerald-200' : ''}
                                    ${current ? 'bg-brand-orange text-white shadow-orange-200 ring-4 ring-orange-100' : ''}
                                    ${locked ? 'bg-slate-100 text-slate-400' : ''}
                                `}>
                                    {locked ? <Lock size={18} /> : (completed ? <CheckCircle2 size={20} /> : <step.icon size={20} />)}
                                </div>

                                {/* Content Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all group relative overflow-hidden
                                        ${current ? 'ring-2 ring-brand-orange/10' : ''}
                                    `}
                                >
                                    {current && <div className="absolute top-0 right-0 px-3 py-1 bg-brand-orange text-white text-xs font-bold rounded-bl-xl">CURRENT STEP</div>}

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border
                                                    ${completed ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                                                    ${current ? 'bg-orange-50 text-brand-orange border-orange-100' : ''}
                                                    ${locked ? 'bg-slate-100 text-slate-500 border-slate-200' : ''}
                                                `}>
                                                    {step.timeframe}
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                    Fast Track: <span className="text-slate-700">{step.fastTrack}</span>
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900">{step.title}</h3>
                                            <p className="text-slate-500 text-sm mt-1">{step.desc}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 flex flex-wrap items-center gap-4">
                                        {locked ? (
                                            <button disabled className="bg-slate-100 text-slate-400 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-not-allowed">
                                                <Lock size={16} /> Locked
                                            </button>
                                        ) : (
                                            <>
                                                <Link href={`/dashboard/preparation/${step.id}`} className={`px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95 flex items-center gap-2
                                                    ${current ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'}
                                                `}>
                                                    {completed ? 'Review Content' : 'Start Learning'} <Play size={16} className={completed ? "" : "fill-current"} />
                                                </Link>

                                                {!completed && (
                                                    <button
                                                        onClick={() => handleSkip(step.id)}
                                                        className="text-slate-400 hover:text-slate-600 text-sm font-semibold flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                                                    >
                                                        Already covered? Skip <SkipForward size={14} />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
