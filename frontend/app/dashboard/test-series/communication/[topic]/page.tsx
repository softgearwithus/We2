'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, PenTool, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import API_BASE_URL from '@/app/lib/api-config';
import { useTestSeriesUsage } from '../../layout';

interface WriteXQuestion {
    id: string;
    prompt: string;
}

interface WriteXResult {
    score: number;
    summary: string;
    criteria?: {
        relevance: number;
        fluency: number;
        grammar: number;
        vocabulary: number;
    };
    strengths: string[];
    improvements: string[];
}

export default function WriteXModuleSimulator({ params }: { params: Promise<{ topic: string }> }) {
    const resolvedParams = use(params);
    const { topic } = resolvedParams;

    const [question, setQuestion] = useState<WriteXQuestion | null>(null);
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<WriteXResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { remainingLabel, isLimited, isFreePlan } = useTestSeriesUsage();

    useEffect(() => {
        const loadQuestion = async () => {
            const { getStoredToken } = await import('@/app/lib/auth-storage');
            const token = getStoredToken('user') || getStoredToken('admin');
            if (!token) {
                setError('Your session has expired. Please sign in again.');
                return;
            }
            try {
                // Pass the topicKey to fetch the correct active prompt for this module
                const response = await fetch(`${API_BASE_URL}/writex/question?topicKey=${topic}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                });
                if (!response.ok) {
                    if (response.status === 404) setError('No active prompt found for this module.');
                    return;
                }
                const data = await response.json();
                if (data?.id) {
                    setQuestion(data);
                } else {
                    setError('No active prompt found for this module.');
                }
            } catch {
                setError('Failed to load prompt.');
            }
        };
        loadQuestion();
    }, [topic]);

    const submitAnswer = async () => {
        if (!question) return;
        const { getStoredToken } = await import('@/app/lib/auth-storage');
        const token = getStoredToken('user') || getStoredToken('admin');
        if (!token) {
            setError('Your session has expired. Please sign in again.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`${API_BASE_URL}/writex/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    questionId: question.id,
                    answer,
                }),
            });

            if (!response.ok) {
                throw new Error('Evaluation failed');
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-700 overflow-x-hidden pb-20 relative">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

            <div className="max-w-4xl mx-auto p-6 lg:p-10 relative z-10">
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-14 mt-6"
                >
                    <Link href="/dashboard/test-series/communication" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-8 transition-colors group px-4 py-2 rounded-full hover:bg-white bg-transparent border border-transparent hover:border-slate-200">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Modules
                    </Link>

                    <div>
                        <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4 inline-flex items-center gap-2 border border-emerald-100">
                            <Sparkles size={14} /> WriteX Analysis
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-4 capitalize">
                            Topic: <span className="text-emerald-600">{topic.replace(/_/g, ' ')}</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium max-w-2xl">
                            Submit your response for this module and receive an instant AI score with actionable feedback.
                        </p>
                        {isFreePlan && (
                            <div className={`mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${isLimited ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                Free plan time left in WriteX: {remainingLabel}
                            </div>
                        )}
                    </div>
                </motion.header>

                    <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}
                    className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-100 shadow-sm relative overflow-hidden"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                            <PenTool size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">WriteX Prompt</p>
                            <h2 className="text-xl font-bold text-slate-900">Answer the prompt below</h2>
                        </div>
                    </div>

                    {error && !question ? (
                        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
                            <p className="text-slate-600 font-medium">{error}</p>
                            <Link href="/dashboard/test-series/communication" className="mt-4 inline-block text-emerald-600 font-bold hover:underline">Return to Modules</Link>
                        </div>
                    ) : question ? (
                        <div className="space-y-6">
                            <div className="p-5 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl text-slate-800 font-medium leading-relaxed">
                                {question.prompt}
                            </div>
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Type your response here..."
                                disabled={isLimited}
                                className={`w-full h-48 p-5 border border-slate-200 rounded-2xl bg-white text-sm font-medium transition-all outline-none resize-none shadow-inner ${isLimited ? 'opacity-60 cursor-not-allowed' : 'focus:bg-slate-50/50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                            />
                            <div className="flex items-center justify-between pt-2">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest hidden sm:block">Aim for clarity & structure</p>
                                <button
                                    onClick={submitAnswer}
                                    disabled={isSubmitting || answer.trim().length === 0 || isLimited}
                                    className="px-8 py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                    {isSubmitting ? 'Evaluating...' : 'Submit Answer'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 font-medium py-10 text-center"><Loader2 className="animate-spin mx-auto mb-2" size={24}/>Loading your prompt...</div>
                    )}

                    {error && question && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center justify-center">
                            {error}
                        </div>
                    )}

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-10 pt-10 border-t border-slate-100 grid gap-6"
                        >
                            <div className="p-6 border border-slate-200 rounded-2xl bg-slate-50 shadow-sm">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Score</p>
                                <p className="text-5xl font-black text-emerald-600 mt-2">{result.score}<span className="text-xl text-slate-400">/100</span></p>
                                <p className="text-slate-600 mt-3 font-medium">{result.summary}</p>
                            </div>

                            {result.criteria && (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Relevance', value: result.criteria.relevance },
                                        { label: 'Fluency', value: result.criteria.fluency },
                                        { label: 'Grammar', value: result.criteria.grammar },
                                        { label: 'Vocabulary', value: result.criteria.vocabulary },
                                    ].map((item) => (
                                        <div key={item.label} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{item.label}</p>
                                            <p className="text-xl font-bold text-slate-900 mt-1">{item.value}/100</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-5 bg-emerald-50/50 border border-emerald-100/50 rounded-xl">
                                    <h3 className="font-bold text-emerald-700 mb-3 text-sm uppercase tracking-wide">Strengths</h3>
                                    <ul className="space-y-2 text-sm text-emerald-900/80 font-medium">
                                        {result.strengths?.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-emerald-500 mt-0.5">•</span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-5 bg-orange-50/50 border border-orange-100/50 rounded-xl">
                                    <h3 className="font-bold text-orange-700 mb-3 text-sm uppercase tracking-wide">Areas to Improve</h3>
                                    <ul className="space-y-2 text-sm text-orange-900/80 font-medium">
                                        {result.improvements?.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-orange-500 mt-0.5">•</span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
