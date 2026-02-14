'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle, ChevronRight, ExternalLink } from 'lucide-react';
import { roadmapData } from '@/app/lib/data/roadmapData';

export default function RoadmapPage() {
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-200/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 max-w-5xl mx-auto p-6 lg:p-12">
                {/* Header */}
                <header className="mb-12">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </Link>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                        Placement Roadmap <span className="text-brand-orange">.</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl">
                        The complete visual guide to your placement journey. Use this as a reference timeline.
                    </p>
                </header>

                {/* Timeline */}
                <div className="relative border-l-2 border-slate-200 ml-6 lg:ml-10 space-y-12 pb-12">
                    {roadmapData.map((step, index) => (
                        <div key={step.id} className="relative pl-8 lg:pl-12">
                            {/* Icon Dot */}
                            <div className="absolute -left-[21px] lg:-left-[25px] top-0 w-10 h-10 lg:w-12 lg:h-12 rounded-full border-4 border-slate-50 flex items-center justify-center bg-white shadow-sm z-10 text-brand-orange">
                                <step.icon size={20} />
                            </div>

                            {/* Content Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                                                {step.timeframe}
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                Fast Track: <span className="text-slate-700">{step.fastTrack}</span>
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900">{step.title}</h3>
                                        <p className="text-xs text-slate-400 mt-1 font-medium">
                                            Ideal For: <span className="text-slate-600">{step.idealTime}</span>
                                        </p>
                                    </div>
                                </div>

                                <p className="text-slate-600 mb-6">{step.desc}</p>

                                {/* Topics Preview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {step.topics.map((topic, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-orange/50"></div>
                                            {topic.title}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
