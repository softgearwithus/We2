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
                                {/* Resume Test Series Wireframe Button */}
                                <Link href="/dashboard/test-series" className="group relative bg-white border border-indigo-100 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100/50 hover:bg-slate-50 hover:shadow-xl hover:shadow-indigo-200/50 hover:-translate-y-0.5 transition-all flex items-center gap-4 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 shadow-sm">
                                        <Play size={14} className="fill-current" />
                                    </div>
                                    <div className="relative z-10 flex flex-col text-left">
                                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400">In Progress</span>
                                        <span className="text-sm text-slate-800 group-hover:text-indigo-700 transition-colors">Resume Test Series</span>
                                    </div>
                                    <ChevronRight size={16} className="relative z-10 text-indigo-400 group-hover:translate-x-1 transition-transform ml-1" />
                                </Link>
                            </div>
                        </div>

                    </div>
                </header>


                {/* Platform Guide + Optimized Schedule */}
                <section>
                    <div className="mb-8">
                        <h2 className="text-2xl font-extrabold text-slate-900">The Placement Journey</h2>
                        <p className="text-slate-500 mt-2">Follow these 3 proven phases to secure your dream offer. Master one phase before moving to the next.</p>
                    </div>

                    <div className="space-y-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-indigo-100 hidden md:block"></div>

                        {[
                            {
                                phase: 'Phase 1',
                                title: 'The Foundation',
                                desc: 'Before writing complex scalable code, you need to master logic and data handling. This is where 90% of technical screening rounds focus.',
                                icon: Code, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100',
                                actions: [
                                    { name: 'DSA Logic Building', route: '/dashboard/dsa', target: 'Core Patterns' },
                                    { name: 'SQL Architecture', route: '/dashboard/sql', target: 'Master 5 Query Patterns' }
                                ]
                            },
                            {
                                phase: 'Phase 2',
                                title: 'Profile & Projects',
                                desc: 'Your resume gets you shortlisted. Build real-world proof of skill that speaks for itself and craft a narrative recruiters remember.',
                                icon: Layers, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100',
                                actions: [
                                    { name: 'Project Labs Build', route: '/dashboard/projects', target: 'Commit 1 Feature' },
                                    { name: 'Resume Builder', route: '/dashboard/resume', target: 'ATS Optimize UI' }
                                ]
                            },
                            {
                                phase: 'Phase 3',
                                title: 'Technical Round Validation',
                                desc: 'Perform under pressure. Simulate the exact environment of placement test links and technical 1:1 interviews.',
                                icon: Crosshair, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100',
                                actions: [
                                    { name: 'Technical Test Simulation', route: '/dashboard/test-series', target: '1 Full Mock Section' },
                                    { name: 'Mock Interview (1:1)', route: '/dashboard/interview', target: 'Schedule Session' }
                                ]
                            }
                        ].map((mission, idx) => (
                            <div key={idx} className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 group">
                                {/* Desktop Indicator */}
                                <div className="hidden md:flex flex-col items-center pt-6">
                                    <div className={`w-16 h-16 rounded-2xl ${mission.bg} ${mission.color} border ${mission.border} flex items-center justify-center shrink-0 shadow-sm z-10 relative group-hover:scale-110 group-hover:shadow-md transition-all`}>
                                        <mission.icon size={28} strokeWidth={2} />
                                    </div>
                                </div>

                                {/* Content Card */}
                                <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-transparent via-indigo-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    
                                    <div className="flex flex-col md:flex-row gap-8 justify-between">
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                {/* Mobile Icon */}
                                                <div className={`w-10 h-10 md:hidden rounded-xl ${mission.bg} ${mission.color} border ${mission.border} flex items-center justify-center shrink-0`}>
                                                    <mission.icon size={20} strokeWidth={2} />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 px-3 py-1 bg-indigo-50 rounded-full">{mission.phase}</span>
                                            </div>
                                            <h3 className="text-2xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors mb-3 leading-tight">{mission.title}</h3>
                                            <p className="text-[15px] text-slate-500 leading-relaxed max-w-xl">{mission.desc}</p>
                                        </div>

                                        <div className="w-full md:w-64 shrink-0 flex flex-col gap-3 justify-center">
                                            {mission.actions.map((act, actIdx) => (
                                                <Link href={act.route} key={actIdx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all group/btn">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 group-hover/btn:text-indigo-700 transition-colors">{act.name}</p>
                                                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">{act.target}</p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 group-hover/btn:bg-indigo-50 group-hover/btn:border-indigo-200 transition-colors">
                                                        <ChevronRight size={14} className="text-slate-400 group-hover/btn:text-indigo-600" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>


                </section>
            </div>
        </div>
    );
}
