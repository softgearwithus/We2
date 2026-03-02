'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Clock, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { fetchStudentResults } from '@/app/lib/test-series-builder';
import { getStoredToken } from '@/app/lib/auth-storage';

type ResultStatus = 'ready' | 'in_progress';

export default function MockAnalysisPage() {
    const router = useRouter();
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const loadResults = async () => {
            setIsLoading(true);
            setErrorMsg('');
            try {
                const token = getStoredToken('user') || getStoredToken('admin');
                if (!token) throw new Error('No token');
                const data = await fetchStudentResults(token);
                setResults(Array.isArray(data) ? data : []);
            } catch (error: any) {
                setErrorMsg(error?.message || 'Failed to load results.');
            } finally {
                setIsLoading(false);
            }
        };

        loadResults();
    }, []);

    const completedResults = useMemo(() => results.filter((result) => Boolean(result?.endTime)), [results]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-600">
                <Loader2 size={36} className="animate-spin" />
                <p className="mt-4 font-semibold">Loading your mock analysis...</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-600">
                <AlertCircle size={36} className="text-rose-500" />
                <p className="mt-4 font-semibold">{errorMsg}</p>
                <button onClick={() => router.back()} className="mt-6 text-indigo-600 font-bold hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 pb-20">
            <div className="max-w-6xl mx-auto p-6 lg:p-10">
                <Link href="/dashboard/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors group px-4 py-2 rounded-full hover:bg-white bg-transparent border border-transparent hover:border-slate-200">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Test Series
                </Link>

                <div className="mb-10">
                    <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4 inline-flex items-center gap-2 border border-indigo-100">
                        Mock Analysis
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Your completed mock submissions.</h1>
                    <p className="text-slate-500 mt-2 font-medium">Open a result to view detailed feedback and AI evaluation.</p>
                </div>

                {completedResults.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-2xl font-bold text-slate-800">No completed submissions yet.</h3>
                        <p className="text-slate-500 mt-2 font-medium">Submit a company mock test to see analysis here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {completedResults.map((result) => {
                            const company = result.mockTest?.company;
                            const status: ResultStatus = result.isEvaluated ? 'ready' : 'in_progress';
                            const actionLabel = status === 'ready' ? 'View Result' : 'Check Status';
                            return (
                                <div
                                    key={result.id}
                                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all flex flex-col"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                <Building2 size={22} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Company</p>
                                                <p className="text-lg font-black text-slate-900">{company?.name || 'Company'}</p>
                                            </div>
                                        </div>
                                        {status === 'ready' ? (
                                            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                                                <CheckCircle2 size={14} /> Result ready
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                                                <Clock size={14} /> Result in progress
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Module Attempted</p>
                                            <p className="text-base font-semibold text-slate-800">{result.mockTest?.title || 'Mock Test'}</p>
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">
                                            Submitted on {result.createdAt ? new Date(result.createdAt).toLocaleString() : 'recently'}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push(`/dashboard/test-series/analysis/${result.id}`)}
                                        className={`mt-6 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${status === 'ready'
                                            ? 'bg-slate-900 text-white hover:bg-indigo-600'
                                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                            }`}
                                    >
                                        {actionLabel} <ChevronRight size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
