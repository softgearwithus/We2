'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, PenTool, Sparkles } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import API_BASE_URL from '@/app/lib/api-config';
import { useTestSeriesUsage } from '../layout';

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface ModuleData {
    key: string;
    label: string;
    count: number;
}

export default function WriteXModulesPage() {
    const [modules, setModules] = useState<ModuleData[]>([]);
    const [loading, setLoading] = useState(true);
    const { remainingLabel, isLimited, isFreePlan } = useTestSeriesUsage();

    useEffect(() => {
        const loadModules = async () => {
            const { getStoredToken } = await import('@/app/lib/auth-storage');
            const token = getStoredToken('user') || getStoredToken('admin');
            if (!token) {
                setModules([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/writex/groups`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                });
                if (!response.ok) return;
                const data = await response.json();
                if (Array.isArray(data)) {
                    setModules(data);
                }
            } finally {
                setLoading(false);
            }
        };
        loadModules();
    }, []);

    return (
        <div className="min-h-screen font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-700 bg-[#F8FAFC] pb-24 relative">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
                <Link href="/dashboard/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-medium mb-8 transition-all group px-5 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md active:scale-95">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Test Series
                </Link>

                <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
                    <div className="max-w-3xl">
                        <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4 inline-flex items-center gap-2 border border-emerald-100">
                            <Sparkles size={14} /> WriteX Modules
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-4">WriteX <span className="text-emerald-600">Categories</span></h1>
                        <p className="text-lg text-slate-500 font-medium">Select a focused module to begin your targeted essay or code writing practice.</p>
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
                                    href={`/dashboard/test-series/communication/${mod.key}`}
                                    className={`group flex items-center justify-between bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all duration-300 relative overflow-hidden ${isLimited ? 'opacity-60 pointer-events-none' : 'hover:shadow-xl hover:border-emerald-100'}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                            <PenTool size={20} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">{mod.label}</h3>
                                            <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{mod.count} prompts</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                        <ChevronRight size={18} />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                        
                        {modules.length === 0 && (
                            <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 font-semibold shadow-sm">
                                No WriteX modules have been created yet.
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
