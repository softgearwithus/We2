'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    CheckCircle2,
    Lock,
    ChevronRight,
    Play,
    SkipForward,
    ShieldCheck,
    Brain,
    Crosshair,
    Sparkles,
    Zap,
} from 'lucide-react';
import { roadmapData } from '@/app/lib/data/roadmapData';
import API_BASE_URL from '@/app/lib/api-config';

export default function PreparationPage() {
    // State to track completed phases. Default: Phase 1 is unlocked (so 0 completed).
    const [completedPhases, setCompletedPhases] = useState<string[]>([]);
    const [isProgressLoaded, setIsProgressLoaded] = useState(false);

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
            setCompletedPhases((prev) => [...prev, id]);
        }
    };

    useEffect(() => {
        const loadProgress = async () => {
            const token = localStorage.getItem('accessToken') || '';
            if (!token) {
                setIsProgressLoaded(true);
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/preparation/me/progress`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) return;
                const data = await response.json();
                const completed = Array.isArray(data.completedPhaseIds) ? data.completedPhaseIds : [];
                setCompletedPhases(completed);
            } catch (error) {
                console.error('Failed to load preparation progress', error);
            } finally {
                setIsProgressLoaded(true);
            }
        };

        loadProgress();
    }, []);

    useEffect(() => {
        const persistProgress = async () => {
            if (!isProgressLoaded) return;
            const token = localStorage.getItem('accessToken') || '';
            if (!token) return;
            try {
                await fetch(`${API_BASE_URL}/preparation/me/progress`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ completedPhaseIds: completedPhases }),
                });
            } catch (error) {
                console.error('Failed to update preparation progress', error);
            }
        };

        persistProgress();
    }, [completedPhases, isProgressLoaded]);

    const progressPercent = Math.min(100, Math.round((completedPhases.length / Math.max(roadmapData.length, 1)) * 100));
    const currentIndex = roadmapData.findIndex((_, index) => !isLocked(index) && !completedPhases.includes(roadmapData[index].id));
    const currentPhase = roadmapData[currentIndex] || roadmapData[0];

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            {/* Ambient Background */}
            <div className="absolute -top-32 right-0 w-[520px] h-[520px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[480px] h-[480px] bg-brand-orange/10 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="relative z-10 max-w-6xl mx-auto p-6 lg:p-12 space-y-10">
                {/* Header */}
                <header className="flex flex-col gap-8">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-8 items-start">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/90 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                <Sparkles size={12} /> Placement Mode Journey
                            </div>
                            <h1 className="mt-4 text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
                                Placement Preparation <span className="text-brand-orange">.</span>
                            </h1>
                            <p className="text-lg text-slate-500 mt-3 max-w-2xl">
                                A structured, milestone-based path mapped to your dashboard. Track progress, unlock phases, and ship outcomes each week.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-4">
                                <Link href="/dashboard/preparation/test-series" className="group relative bg-indigo-600 text-white px-7 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-300 transition-all flex items-center gap-3 overflow-hidden">
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <span className="relative">Explore Test Series</span>
                                    <ChevronRight size={18} className="relative group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href={`/dashboard/preparation/${currentPhase?.id || roadmapData[0].id}`} className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 font-bold text-sm hover:border-indigo-200 hover:text-indigo-700 transition-colors">
                                    Continue Phase <Play size={16} className="fill-current" />
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_15px_45px_-20px_rgba(15,23,42,0.35)]">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Placement Status</p>
                                    <h2 className="text-2xl font-extrabold text-slate-900 mt-2">{progressPercent}% Complete</h2>
                                    <p className="text-sm text-slate-500 mt-1">Phase {Math.max(currentIndex + 1, 1)} in progress</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <ShieldCheck size={22} />
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400" style={{ width: `${progressPercent}%` }} />
                                </div>
                                <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                                    <div className="bg-slate-50 rounded-xl px-3 py-2">
                                        <p className="text-slate-400 font-bold uppercase">Phases Done</p>
                                        <p className="text-slate-900 font-extrabold text-lg">{completedPhases.length}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl px-3 py-2">
                                        <p className="text-slate-400 font-bold uppercase">Active Phase</p>
                                        <p className="text-slate-900 font-extrabold text-lg">{currentPhase?.title.split(':')[0] || 'Phase 1'}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl px-3 py-2">
                                        <p className="text-slate-400 font-bold uppercase">Fast Track</p>
                                        <p className="text-slate-900 font-extrabold text-lg">{currentPhase?.fastTrack || '2 Weeks'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Milestones */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: 'Daily Focus', desc: '2-hour sprint with DSA + SQL drills.', icon: Brain, color: 'bg-indigo-50 text-indigo-600' },
                        { title: 'Weekly Outcome', desc: 'Ship one project or lab submission.', icon: Crosshair, color: 'bg-emerald-50 text-emerald-600' },
                        { title: 'Mock Cycle', desc: '1 interview + analysis loop.', icon: Zap, color: 'bg-orange-50 text-brand-orange' },
                    ].map((item) => (
                        <div key={item.title} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                                <item.icon size={18} />
                            </div>
                            <h3 className="mt-4 text-sm font-bold text-slate-900">{item.title}</h3>
                            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                        </div>
                    ))}
                </section>

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
