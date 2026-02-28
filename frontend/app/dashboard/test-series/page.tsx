'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Building2, ChevronRight, Mic, Sparkles } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTestSeriesUsage } from './layout';

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function TestSeriesPage() {
    const { remainingLabel, isLimited, isFreePlan } = useTestSeriesUsage();
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 overflow-x-hidden pb-20 relative">
            {/* Minimalist Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

            <div className="max-w-6xl mx-auto p-6 lg:p-10 relative z-10">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-14 mt-6"
                >
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors group px-4 py-2 rounded-full hover:bg-white bg-transparent border border-transparent hover:border-slate-200">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
                    </Link>

                    <div className="max-w-3xl">
                        <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4 inline-flex items-center gap-2 border border-indigo-100">
                            <Sparkles size={14} /> Pro Practice Platform
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-4">
                            Test <span className="text-indigo-600">Series.</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium">
                            Master your skills. Train with focused, high-speed practice simulations.
                        </p>
                        {isFreePlan && (
                            <div className={`mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${isLimited ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                Free plan time left in Test Series: {remainingLabel}
                            </div>
                        )}
                    </div>
                </motion.header>

                <div className="relative">
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {/* Subject Wise Card */}
                        <motion.div variants={item}>
                            <Link href="/dashboard/test-series/subject" className={`group block h-full bg-white rounded-3xl p-8 border border-slate-100 shadow-sm transition-all duration-300 relative overflow-hidden ${isLimited ? 'opacity-60 pointer-events-none' : 'hover:shadow-xl hover:border-indigo-100'}`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-100 transition-colors" />

                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                    <BookOpen size={24} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Subject <br /> Practice.</h3>
                                <p className="text-slate-500 text-sm font-medium mb-12">
                                    Structured MCQs for English, Aptitude, Reasoning & CS.
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-indigo-600 font-bold text-sm">Start Practice</span>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Company Wise Card */}
                        <motion.div variants={item}>
                            <Link href="/dashboard/test-series/company" className={`group block h-full bg-white rounded-3xl p-8 border border-slate-100 shadow-sm transition-all duration-300 relative overflow-hidden ${isLimited ? 'opacity-60 pointer-events-none' : 'hover:shadow-xl hover:border-orange-100'}`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-100 transition-colors" />

                                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                                    <Building2 size={24} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Company <br /> Patterns.</h3>
                                <p className="text-slate-500 text-sm font-medium mb-12">
                                    Exact pattern mocks for top tech giants and startups.
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-orange-600 font-bold text-sm">Start Mocks</span>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>

                        {/* WriteX Analysis Card */}
                        <motion.div variants={item}>
                            <Link href="/dashboard/test-series/communication" className={`group block h-full bg-white rounded-3xl p-8 border border-slate-100 shadow-sm transition-all duration-300 relative overflow-hidden ${isLimited ? 'opacity-60 pointer-events-none' : 'hover:shadow-xl hover:border-emerald-100'}`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-100 transition-colors" />

                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                    <Mic size={24} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">WriteX <br /> Analysis.</h3>
                                <p className="text-slate-500 text-sm font-medium mb-12">
                                    High-speed AI grading for your long-form responses.
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-emerald-600 font-bold text-sm">Evaluate Now</span>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
