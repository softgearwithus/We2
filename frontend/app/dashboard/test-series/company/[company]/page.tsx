'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Clock, BookOpen, ChevronRight, Search, SlidersHorizontal, ArrowDownAZ, ArrowUpZA } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { fetchCompanyHierarchy } from '@/app/lib/test-series-builder';

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

export default function CompanyMockTestsPage() {
    const params = useParams();
    const router = useRouter();
    const companyId = String(params.company || '');

    const [companyDetails, setCompanyDetails] = useState<any>(null);
    const [mockTests, setMockTests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadHierarchy = async () => {
            const { getStoredToken } = await import('@/app/lib/auth-storage');

            const attemptFetch = async (t: string) => {
                try { return await fetchCompanyHierarchy(t, companyId); }
                catch (e) { return null; }
            };

            const userToken = getStoredToken('user');
            const adminToken = getStoredToken('admin');

            setIsLoading(true);
            let data = null;

            if (userToken && companyId) {
                data = await attemptFetch(userToken);
            }
            if (!data && adminToken && adminToken !== userToken && companyId) {
                data = await attemptFetch(adminToken);
            }

            if (data) {
                setCompanyDetails(data.company);
                setMockTests(data.mockTests || []);
            } else {
                console.error("Failed to load hierarchy");
            }
            setIsLoading(false);
        };

        if (companyId) {
            loadHierarchy();
        }
    }, [companyId]);

    const displayLabel = companyDetails?.name || 'Company';

    const handleStartTest = (testId: string) => {
        router.push(`/dashboard/test-series/exam/${testId}`);
    };

    // Helper to determine if a mock test is "New" (less than 7 days old)
    const isNew = (dateString?: string) => {
        if (!dateString) return false;
        const createdAt = new Date(dateString).getTime();
        const now = Date.now();
        const diffInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
        return diffInDays <= 7;
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'az' | 'za'>('newest');

    // Filter and sort mock tests
    const displayTests = React.useMemo(() => {
        let filtered = mockTests;

        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(t => t.title?.toLowerCase().includes(lowerQuery) || t.description?.toLowerCase().includes(lowerQuery));
        }

        return [...filtered].sort((a, b) => {
            if (sortBy === 'newest') {
                const aNew = isNew(a.createdAt);
                const bNew = isNew(b.createdAt);
                if (aNew && !bNew) return -1;
                if (!aNew && bNew) return 1;
                // Fallback to alphabetical if neither or both are new
                return (a.title || '').localeCompare(b.title || '');
            }
            if (sortBy === 'az') return (a.title || '').localeCompare(b.title || '');
            if (sortBy === 'za') return (b.title || '').localeCompare(a.title || '');
            return 0;
        });
    }, [mockTests, searchQuery, sortBy]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-700 overflow-x-hidden pb-20 relative">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

            <div className="max-w-7xl mx-auto p-6 lg:p-10 relative z-10">
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-14 mt-6"
                >
                    <Link href="/dashboard/test-series/company" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 font-bold mb-8 transition-colors group px-4 py-2 rounded-full hover:bg-white bg-transparent border border-transparent hover:border-slate-200">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Companies
                    </Link>

                    <div className="max-w-3xl flex items-center gap-6">
                        {companyDetails?.logoUrl && (
                            <img src={companyDetails.logoUrl} alt={companyDetails.name} className="w-24 h-24 object-contain" />
                        )}
                        <div>
                            <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4 inline-flex items-center gap-2 border border-orange-100">
                                <BookOpen size={14} /> Full Length Mock Tests
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-4">
                                {displayLabel} <span className="text-orange-600">Exams.</span>
                            </h1>
                            <p className="text-lg text-slate-500 font-medium">
                                Realistic placement assessment simulators tailored for {displayLabel}.
                            </p>
                        </div>
                    </div>
                </motion.header>

                {/* Filter & Search Bar */}
                {!isLoading && mockTests.length > 0 && (
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
                                placeholder={`Search ${displayLabel} exams...`}
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
                )}

                {isLoading ? (
                    <div className="flex justify-center p-24">
                        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
                    </div>
                ) : mockTests.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-2xl font-bold text-slate-800">No mock tests available yet.</h3>
                        <p className="text-slate-500 mt-2 font-medium">Please check back later.</p>
                    </div>
                ) : displayTests.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                            <Search size={24} />
                        </div>
                        <p className="text-slate-600 font-bold text-lg mb-1">No matches found</p>
                        <p className="text-slate-400 text-sm">We couldn't find any exams matching "{searchQuery}"</p>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {displayTests.map((test) => {
                            const isTestNew = isNew(test.createdAt);
                            return (
                                <motion.div
                                    key={test.id}
                                    variants={item}
                                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:border-orange-300 hover:shadow-xl transition-all group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight group-hover:text-orange-600 transition-colors">
                                                {test.title}
                                            </h3>
                                            {isTestNew && (
                                                <div className="bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-sm animate-pulse ml-2 shrink-0">
                                                    New
                                                </div>
                                            )}
                                        </div>
                                        {test.description && (
                                            <p className="text-slate-500 mt-3 text-sm font-medium line-clamp-2 leading-relaxed">
                                                {test.description}
                                            </p>
                                        )}

                                        <div className="mt-6 space-y-3">
                                            <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <div className="bg-white p-1.5 rounded-lg shadow-sm">
                                                    <Clock size={16} className="text-slate-500" />
                                                </div>
                                                {test.totalDurationMinutes} minutes total duration
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <div className="bg-white p-1.5 rounded-lg shadow-sm">
                                                    <BookOpen size={16} className="text-slate-500" />
                                                </div>
                                                {test.sections?.length || 0} sections
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleStartTest(test.id)}
                                        className="w-full mt-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-sm flex justify-center items-center gap-2 group-hover:shadow-md"
                                    >
                                        Start Test <ChevronRight size={18} />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
