'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Brain, Calculator, Code2, Sparkles, ChevronRight, TrendingUp, type LucideIcon } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import API_BASE_URL from '@/app/lib/api-config';
import { useTestSeriesUsage } from '../layout';

const ICONS = [BookOpen, Calculator, Brain, Code2, Sparkles, TrendingUp];
const COLORS = [
    { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
    { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
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

type SubjectCard = {
    key: string;
    title: string;
    icon: LucideIcon;
    color: string;
    bg: string;
    border: string;
};

const getLoadErrorMessage = (message?: string) => {
    const normalized = message?.toLowerCase() || '';
    if (normalized.includes('free plan limit')) {
        return 'Your free plan limit for Test Series has been reached.';
    }
    if (normalized.includes('invalid') || normalized.includes('expired')) {
        return 'Your session has expired. Please sign in again.';
    }
    return 'Unable to load subjects right now.';
};

export default function SubjectTestsPage() {
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [dynamicSubjects, setDynamicSubjects] = useState<SubjectCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { remainingLabel, isLimited, isFreePlan } = useTestSeriesUsage();

    useEffect(() => {
        let cancelled = false;

        const loadCounts = async () => {
            setLoading(true);
            setError(null);

            const { getStoredToken } = await import('@/app/lib/auth-storage');

            const attemptFetch = async (t: string) => {
                const params = new URLSearchParams({
                    category: 'subject',
                    groupBy: 'group',
                });
                const response = await fetch(`${API_BASE_URL}/mcqs/groups?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${t}` },
                    cache: 'no-store',
                });

                if (!response.ok) {
                    const payload = await response.json().catch(() => null);
                    throw new Error(payload?.message || `Failed to load subjects (${response.status})`);
                }

                const payload = await response.json();
                if (!Array.isArray(payload)) {
                    throw new Error('Unexpected subject response.');
                }

                return payload;
            };

            const userToken = getStoredToken('user');
            const adminToken = getStoredToken('admin');
            const tokens = [userToken, adminToken].filter((token, index, arr): token is string => Boolean(token) && arr.indexOf(token) === index);

            if (tokens.length === 0) {
                if (!cancelled) {
                    setDynamicSubjects([]);
                    setCounts({});
                    setError('Your session has expired. Please sign in again.');
                    setLoading(false);
                }
                return;
            }

            let data: Array<{ key: string; label: string; count: number }> | null = null;
            let lastError: Error | null = null;

            for (const token of tokens) {
                try {
                    data = await attemptFetch(token);
                    lastError = null;
                    break;
                } catch (fetchError) {
                    lastError = fetchError instanceof Error ? fetchError : new Error('Unable to load subjects right now.');
                }
            }

            if (data) {
                const map: Record<string, number> = {};
                const subjectsArr: SubjectCard[] = [];
                
                data.forEach((row, idx) => {
                    map[row.key] = row.count;
                    
                    // Assign deterministic styles based on index mapping
                    const theme = COLORS[idx % COLORS.length];
                    const IconComp = ICONS[idx % ICONS.length];
                    
                    subjectsArr.push({
                        key: row.key,
                        title: row.label,
                        icon: IconComp,
                        ...theme
                    });
                });

                if (!cancelled) {
                    setCounts(map);
                    setDynamicSubjects(subjectsArr);
                }
            } else if (!cancelled) {
                setCounts({});
                setDynamicSubjects([]);
                setError(getLoadErrorMessage(lastError?.message));
            }

            if (!cancelled) {
                setLoading(false);
            }
        };

        loadCounts();

        return () => {
            cancelled = true;
        };
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
                        {isFreePlan && (
                            <div className={`mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${isLimited ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                Free plan time left in Subject Tests: {remainingLabel}
                            </div>
                        )}
                    </div>
                </motion.header>

                <div className="relative">
                    {loading ? (
                        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 font-semibold shadow-sm">
                            Loading subjects...
                        </div>
                    ) : error ? (
                        <div className="bg-white border border-rose-200 rounded-3xl p-10 text-center text-rose-700 font-semibold shadow-sm">
                            {error}
                        </div>
                    ) : dynamicSubjects.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 font-semibold shadow-sm">
                            No subjects are available yet.
                        </div>
                    ) : (
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {dynamicSubjects.map((subject, idx) => (
                                <motion.div variants={item} key={idx}>
                                    <Link
                                        href={`/dashboard/test-series/subject/${subject.key}`}
                                        className={`group block h-full bg-white rounded-3xl p-8 border border-slate-100 shadow-sm transition-all duration-300 relative overflow-hidden ${isLimited ? 'opacity-60 pointer-events-none' : 'hover:shadow-xl hover:border-indigo-100'}`}
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
                    )}
                </div>
            </div>
        </div>
    );
}
