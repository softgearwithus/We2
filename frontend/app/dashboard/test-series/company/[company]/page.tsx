'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ChevronRight, Layers, Sparkles } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTestSeriesUsage } from '../../layout';

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } },
};

type TopicGroup = {
    key: string;
    label: string;
    count: number;
};

export default function CompanyTopicsPage() {
    const params = useParams();
    const company = String(params.company || '');
    const [topics, setTopics] = useState<TopicGroup[]>([]);
    const { remainingLabel, isLimited, isFreePlan } = useTestSeriesUsage();

    useEffect(() => {
        const loadTopics = async () => {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            if (!token || !company) return;
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/mcqs/groups?category=company&groupBy=topic&groupKey=${encodeURIComponent(company)}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            if (!response.ok) return;
            const data = await response.json();
            if (Array.isArray(data)) {
                setTopics(data);
            }
        };
        loadTopics();
    }, [company]);

    const displayLabel = company.replace(/_/g, ' ');

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-700 overflow-x-hidden pb-20 relative">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

            <div className="max-w-6xl mx-auto p-6 lg:p-10 relative z-10">
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-14 mt-6"
                >
                    <Link href="/dashboard/test-series/company" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 font-bold mb-8 transition-colors group px-4 py-2 rounded-full hover:bg-white bg-transparent border border-transparent hover:border-slate-200">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Companies
                    </Link>

                    <div className="max-w-3xl">
                        <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4 inline-flex items-center gap-2 border border-orange-100">
                            <Sparkles size={14} /> Company Practice
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-4">
                            {displayLabel} <span className="text-orange-600">Topics.</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium">
                            Practice company-specific MCQs topic by topic.
                        </p>
                        {isFreePlan && (
                            <div className={`mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${isLimited ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                Free plan time left in Company Tests: {remainingLabel}
                            </div>
                        )}
                    </div>
                </motion.header>

                <div className="relative">
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {topics.map((topic) => (
                            <motion.div variants={item} key={topic.key}>
                                <Link
                                    href={`/dashboard/test-series/company/${company}/${topic.key}`}
                                    className={`group block h-full bg-white rounded-3xl p-8 border border-slate-100 shadow-sm transition-all duration-300 relative overflow-hidden ${isLimited ? 'opacity-60 pointer-events-none' : 'hover:shadow-xl hover:border-orange-100'}`}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-100 transition-colors" />

                                    <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                                        <Layers size={24} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-orange-600 transition-colors">{topic.label}</h3>

                                    <div className="flex items-center gap-2 mb-10">
                                        <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest">{topic.count} Questions</div>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Focused</div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-slate-900 font-bold text-sm">Start Practice</span>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>

                    {topics.length === 0 && (
                        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 font-semibold">No topics available yet. Check back soon.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
