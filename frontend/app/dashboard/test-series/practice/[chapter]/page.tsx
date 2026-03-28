'use client';

import { fetchApi } from '../../../../lib/apiClient';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BrainCircuit, CheckCircle, Clock, FileText, Loader2, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTestSeriesUsage } from '../../layout';
import API_BASE_URL from '@/app/lib/api-config';

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    }
};

const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
};

export default function PracticeSessionEntry() {
    const params = useParams();
    const router = useRouter();
    const chapterId = String(params.chapter || '');

    const [sessionData, setSessionData] = useState<{ mcqs: any[], writex: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [selected, setSelected] = useState<Record<string, number>>({});
    const { remainingLabel, isLimited, isFreePlan } = useTestSeriesUsage();

    useEffect(() => {
        const loadSession = async () => {
            const { getStoredToken } = await import('@/app/lib/auth-storage');

            const attemptFetch = async (t: string) => {
                try {
                    const response = await fetchApi(`${API_BASE_URL}/test-series/student/session?targetId=${chapterId}&type=chapter`, {
                        headers: { Authorization: `Bearer ${t}` }
                    });
                    if (response.ok) return await response.json();
                    return null;
                } catch (e) { return null; }
            };

            const userToken = getStoredToken('user');
            const adminToken = getStoredToken('admin');

            setIsLoading(true);
            let data = null;
            if (userToken && chapterId) data = await attemptFetch(userToken);
            if (!data && adminToken && adminToken !== userToken && chapterId) {
                data = await attemptFetch(adminToken);
            }

            if (data) setSessionData(data);
            setIsLoading(false);
        };
        loadSession();
    }, [chapterId]);

    const handleStartPractice = () => {
        if (isLimited || totalCount === 0) return;
        setIsLive(true);
    };

    const mcqCount = sessionData?.mcqs?.length || 0;
    const writexCount = sessionData?.writex?.length || 0;
    const totalCount = mcqCount + writexCount;

    // Estimate time: 1 min per MCQ, 5 mins per WriteX
    const estimatedMinutes = (mcqCount * 1) + (writexCount * 5);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-700 overflow-x-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

            <div className="max-w-4xl mx-auto p-6 lg:p-10 relative z-10 pt-20">
                {!isLive && (
                    <Link href={`/dashboard/test-series/company`} className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 font-bold mb-10 transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </Link>
                )}

                {isLoading ? (
                    <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-orange-600 mx-auto mb-4" /> <span className="text-slate-500 font-bold">Constructing test parameters...</span></div>
                ) : (
                    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
                        {!isLive && (
                            <motion.div variants={item} className="text-center max-w-2xl mx-auto">
                                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-sm border border-orange-100">
                                    <BrainCircuit size={32} strokeWidth={2} />
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">Practice Session</h1>
                                <p className="text-lg text-slate-500 font-medium">
                                    A curated selection of questions built specifically for this chapter's topics.
                                </p>
                            </motion.div>
                        )}

                        {isLive ? (
                            <motion.div variants={item} className="space-y-8 mt-10">
                                {sessionData?.mcqs.map((mcq: any, index: number) => {
                                    const picked = selected[mcq.id];
                                    return (
                                        <div key={mcq.id} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 font-black flex items-center justify-center">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-bold text-slate-900 mb-6">{mcq.question}</h3>
                                                    <div className="grid gap-3">
                                                        {mcq.options.map((opt: string, optIndex: number) => {
                                                            const isPicked = picked === optIndex;
                                                            const isCorrect = optIndex === mcq.correctOptionIndex;
                                                            const isWrong = isPicked && !isCorrect;
                                                            const showCorrect = picked !== undefined;
                                                            return (
                                                                <button
                                                                    key={optIndex}
                                                                    onClick={() => {
                                                                        if (picked === undefined) {
                                                                            setSelected((prev) => ({ ...prev, [mcq.id]: optIndex }));
                                                                        }
                                                                    }}
                                                                    className={`w-full text-left px-5 py-4 rounded-2xl border transition-all font-medium ${showCorrect && isCorrect
                                                                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-600/10'
                                                                        : isWrong
                                                                            ? 'border-rose-400 bg-rose-50 text-rose-700 shadow-sm shadow-rose-600/10'
                                                                            : 'border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50/40 hover:shadow-md hover:text-orange-900'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between gap-4">
                                                                        <span className="leading-relaxed">{opt}</span>
                                                                        {showCorrect && isCorrect && <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />}
                                                                        {isWrong && <XCircle size={20} className="text-rose-600 shrink-0" />}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {sessionData?.writex && sessionData.writex.length > 0 && (
                                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
                                        <Sparkles className="mx-auto w-12 h-12 text-slate-300 mb-4" />
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">WriteX Simulator</h3>
                                        <p className="text-slate-500 font-medium">This session contains {sessionData.writex.length} WriteX questions. The live coding environment will be integrated shortly.</p>
                                    </div>
                                )}

                                <div className="text-center mt-10 pt-10 border-t border-slate-100 flex flex-col items-center">
                                    <div className="bg-slate-50 text-slate-500 font-bold px-4 py-2 rounded-full text-xs uppercase tracking-widest mb-6 border border-slate-200">
                                        End of Session
                                    </div>
                                    <button onClick={() => setIsLive(false)} className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-orange-600 hover:shadow-lg transition-all flex items-center gap-2">
                                        <ArrowLeft size={18} /> Finish & Return to Dashboard
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div variants={item} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mt-10">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Session Breakdown</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                                        <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5"><FileText size={14} /> Total</div>
                                        <div className="text-3xl font-black text-slate-900">{totalCount}</div>
                                    </div>
                                    <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100 text-center">
                                        <div className="text-orange-500 font-bold text-xs uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5"><CheckCircle size={14} /> MCQs</div>
                                        <div className="text-3xl font-black text-orange-600">{mcqCount}</div>
                                    </div>
                                    <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 text-center">
                                        <div className="text-emerald-500 font-bold text-xs uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5"><Sparkles size={14} /> WriteX</div>
                                        <div className="text-3xl font-black text-emerald-600">{writexCount}</div>
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-blue-100 flex items-center justify-center text-blue-600">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-blue-900">Estimated Duration</div>
                                            <div className="text-slate-600 text-sm">~{estimatedMinutes} Minutes to complete</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <button
                                        onClick={handleStartPractice}
                                        disabled={totalCount === 0 || isLimited}
                                        className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                                    >
                                        {totalCount === 0 ? 'No Questions Linked' : isLimited ? 'Upgrade to Practice' : 'Start Practice Session Now'}
                                    </button>
                                    {isFreePlan && !isLimited && (
                                        <p className="text-xs text-slate-500 mt-4 font-medium">Starts your free plan timer ({remainingLabel} left)</p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
