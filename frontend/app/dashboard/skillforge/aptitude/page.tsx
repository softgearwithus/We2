import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Timer, Zap, Brain, Trophy, ChevronRight } from 'lucide-react';

export default function AptitudePage() {
    const [started, setStarted] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="w-16 h-16 bg-pink-100 rounded-3xl flex items-center justify-center text-pink-600 mb-6 mx-auto">
                    <Target size={32} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">Speed Aptitude Lab</h1>
                <p className="text-slate-500 font-medium max-w-lg">Sharpen your Quant, Logical, and Verbal speed for placements.</p>
            </motion.div>

            <div className="max-w-4xl w-full">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 bg-pink-50 rounded-bl-[100px] -mr-4 -mt-4 opacity-50"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-12 mb-12">
                            <div className="flex-1 space-y-6">
                                <h2 className="text-3xl font-black text-slate-900 leading-tight">Master the Clock. Ace the Test.</h2>
                                <p className="text-slate-500 text-lg leading-relaxed">
                                    Placement exams aren't just about correctness—they're about speed. Our adaptive platform helps you identify patterns faster.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                                        <Timer size={14} className="text-pink-500" /> 60s Per Question
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                                        <Brain size={14} className="text-purple-500" /> Pattern Analysis
                                    </div>
                                </div>
                            </div>
                            <div className="w-64 h-64 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                                <Trophy size={48} className="mb-4 text-slate-200" />
                                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Personal Best: 42s Avg</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setStarted(true)}
                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 group shadow-xl shadow-slate-200"
                        >
                            {started ? 'Loading Lab...' : 'Start Daily Sprint'} <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {[
                        { title: 'Quant', icon: Zap, color: 'text-amber-500' },
                        { title: 'Logical', icon: Brain, color: 'text-indigo-500' },
                        { title: 'Verbal', icon: Target, color: 'text-pink-500' }
                    ].map(cat => (
                        <div key={cat.title} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4 hover:border-indigo-500 transition-all cursor-pointer shadow-sm">
                            <div className={`p-3 bg-slate-50 rounded-2xl ${cat.color}`}>
                                <cat.icon size={20} />
                            </div>
                            <span className="font-extrabold text-slate-800 uppercase tracking-tight">{cat.title}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
