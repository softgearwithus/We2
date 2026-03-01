'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Clock, BookOpen, ChevronRight } from 'lucide-react';
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
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {mockTests.map((test) => (
                            <motion.div
                                key={test.id}
                                variants={item}
                                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:border-orange-300 hover:shadow-xl transition-all group flex flex-col justify-between"
                            >
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight group-hover:text-orange-600 transition-colors">
                                        {test.title}
                                    </h3>
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
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
