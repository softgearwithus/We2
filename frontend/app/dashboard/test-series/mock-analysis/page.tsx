'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Clock, ChevronRight, CheckCircle2, AlertCircle, Loader2, Search, Filter } from 'lucide-react';
import { fetchStudentResults } from '@/app/lib/test-series-builder';
import { getStoredToken } from '@/app/lib/auth-storage';

type ResultStatus = 'ready' | 'in_progress';

export default function MockAnalysisPage() {
    const router = useRouter();
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'company' | 'practice'>('all');

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

    const filteredResults = useMemo(() => {
        let filtered = completedResults;
        
        if (filterType === 'company') {
            filtered = filtered.filter(r => r.resultType !== 'subject_practice');
        } else if (filterType === 'practice') {
            filtered = filtered.filter(r => r.resultType === 'subject_practice');
        }

        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(r => {
                const isSubjectPractice = r.resultType === 'subject_practice';
                const companyName = isSubjectPractice ? 'Subject Practice' : r.mockTest?.company?.name || 'Company';
                const title = isSubjectPractice ? r.titleSnapshot || `${r.subject} - ${r.topic}` : r.mockTest?.title || 'Mock Test';
                
                return companyName.toLowerCase().includes(lowerQuery) || title.toLowerCase().includes(lowerQuery);
            });
        }
        
        return filtered;
    }, [completedResults, filterType, searchQuery]);

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
                <button onClick={() => router.back()} className="mt-6 text-slate-800 font-bold hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-slate-100 selection:text-slate-900 pb-20">
            <div className="max-w-6xl mx-auto p-6 lg:p-10">
                <Link href="/dashboard/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-8 transition-colors group px-4 py-2 rounded-full hover:bg-white bg-transparent border border-transparent hover:border-slate-200">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Test Series
                </Link>

                <div className="mb-10">
                    <div className="bg-slate-50 text-slate-800 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4 inline-flex items-center gap-2 border border-slate-200">
                        Mock Analysis
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Your completed mock submissions.</h1>
                    <p className="text-slate-500 mt-2 font-medium">Open a result to view detailed feedback and AI evaluation.</p>
                </div>

                {completedResults.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-2xl font-bold text-slate-800">No completed submissions yet.</h3>
                        <p className="text-slate-500 mt-2 font-medium">Submit a company mock test or practice module to see analysis here.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by module or company..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                />
                            </div>
                            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shrink-0">
                                {(['all', 'company', 'practice'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${
                                            filterType === type 
                                            ? 'bg-slate-100 text-slate-900 shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredResults.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm border-dashed">
                                <Search size={40} className="mx-auto text-slate-200 mb-4" />
                                <h3 className="text-xl font-bold text-slate-700">No matching submissions.</h3>
                                <p className="text-slate-500 mt-1 font-medium text-sm">Try adjusting your filters or search query.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredResults.map((result) => {
                            const isSubjectPractice = result.resultType === 'subject_practice';
                            const company = isSubjectPractice ? { name: 'Subject Practice' } : result.mockTest?.company;
                            const title = isSubjectPractice ? result.titleSnapshot || `${result.subject} - ${result.topic}` : result.mockTest?.title || 'Mock Test';
                            const status: ResultStatus = result.isEvaluated ? 'ready' : 'in_progress';
                            const actionLabel = status === 'ready' ? 'View Result' : 'Check Status';
                            return (
                                <div
                                    key={result.id}
                                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:border-slate-200 hover:shadow-lg transition-all flex flex-col"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-800 flex items-center justify-center">
                                                <Building2 size={22} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    {isSubjectPractice ? 'Practice' : 'Company'}
                                                </p>
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
                                            <p className="text-base font-semibold text-slate-800">{title}</p>
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">
                                            Submitted on {result.createdAt ? new Date(result.createdAt).toLocaleString() : 'recently'}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push(`/dashboard/test-series/analysis/${result.id}`)}
                                        className={`mt-6 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${status === 'ready'
                                            ? 'bg-slate-900 text-white hover:bg-slate-800'
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
                </>
                )}
            </div>
        </div>
    );
}
