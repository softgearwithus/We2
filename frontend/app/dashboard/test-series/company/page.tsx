'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const COLOR_OPTIONS = [
    { color: 'text-orange-600', bg: 'bg-orange-50', hoverBg: 'group-hover:bg-orange-600', hoverBorder: 'hover:border-orange-100' },
    { color: 'text-red-600', bg: 'bg-red-50', hoverBg: 'group-hover:bg-red-600', hoverBorder: 'hover:border-red-100' },
    { color: 'text-indigo-600', bg: 'bg-indigo-50', hoverBg: 'group-hover:bg-indigo-600', hoverBorder: 'hover:border-indigo-100' },
    { color: 'text-emerald-600', bg: 'bg-emerald-50', hoverBg: 'group-hover:bg-emerald-600', hoverBorder: 'hover:border-emerald-100' },
    { color: 'text-sky-600', bg: 'bg-sky-50', hoverBg: 'group-hover:bg-sky-600', hoverBorder: 'hover:border-sky-100' },
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

export default function CompanyTestsPage() {
    const [companies, setCompanies] = useState<{ key: string; label: string; count: number }[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/mcqs/groups?category=company`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.ok ? res.json() : [])
            .then((data) => {
                if (Array.isArray(data)) {
                    setCompanies(data);
                }
            })
            .catch(() => undefined);
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-700 overflow-x-hidden pb-20 relative">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

            <div className="max-w-6xl mx-auto p-6 lg:p-10 relative z-10">
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-14 mt-6"
                >
                    <Link href="/dashboard/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 font-bold mb-8 transition-colors group px-4 py-2 rounded-full hover:bg-white bg-transparent border border-transparent hover:border-slate-200">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Test Series
                    </Link>

                    <div className="max-w-3xl">
                        <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4 inline-flex items-center gap-2 border border-orange-100">
                            <Sparkles size={14} /> Industry Patterns
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-4">
                            Company <span className="text-orange-600">Patterns.</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium">
                            Targeted mock tests mirroring the exact interviews of top-tier firms.
                        </p>
                    </div>
                </motion.header>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {companies.map((company, idx) => {
                        const palette = COLOR_OPTIONS[idx % COLOR_OPTIONS.length];
                        return (
                            <motion.div variants={item} key={idx}>
                                <Link
                                    href={`/dashboard/test-series/company/${company.key}`}
                                    className={`group block h-full bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl ${palette.hoverBorder} transition-all duration-300 relative overflow-hidden`}
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${palette.bg} rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 transition-colors`} />

                                    <div className={`w-14 h-14 ${palette.bg} ${palette.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 ${palette.hoverBg} group-hover:text-white transition-all duration-300`}>
                                        <Building2 size={24} strokeWidth={2.5} />
                                    </div>
                                    <h3 className={`text-xl font-black text-slate-900 mb-3 tracking-tight ${palette.color.replace('text-', 'group-hover:text-')} transition-colors`}>{company.label}</h3>

                                    <div className="flex items-center gap-2 mb-10">
                                        <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest">{company.count} Questions</div>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1">
                                            <TrendingUp size={10} /> Active
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-slate-900 font-bold text-sm">Start Mocks</span>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}
