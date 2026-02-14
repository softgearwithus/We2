'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Languages, Mail, PenTool, Users, Lock, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const COMMUNICATION_MODULES = [
    {
        title: 'Amcat English',
        icon: Languages,
        count: '12 Tests',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        desc: 'Grammar, vocabulary, and error correction mastery.'
    },
    {
        title: 'WriteX Essay Writing',
        icon: PenTool,
        count: '5 Mock Rounds',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        desc: 'AI-evaluated essay writing practice for Wipro/Amcat.'
    },
    {
        title: 'Verbal Ability',
        icon: BookOpen,
        count: '15 Tests',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-100',
        desc: 'Reading comprehension, para-jumbles, and logic.'
    },
    {
        title: 'Situational Judgment',
        icon: Users,
        count: '8 Scenarios',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-100',
        desc: 'HR round preparation and workplace ethics.'
    },
    {
        title: 'Business Communication',
        icon: Mail,
        count: '6 Modules',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-100',
        desc: 'Email etiquette, corporate communication standards.'
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const BackgroundDecor = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#F8FAFC]">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]" />
    </div>
);

export default function CommunicationTestsPage() {
    return (
        <div className="min-h-screen font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-700 overflow-x-hidden pb-20">
            <BackgroundDecor />

            <div className="max-w-7xl mx-auto p-6 lg:p-12 relative z-10">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <Link href="/dashboard/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-medium mb-8 transition-all group px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Test Series
                    </Link>

                    <div className="flex items-center gap-4 mb-6 text-emerald-600">
                        <Sparkles size={24} className="animate-pulse" />
                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Mastery Track</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-none">
                        Communication <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Excellence.</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
                        Precision evaluation for the world's most elite corporate roles.
                        Master the verbal and situational logic required for final-round selection.
                    </p>
                </motion.header>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {COMMUNICATION_MODULES.map((module, idx) => (
                        <motion.div
                            key={idx}
                            variants={item}
                            className="group relative"
                        >
                            <div className="relative bg-white rounded-[40px] p-10 h-full border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col justify-between">
                                <div>
                                    <div className={`w-16 h-16 ${module.bg} ${module.color} rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-sm border ${module.border}`}>
                                        <module.icon size={32} />
                                    </div>
                                    <h3 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors tracking-tight">{module.title}</h3>
                                    <p className="text-slate-400 font-bold text-xs mb-6 uppercase tracking-widest">{module.count}</p>
                                    <p className="text-slate-500 leading-relaxed text-lg font-medium mb-10">
                                        {module.desc}
                                    </p>
                                </div>

                                <button className="w-full py-5 rounded-[20px] bg-slate-50 border border-slate-100 text-slate-700 font-bold text-base hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-inner">
                                    <Lock size={18} className="text-slate-400 group-hover:text-white transition-colors" /> Unlock Module
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Coming Soon Card */}
                    <motion.div
                        variants={item}
                        className="bg-slate-50 rounded-[40px] p-10 border-2 border-slate-200 border-dashed flex flex-col items-center justify-center text-center group hover:bg-white transition-all shadow-sm"
                    >
                        <div className="w-20 h-20 bg-white text-slate-300 rounded-full flex items-center justify-center mb-8 border border-slate-200 group-hover:scale-110 transition-transform shadow-inner">
                            <Sparkles size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-500 mb-4 tracking-tight">Vocal Analysis</h3>
                        <p className="text-slate-400 font-medium text-lg">AI-powered speech rhythm and tone evaluation coming soon.</p>
                        <div className="mt-8 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-2 border border-emerald-100">
                            In Pipeline
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
