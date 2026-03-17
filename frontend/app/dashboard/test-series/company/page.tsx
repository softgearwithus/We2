'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { fetchCompaniesList } from '@/app/lib/test-series-builder';
import { useTestSeriesUsage } from '../layout';
import { Search, SlidersHorizontal, ArrowDownAZ, ArrowUpZA, Clock } from 'lucide-react';

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
    const [companies, setCompanies] = useState<any[]>([]);
    const { remainingLabel, isLimited, isFreePlan } = useTestSeriesUsage();

    useEffect(() => {
        const loadCompanies = async () => {
            const { getStoredToken } = await import('@/app/lib/auth-storage');

            const attemptFetch = async (t: string) => {
                try { return await fetchCompaniesList(t, false); }
                catch (e: any) { return null; }
            };

            const userToken = getStoredToken('user');
            const adminToken = getStoredToken('admin');

            let data: any = null;
            if (userToken) {
                data = await attemptFetch(userToken);
            }
            if (!data && adminToken && adminToken !== userToken) {
                data = await attemptFetch(adminToken);
            }

            if (data) {
                if (Array.isArray(data)) setCompanies(data);
                else if (Array.isArray(data.items)) setCompanies(data.items);
                else if (Array.isArray(data.data)) setCompanies(data.data);
                else setCompanies([]);
            } else {
                setCompanies([]);
            }
        };
        loadCompanies();
    }, []);

    // Helper to determine if a company is "New" (manual override or less than 7 days old)
    const isNew = (company: any) => {
        if (!company?.createdAt) return false;
        const createdAt = new Date(company.createdAt).getTime();
        if (!Number.isFinite(createdAt)) return false;
        const now = Date.now();
        const diffInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
        return diffInDays <= 7;
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'az' | 'za'>('newest');

    // Filter and sort companies
    const displayCompanies = React.useMemo(() => {
        let filtered = companies;

        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(c => c.name?.toLowerCase().includes(lowerQuery));
        }

        return [...filtered].sort((a, b) => {
            if (sortBy === 'newest') {
                const aNew = isNew(a);
                const bNew = isNew(b);
                if (aNew && !bNew) return -1;
                if (!aNew && bNew) return 1;
                // Otherwise fallback to alphabetical
                return (a.name || '').localeCompare(b.name || '');
            }
            if (sortBy === 'az') return (a.name || '').localeCompare(b.name || '');
            if (sortBy === 'za') return (b.name || '').localeCompare(a.name || '');
            return 0;
        });
    }, [companies, searchQuery, sortBy]);

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
                        {isFreePlan && (
                            <div className={`mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${isLimited ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                Free plan time left in Company Tests: {remainingLabel}
                            </div>
                        )}
                    </div>
                </motion.header>

                {/* Filter & Search Bar */}
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
                            placeholder="Search companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
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

                <div className="relative">
                    {displayCompanies.length > 0 ? (
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {displayCompanies.map((company, idx) => {
                                const palette = COLOR_OPTIONS[idx % COLOR_OPTIONS.length];
                                const isCompanyNew = isNew(company);
                                return (
                                    <motion.div variants={item} key={company.id}>
                                        <Link
                                            href={`/dashboard/test-series/company/${company.id}`}
                                            className={`group block h-full bg-white rounded-3xl p-8 border border-slate-100 shadow-sm transition-all duration-300 relative overflow-hidden ${isLimited ? 'opacity-60 pointer-events-none' : `hover:shadow-xl ${palette.hoverBorder}`}`}
                                        >
                                            <div className={`absolute top-0 right-0 w-32 h-32 ${palette.bg} rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 transition-colors`} />

                                            <div className="flex items-start justify-between mb-6 relative">
                                                <div className={`w-14 h-14 ${palette.bg} ${palette.color} rounded-2xl flex items-center justify-center group-hover:scale-110 ${palette.hoverBg} group-hover:text-white transition-all duration-300`}>
                                                    {company.logoUrl ? (
                                                        <img src={company.logoUrl} alt={company.name} className="w-8 h-8 object-contain" />
                                                    ) : (
                                                        <Building2 size={24} strokeWidth={2.5} />
                                                    )}
                                                </div>
                                                {isCompanyNew && (
                                                    <div className="bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-sm animate-pulse">
                                                        New
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className={`text-xl font-black text-slate-900 mb-3 tracking-tight ${palette.color.replace('text-', 'group-hover:text-')} transition-colors`}>{company.name}</h3>

                                            <div className="flex items-center gap-2 mb-10">
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
                    ) : companies.length > 0 ? (
                        <div className="py-20 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                                <Search size={24} />
                            </div>
                            <p className="text-slate-600 font-bold text-lg mb-1">No matches found</p>
                            <p className="text-slate-400 text-sm">We couldn't find any companies matching "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="py-20 text-center text-slate-500 font-medium">
                            Loading companies...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
