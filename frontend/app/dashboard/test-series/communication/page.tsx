'use client';

import { fetchApi } from '../../../lib/apiClient';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, PenTool, Sparkles, Search, SlidersHorizontal, ArrowDownAZ, ArrowUpZA, Clock } from 'lucide-react';
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
    createdAt?: string;
    isNew?: boolean;
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
                const response = await fetchApi(`${API_BASE_URL}/writex/groups`, {
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

    // Helper to determine if a module is "New" (manual override or less than 7 days old)
    const isNewCheck = (mod: ModuleData) => {
        if (!mod.createdAt) return false;
        const createdAt = new Date(mod.createdAt).getTime();
        if (!Number.isFinite(createdAt)) return false;
        const now = Date.now();
        const diffInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
        return diffInDays <= 7;
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'az' | 'za'>('newest');

    // Filter and sort modules
    const displayModules = React.useMemo(() => {
        let filtered = modules;

        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(m => m.label?.toLowerCase().includes(lowerQuery));
        }

        return [...filtered].sort((a, b) => {
            if (sortBy === 'newest') {
                const aNew = isNewCheck(a);
                const bNew = isNewCheck(b);
                if (aNew && !bNew) return -1;
                if (!aNew && bNew) return 1;
                // Fallback to alphabetical if neither or both are new
                return (a.label || '').localeCompare(b.label || '');
            }
            if (sortBy === 'az') return (a.label || '').localeCompare(b.label || '');
            if (sortBy === 'za') return (b.label || '').localeCompare(a.label || '');
            return 0;
        });
    }, [modules, searchQuery, sortBy]);

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

                {/* Filter & Search Bar */}
                {!loading && modules.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full"
                    >
                        <div className="relative flex-grow w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search modules..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                            />
                        </div>
                        <div className="relative w-full sm:w-auto shrink-0 flex items-center bg-white border border-slate-200 rounded-2xl px-1.5 py-1.5 shadow-sm">
                            <div className="pl-3 pr-2 text-slate-400">
                                <SlidersHorizontal size={16} />
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-transparent border-none text-sm font-bold text-slate-700 py-2 pr-8 pl-1 focus:outline-none focus:ring-0 cursor-pointer appearance-none outline-none"
                            >
                                <option value="newest">Newest First</option>
                                <option value="az">Alphabetical (A-Z)</option>
                                <option value="za">Alphabetical (Z-A)</option>
                            </select>
                            <div className="absolute right-3 pointer-events-none text-slate-400">
                                {sortBy === 'newest' && <Clock size={14} />}
                                {sortBy === 'az' && <ArrowDownAZ size={14} />}
                                {sortBy === 'za' && <ArrowUpZA size={14} />}
                            </div>
                        </div>
                    </motion.div>
                )}

                {loading ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 font-semibold shadow-sm">
                        Loading modules...
                    </div>
                ) : modules.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 font-semibold shadow-sm">
                        No WriteX modules have been created yet.
                    </div>
                ) : displayModules.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                            <Search size={24} />
                        </div>
                        <p className="text-slate-600 font-bold text-lg mb-1">No matches found</p>
                        <p className="text-slate-400 text-sm">We couldn't find any modules matching "{searchQuery}"</p>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {displayModules.map((mod, idx) => {
                            const isModNew = isNewCheck(mod);
                            return (
                                <motion.div variants={item} key={idx}>
                                    <Link
                                        href={`/dashboard/test-series/communication/${mod.key}`}
                                        className={`group flex items-center justify-between bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all duration-300 relative overflow-hidden ${isLimited ? 'opacity-60 pointer-events-none' : 'hover:shadow-xl hover:border-emerald-100'}`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 relative">
                                                <PenTool size={20} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">{mod.label}</h3>
                                                    {isModNew && (
                                                        <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm animate-pulse shrink-0">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{mod.count} prompts</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                            <ChevronRight size={18} />
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                        
                    </motion.div>
                )}
            </div>
        </div>
    );
}
