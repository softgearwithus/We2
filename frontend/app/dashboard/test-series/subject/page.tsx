'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Brain, Calculator, Code2, Sparkles, ChevronRight, TrendingUp } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const SUBJECTS = [
    { key: 'english', title: 'English', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { key: 'aptitude', title: 'Aptitude', icon: Calculator, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    { key: 'logical_reasoning', title: 'Logical Reasoning', icon: Brain, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { key: 'computer_science', title: 'Computer Science', icon: Code2, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
];

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

export default function SubjectTestsPage() {
    const [counts, setCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/mcqs/groups?category=subject`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.ok ? res.json() : [])
            .then((data) => {
                if (Array.isArray(data)) {
                    const map: Record<string, number> = {};
                    data.forEach((row) => {
                        map[row.key] = row.count;
                    });
                    setCounts(map);
                }
            })
            .catch(() => undefined);
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 overflow-x-hidden pb-20 relative">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

            <div className="max-w-6xl mx-auto p-6 lg:p-10 relative z-10">
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-14 mt-6"
                >
                    <Link href="/dashboard/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors group px-4 py-2 rounded-full hover:bg-white bg-transparent border border-transparent hover:border-slate-200">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Test Series
                    </Link>

                    <div className="max-w-3xl">
                        <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4 inline-flex items-center gap-2 border border-indigo-100">
                            <Sparkles size={14} /> Technical Foundation
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-4">
                            Subject <span className="text-indigo-600">Mastery.</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium">
                            Rigorous evaluations designed for serious engineers. Select your subject below.
                        </p>
                    </div>
                </motion.header>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {SUBJECTS.map((subject, idx) => (
                        <motion.div variants={item} key={idx}>
                            <Link
                                href={`/dashboard/test-series/subject/${subject.key}`}
                                className="group block h-full bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 ${subject.bg} rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 transition-colors`} />

                                <div className={`w-14 h-14 ${subject.bg} ${subject.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 border ${subject.border}`}>
                                    <subject.icon size={24} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">{subject.title}</h3>

                                <div className="flex items-center gap-2 mb-10">
                                    <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                        {counts[subject.key] ?? 0} Questions
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                    <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                                        <TrendingUp size={10} /> Core
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-slate-900 font-bold text-sm">Start Practice</span>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
