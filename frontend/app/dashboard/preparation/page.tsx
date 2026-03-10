'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    ChevronRight,
    Play,
    ShieldCheck,
    Brain,
    Crosshair,
    Sparkles,
    Layers,
    Code,
    BookOpen,
    Briefcase,
    MessageSquare,
    Zap
} from 'lucide-react';
import { roadmapData } from '@/app/lib/data/roadmapData';
import API_BASE_URL from '@/app/lib/api-config';

export default function PreparationPage() {
    const [completedPhases, setCompletedPhases] = useState<string[]>([]);
    const [isProgressLoaded, setIsProgressLoaded] = useState(false);

    useEffect(() => {
        const loadProgress = async () => {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken() || '';
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

    const progressPercent = Math.min(100, Math.round((completedPhases.length / Math.max(roadmapData.length, 1)) * 100));

    // Find the current active phase strictly based on completion status. If all complete, stays on last.
    const rawNextIndex = roadmapData.findIndex((step) => !completedPhases.includes(step.id));
    const currentIndex = rawNextIndex === -1 ? roadmapData.length - 1 : rawNextIndex;
    const currentPhase = roadmapData[currentIndex] || roadmapData[0];

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 pb-20">
            {/* Ambient Background */}
            <div className="absolute -top-32 right-0 w-[520px] h-[520px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[480px] h-[480px] bg-brand-orange/10 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-8 space-y-12">

                {/* Header */}
                <header className="flex flex-col gap-6">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors w-fit group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 bg-white/90 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                                <Sparkles size={12} /> Placement Mode Journey
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                                Placement Preparation <span className="text-brand-orange">.</span>
                            </h1>
                            <p className="text-lg text-slate-500 mt-4 leading-relaxed">
                                Master your engineering fundamentals, build scalable real-world projects, and conquer technical interviews step-by-step.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-4">
                                <Link href="/dashboard/preparation/test-series" className="group relative bg-indigo-600 text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-300 transition-all flex items-center gap-3 overflow-hidden">
                                    <span className="relative z-10">Explore Test Series</span>
                                    <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                    </div>
                </header>


                {/* Platform Guide + Optimized Schedule */}
                <section>
                    <div className="mb-8">
                        <h2 className="text-2xl font-extrabold text-slate-900">Daily Simulation Roadmap</h2>
                        <p className="text-slate-500 mt-2">Your daily engineered missions. Treat this like a live interview simulation.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Crosshair, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100',
                                title: 'AMCAT & MCQ Tests',
                                time: '60 mins',
                                target: '1 full mock section',
                                desc: 'Simulate high-pressure AMCAT standard testing environments utilizing our premium, curated question banks.',
                                link: '/dashboard/test-series'
                            },
                            {
                                icon: Code, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100',
                                title: 'DSA Logic Building',
                                time: '60 mins',
                                target: 'Solve ~10 questions',
                                desc: 'Focus on core logic building. Solve our expertly curated FAANG-level challenges within the integrated coding studio.',
                                link: '/dashboard/dsa'
                            },
                            {
                                icon: Layers, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-100',
                                title: 'SQL Architecture',
                                time: '45 mins',
                                target: 'Write 5-7 queries',
                                desc: 'Master complex joins and window functions utilizing our proprietary set of Top 50 Enterprise SQL patterns.',
                                link: '/dashboard/sql'
                            },
                            {
                                icon: Briefcase, color: 'text-brand-orange', bg: 'bg-orange-50', border: 'border-orange-100',
                                title: 'Project Lab Build',
                                time: '60 mins',
                                target: 'Commit 1 core feature',
                                desc: 'Hands-on development. Build scalable components to strengthen your startup & enterprise portfolio.',
                                link: '/dashboard/projects'
                            },
                            {
                                icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100',
                                title: 'Soft Skills & Radar',
                                time: '30 mins',
                                target: 'Audio Drill + Git',
                                desc: 'Sharpen your English fluency for cultural rounds and stay updated with backend/frontend market techs.',
                                link: '/dashboard/market-radar'
                            }
                        ].map((mission, idx) => (
                            <Link href={mission.link} key={idx} className="group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:ring-4 hover:ring-indigo-50 transition-all flex flex-col h-full overflow-hidden">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`w-14 h-14 rounded-2xl ${mission.bg} ${mission.color} border ${mission.border} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                        <mission.icon size={26} strokeWidth={2} />
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-center">
                                        <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">Duration</span>
                                        <span className="block text-sm font-extrabold text-slate-900">{mission.time}</span>
                                    </div>
                                </div>

                                <div className="flex-1 mb-6">
                                    <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 leading-tight">{mission.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{mission.desc}</p>
                                </div>

                                <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-1.5">
                                        <Crosshair size={12} className="text-slate-400 group-hover:text-brand-orange transition-colors" /> {mission.target}
                                    </span>
                                    <div className="w-10 h-10 flex shrink-0 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-600 group-hover:border-indigo-600 items-center justify-center transition-colors">
                                        <Play size={16} className="fill-slate-400 group-hover:fill-white group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Weekend Protocol */}
                    <div className="mt-6 bg-slate-900 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                                    <ShieldCheck size={28} className="text-brand-orange" />
                                </div>
                                <div className="max-w-2xl">
                                    <h4 className="text-xl font-extrabold flex items-center gap-2">Weekend Protocol <span className="text-xs font-bold bg-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-md tracking-widest uppercase">Sat & Sun</span></h4>
                                    <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">Shift focus from learning to executing. Perform 1 Mock Interview (90m), polish your projects, and review weak points before resetting for the week.</p>
                                </div>
                            </div>
                            <Link href="/dashboard/mock-interviews" className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 border border-indigo-400 font-bold text-sm transition-colors text-center whitespace-nowrap shadow-lg shadow-indigo-900/50">
                                Book Mock Interview
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
