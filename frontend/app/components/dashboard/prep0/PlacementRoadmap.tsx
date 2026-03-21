'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Code, Layers, MessageSquare, Briefcase, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { roadmapData } from '@/app/lib/data/roadmapData';
import API_BASE_URL from '@/app/lib/api-config';

export default function PlacementRoadmap() {
    const [completedPhases, setCompletedPhases] = useState<string[]>([]);

    useEffect(() => {
        const loadProgress = async () => {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken() || '';
            if (!token) return;
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
            }
        };

        loadProgress();
    }, []);

    const currentIndex = roadmapData.findIndex((phase) => !completedPhases.includes(phase.id));
    const resolvedCurrentIndex = currentIndex === -1 ? roadmapData.length - 1 : currentIndex;
    const steps = roadmapData.map((phase, index) => {
        const status = completedPhases.includes(phase.id)
            ? 'completed'
            : index === resolvedCurrentIndex
                ? 'current'
                : index > resolvedCurrentIndex
                    ? 'locked'
                    : 'upcoming';
        return {
            title: phase.title.replace(/^Phase\s*\d+:\s*/i, ''),
            desc: phase.desc,
            icon: phase.icon,
            status,
        };
    });
    return (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-1 h-6 bg-brand-orange rounded-full"></span>
                        Placement Journey
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Your step-by-step path to dream companies</p>
                </div>
                <Link href="/dashboard/roadmap" className="text-slate-800 font-bold text-sm hover:underline flex items-center gap-1">
                    View Full Roadmap <ArrowRight size={16} />
                </Link>
            </div>

            <div className="relative px-2">
                {/* Connecting Line (Desktop) */}
                <div className="absolute top-6 left-0 w-full h-1 bg-slate-100 -z-0 hidden md:block rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.round((completedPhases.length / Math.max(roadmapData.length, 1)) * 100))}%` }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-brand-orange"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center text-center group cursor-pointer">
                            {/* Icon Circle */}
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 mb-4 transition-all duration-300 relative bg-white
                                    ${step.status === 'completed' ? 'border-emerald-500 text-emerald-600 shadow-md shadow-emerald-100' : ''}
                                    ${step.status === 'current' ? 'border-brand-orange text-brand-orange shadow-lg shadow-orange-200' : ''}
                                    ${step.status === 'upcoming' ? 'border-slate-200 text-slate-400 hover:border-slate-200 hover:text-slate-700' : ''}
                                    ${step.status === 'locked' ? 'border-slate-100 text-slate-300' : ''}
                                `}
                            >
                                <step.icon size={20} strokeWidth={2.5} />
                                {step.status === 'current' && (
                                    <div className="absolute inset-0 rounded-full bg-brand-orange animate-ping opacity-20"></div>
                                )}
                                {step.status === 'completed' && (
                                    <div className="absolute -right-1 -top-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white">
                                        <CheckCircle2 size={10} className="text-white" />
                                    </div>
                                )}
                                {step.status === 'locked' && (
                                    <div className="absolute -right-1 -top-1 bg-slate-200 rounded-full p-0.5 border-2 border-white">
                                        <Lock size={10} className="text-slate-400" />
                                    </div>
                                )}
                            </motion.div>

                            {/* Text */}
                            <h4 className={`text-sm font-bold mb-1 transition-colors ${step.status === 'locked' ? 'text-slate-400' : 'text-slate-900 group-hover:text-slate-800'}`}>
                                {step.title}
                            </h4>
                            <p className="text-xs text-slate-500 max-w-[100px] leading-tight opacity-80 group-hover:opacity-100 transition-opacity">
                                {step.desc}
                            </p>

                            {/* Status Pill */}
                            {step.status === 'current' && (
                                <span className="mt-2 text-[10px] uppercase font-bold text-brand-orange bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                                    In Progress
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
