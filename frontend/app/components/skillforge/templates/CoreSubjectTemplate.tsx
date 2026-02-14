'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, GraduationCap, PenTool, Calculator, MessageCircle, Play, FileText, Bot, Grid, List, CheckCircle2 } from 'lucide-react';

interface Unit {
    id: string;
    title: string;
    progress: number;
}

interface CoreSubjectTemplateProps {
    subjectName: string;
    professorName: string;
    units: Unit[];
}

export default function CoreSubjectTemplate({
    subjectName,
    professorName,
    units
}: CoreSubjectTemplateProps) {
    const [activeTab, setActiveTab] = useState<'learn' | 'whiteboard' | 'exam'>('learn');

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 max-w-[1920px] mx-auto space-y-8 flex flex-col">

            {/* 1. Glassmorphic Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 transform rotate-3">
                        <Book size={36} strokeWidth={2} />
                    </div>
                    <div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                            Core Engineering
                        </span>
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{subjectName}</h1>
                        <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                            <GraduationCap size={16} className="text-slate-400" />
                            Instructor: <span className="text-slate-900 font-bold">{professorName}</span>
                        </p>
                    </div>
                </div>

                {/* Custom Tab Switcher */}
                <div className="bg-slate-100/80 p-1.5 rounded-2xl flex gap-1">
                    {['learn', 'whiteboard', 'exam'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all duration-300 relative
                                ${activeTab === tab
                                    ? 'text-emerald-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                            `}
                        >
                            {activeTab === tab && (
                                <motion.div layoutId="activeTab" className="absolute inset-0 bg-white rounded-xl shadow-sm z-0" />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {tab === 'learn' && <Grid size={16} />}
                                {tab === 'whiteboard' && <PenTool size={16} />}
                                {tab === 'exam' && <FileText size={16} />}
                                {tab}
                            </span>
                        </button>
                    ))}
                </div>
            </motion.header>

            {/* 2. Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">

                {/* Left Panel: Dynamic Content */}
                <motion.div
                    layout
                    className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col relative"
                >
                    <AnimatePresence mode="wait">
                        {activeTab === 'learn' && (
                            <motion.div
                                key="learn"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                className="p-8 h-full overflow-y-auto custom-scrollbar"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900">Syllabus Modules</h2>
                                    <div className="text-sm font-bold text-slate-400">
                                        <span className="text-slate-900">4</span> / {units.length} modules
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {units.map((unit, index) => (
                                        <motion.div
                                            key={unit.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ y: -5, scale: 1.01 }}
                                            className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-bl-[4rem]"></div>

                                            <div className="flex justify-between items-start mb-6 relative z-10">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-slate-300 shadow-sm border border-slate-100 group-hover:bg-emerald-500 group-hover:text-white transition-all text-xl">
                                                    {unit.id}
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</span>
                                                    {unit.progress === 100 ? (
                                                        <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg text-xs">
                                                            <CheckCircle2 size={12} /> Completed
                                                        </span>
                                                    ) : (
                                                        <span className="text-lg font-black text-emerald-600">{unit.progress}%</span>
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="font-bold text-slate-900 text-lg mb-4 group-hover:text-emerald-700 transition-colors leading-tight">
                                                {unit.title}
                                            </h3>

                                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${unit.progress}%` }}
                                                    transition={{ delay: 0.5, duration: 1 }}
                                                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                                                ></motion.div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'whiteboard' && (
                            <motion.div
                                key="whiteboard"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 bg-[#f8f9fa] relative cursor-crosshair h-full"
                            >
                                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"></div>

                                <div className="absolute top-6 left-6 bg-white p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-3">
                                    <button className="p-3 bg-slate-100 text-slate-900 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-colors"><PenTool size={20} /></button>
                                    <button className="p-3 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors"><Calculator size={20} /></button>
                                    <div className="w-full h-px bg-slate-200 my-1"></div>
                                    <div className="w-8 h-8 rounded-full bg-black border-2 border-white ring-2 ring-slate-100 cursor-pointer hover:scale-110 transition-transform"></div>
                                    <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white ring-2 ring-slate-100 cursor-pointer hover:scale-110 transition-transform"></div>
                                    <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white ring-2 ring-slate-100 cursor-pointer hover:scale-110 transition-transform"></div>
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none select-none">
                                    <PenTool size={64} className="mb-4 opacity-50" />
                                    <div className="text-3xl font-black tracking-tight">Interactive Whiteboard</div>
                                    <p className="font-medium mt-2">Draw, Calculate, Visualize</p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'exam' && (
                            <motion.div
                                key="exam"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 h-full"
                            >
                                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100 mb-8 text-indigo-500 transform rotate-6 border border-indigo-50">
                                    <FileText size={48} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">End Semester Simulation</h2>
                                <p className="text-slate-500 max-w-md mb-10 text-lg leading-relaxed">
                                    Experience a real-time exam environment with timed questions, AI-proctoring simulation, and instant grading.
                                </p>
                                <button className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-10 py-4 rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all text-lg active:scale-95">
                                    Start Mock Exam (3 Hours)
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Right Panel: Professor AI Chat */}
                <div className="w-full lg:w-[380px] bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col overflow-hidden shrink-0">
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-300">
                                <GraduationCap size={24} />
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full p-[2px]">
                                <span className="block w-full h-full bg-white rounded-full animate-ping opacity-75"></span>
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Your Mentor</p>
                            <h3 className="font-bold text-slate-900 text-lg leading-none">Prof. Turing</h3>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                                <Bot size={20} />
                            </div>
                            <div className="bg-white p-5 rounded-[1.5rem] rounded-tl-none border border-slate-100 text-[15px] text-slate-600 shadow-sm leading-relaxed">
                                Welcome to <strong>{subjectName}</strong>! I'm here to clarify your doubts. Try asking about "Process Scheduling" or "Deadlocks".
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ask Prof. Turing..."
                                className="w-full bg-slate-100 hover:bg-slate-100/80 border-none rounded-2xl py-4 pl-5 pr-12 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200 hover:scale-110 transition-transform">
                                <MessageCircle size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
