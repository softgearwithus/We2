
'use client';

import { fetchApi } from '../../lib/apiClient';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Lock, Map, Star } from 'lucide-react';
import { roadmapData } from '@/app/lib/data/roadmapData';
import API_BASE_URL from '@/app/lib/api-config';

export default function RoadmapPage() {
    const [expandedStep, setExpandedStep] = useState<string | null>(null);
    const [completedPhases, setCompletedPhases] = useState<string[]>([]);

    useEffect(() => {
        const loadProgress = async () => {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken() || '';
            if (!token) return;
            try {
                const response = await fetchApi(`${API_BASE_URL}/preparation/me/progress`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) return;
                const data = await response.json();
                const completed = Array.isArray(data.completedPhaseIds) ? data.completedPhaseIds : [];
                setCompletedPhases(completed);
            } catch (error) {
                console.error('Failed to load preparation progress', error);
            }
        };

        loadProgress();
    }, []);

    const progress = Math.min(100, Math.round((completedPhases.length / Math.max(roadmapData.length, 1)) * 100));
    const rawCurrentIndex = roadmapData.findIndex((step) => !completedPhases.includes(step.id));
    const currentStepIndex = rawCurrentIndex === -1 ? roadmapData.length - 1 : rawCurrentIndex;

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-full max-w-full max-w-[600px] h-[600px] bg-slate-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 max-w-5xl mx-auto p-6 lg:p-12">
                {/* Header */}
                <header className="mb-12">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-6 transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                                <Map className="text-brand-orange" size={40} />
                                Placement Roadmap
                            </h1>
                            <p className="text-lg text-slate-500 max-w-2xl">
                                Your gamified journey to your dream career. Track your milestones and unlock new levels.
                            </p>
                        </div>

                        {/* Overall Progress */}
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm min-w-full max-w-full max-w-[250px]">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-slate-700">Journey Progress</span>
                                <span className="text-sm font-bold text-slate-800">{progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-gradient-to-r from-brand-orange to-amber-500"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Vertical Timeline */}
                <div className="relative border-l-2 border-slate-200 ml-6 lg:ml-10 space-y-8 pb-12">
                    {roadmapData.map((step, index) => {
                        const isCompleted = completedPhases.includes(step.id);
                        const isCurrent = !isCompleted && index === currentStepIndex;
                        const isLocked = !isCompleted && index > currentStepIndex;
                        const isExpanded = expandedStep === step.id;

                        return (
                            <div key={step.id} className="relative pl-8 lg:pl-12">
                                {/* Icon Dot */}
                                <div className={`absolute -left-[21px] lg:-left-[25px] top-0 w-10 h-10 lg:w-12 lg:h-12 rounded-full border-4 flex items-center justify-center shadow-sm z-10 transition-colors duration-300
                                    ${isCompleted ? 'bg-emerald-500 border-emerald-100 text-white' :
                                        isCurrent ? 'bg-white border-slate-400 text-slate-800 ring-4 ring-slate-200' :
                                            'bg-slate-100 border-slate-50 text-slate-400'}
                                `}>
                                    {isCompleted ? <CheckCircle2 size={20} /> :
                                        isLocked ? <Lock size={18} /> :
                                            <step.icon size={20} />}
                                </div>

                                {/* Card */}
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden
                                        ${isCurrent ? 'border-slate-200 shadow-lg shadow-slate-200 ring-1 ring-slate-200' :
                                            isLocked ? 'border-slate-100 opacity-80' :
                                                'border-slate-100 shadow-sm hover:shadow-md'}
                                    `}
                                >
                                    {/* Card Header (Clickable) */}
                                    <div
                                        onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                                        className="p-6 cursor-pointer flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border
                                                        ${isCurrent ? 'bg-slate-50 text-slate-900 border-slate-200' :
                                                            isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                                'bg-slate-50 text-slate-500 border-slate-200'}
                                                    `}>
                                                        {isLocked ? 'Locked' : isCurrent ? 'In Progress' : 'Completed'}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-400">{step.timeframe}</span>
                                                </div>
                                                <h3 className={`text-xl font-bold ${isLocked ? 'text-slate-500' : 'text-slate-900'}`}>{step.title}</h3>
                                            </div>
                                        </div>

                                        <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-slate-50 text-slate-800' : 'bg-slate-50 text-slate-400'}`}>
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>

                                    {/* Expandable Content */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-slate-100 bg-slate-50/50"
                                            >
                                                <div className="p-6 pt-2">
                                                    <p className="text-slate-600 mb-6 text-sm leading-relaxed">{step.desc}</p>

                                                    <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                                                        <Star size={14} className="text-brand-orange fill-brand-orange" />
                                                        Key Topics
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {step.topics.map((topic, i) => (
                                                            <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                                <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-slate-500' : 'bg-slate-300'}`}></div>
                                                                <span className="text-sm font-medium text-slate-700">{topic.title}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {isCurrent && (
                                                        <div className="mt-8 flex justify-end">
                                                            <button className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-slate-200">
                                                                Continue Learning
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
