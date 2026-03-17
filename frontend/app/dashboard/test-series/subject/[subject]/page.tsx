'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ChevronRight, Layers, Sparkles } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import API_BASE_URL from '@/app/lib/api-config';
import { useTestSeriesUsage } from '../../layout';

const SUBJECT_LABELS: Record<string, string> = {
    english: 'English',
    aptitude: 'Aptitude',
    logical_reasoning: 'Logical Reasoning',
    computer_science: 'Computer Science',
};

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface ModuleData {
    key: string;
    label: string;
    count: number;
    createdAt?: string;
}

const getLoadErrorMessage = (message?: string) => {
    const normalized = message?.toLowerCase() || '';
    if (normalized.includes('free plan limit')) {
        return 'Your free plan limit for Test Series has been reached.';
    }
    if (normalized.includes('invalid') || normalized.includes('expired')) {
        return 'Your session has expired. Please sign in again.';
    }
    return 'Unable to load modules right now.';
};

export default function SubjectModulesPage() {
    const params = useParams();
    const subject = String(params.subject || '');
    const label = SUBJECT_LABELS[subject] || 'Subject';

    const [modules, setModules] = useState<ModuleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { remainingLabel, isLimited, isFreePlan } = useTestSeriesUsage();

    useEffect(() => {
        let cancelled = false;

        const loadModules = async () => {
            const { getStoredToken } = await import('@/app/lib/auth-storage');
            const tokens = [getStoredToken('user'), getStoredToken('admin')].filter((token, index, arr): token is string => Boolean(token) && arr.indexOf(token) === index);

            if (!subject) {
                if (!cancelled) {
                    setModules([]);
                    setError('Missing subject identifier.');
                    setLoading(false);
                }
                return;
            }

            if (tokens.length === 0) {
                if (!cancelled) {
                    setModules([]);
                    setError('Your session has expired. Please sign in again.');
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            setError(null);

            try {
                let data: ModuleData[] | null = null;
                let lastError: Error | null = null;

                for (const token of tokens) {
                    try {
                        const params = new URLSearchParams({
                            category: 'subject',
                            groupBy: 'topic',
                            groupKey: subject,
                        });
                        const response = await fetch(`${API_BASE_URL}/mcqs/groups?${params.toString()}`, {
                            headers: { Authorization: `Bearer ${token}` },
                            cache: 'no-store',
                        });

                        if (!response.ok) {
                            const payload = await response.json().catch(() => null);
                            throw new Error(payload?.message || `Failed to load modules (${response.status})`);
                        }

                        const payload = await response.json();
                        if (!Array.isArray(payload)) {
                            throw new Error('Unexpected module response.');
                        }

                        data = payload;
                        lastError = null;
                        break;
                    } catch (fetchError) {
                        lastError = fetchError instanceof Error ? fetchError : new Error('Unable to load modules right now.');
                    }
                }

                if (!cancelled) {
                    if (data) {
                        setModules(data);
                    } else {
                        setModules([]);
                        setError(getLoadErrorMessage(lastError?.message));
                    }
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadModules();

        return () => {
            cancelled = true;
        };
    }, [subject]);

    const isModuleNew = (createdAt?: string) => {
        if (!createdAt) return false;
        const created = new Date(createdAt).getTime();
        if (!Number.isFinite(created)) return false;
        const diffInDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
        return diffInDays <= 7;
    };

    return (
        <div className="min-h-screen font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 bg-[#F8FAFC] pb-24 relative">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
                <Link href="/dashboard/test-series/subject" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-8 transition-all group px-5 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md active:scale-95">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Subjects
                </Link>

                <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
                    <div className="max-w-3xl">
                        <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4 inline-flex items-center gap-2 border border-indigo-100">
                            <Sparkles size={14} /> Subject Breakdown
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-4">{label} Modules</h1>
                        <p className="text-lg text-slate-500 font-medium">Select a focused module to begin your targeted practice session.</p>
                        {isFreePlan && (
                            <div className={`mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${isLimited ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                Free plan time left: {remainingLabel}
                            </div>
                        )}
                    </div>
                </motion.header>

                {loading ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 font-semibold shadow-sm">
                        Loading modules...
                    </div>
                ) : error ? (
                    <div className="bg-white border border-rose-200 rounded-3xl p-10 text-center text-rose-700 font-semibold shadow-sm">
                        {error}
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {modules.map((mod, idx) => (
                            <motion.div variants={item} key={idx}>
                                <Link
                                    href={`/dashboard/test-series/subject/${subject}/${mod.key}`}
                                    className={`group flex items-center justify-between bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all duration-300 relative overflow-hidden ${isLimited ? 'opacity-60 pointer-events-none' : 'hover:shadow-xl hover:border-indigo-100'}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                            <Layers size={20} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">{mod.label}</h3>
                                                {isModuleNew(mod.createdAt) && (
                                                    <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm animate-pulse shrink-0">
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{mod.count} questions</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <ChevronRight size={18} />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                        
                        {modules.length === 0 && (
                            <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 font-semibold shadow-sm">
                                No modules have been added to this subject yet.
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
