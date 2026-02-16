'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, PenTool, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

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

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const BackgroundDecor = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#F8FAFC]">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]" />
    </div>
);

export default function CommunicationTestsPage() {
    const [question, setQuestion] = useState<WriteXQuestion | null>(null);
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<WriteXResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/writex/question`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (data?.id) {
                    setQuestion(data);
                }
            })
            .catch(() => undefined);
    }, []);

    const submitAnswer = async () => {
        if (!question) return;
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        setIsSubmitting(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/writex/submit`, {
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
        <div className="min-h-screen font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-700 overflow-x-hidden pb-20">
            <BackgroundDecor />

            <div className="max-w-7xl mx-auto p-6 lg:p-12 relative z-10">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <Link href="/dashboard/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-medium mb-8 transition-all group px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Test Series
                    </Link>

                    <div className="flex items-center gap-4 mb-6 text-emerald-600">
                        <Sparkles size={24} className="animate-pulse" />
                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">WriteX Analysis</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-none">
                        WriteX <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Analysis.</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
                        Submit your response and receive a lenient AI score out of 100 with actionable feedback.
                    </p>
                </motion.header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/40"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <PenTool size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">WriteX Prompt</p>
                            <h2 className="text-2xl font-black text-slate-900">Answer the prompt below</h2>
                        </div>
                    </div>

                    {question ? (
                        <div className="space-y-6">
                            <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl text-slate-700 font-semibold">
                                {question.prompt}
                            </div>
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Write your response here..."
                                className="w-full h-56 p-4 border border-slate-200 rounded-2xl bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none resize-none"
                            />
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Aim for clarity and structure</p>
                                <button
                                    onClick={submitAnswer}
                                    disabled={isSubmitting || answer.trim().length === 0}
                                    className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                    {isSubmitting ? 'Evaluating...' : 'Submit Answer'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 font-semibold">No prompt available yet.</div>
                    )}

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="mt-8 grid gap-6">
                            <div className="p-6 border border-slate-200 rounded-3xl bg-slate-50">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Score</p>
                                <p className="text-4xl font-black text-emerald-600 mt-2">{result.score}</p>
                                <p className="text-slate-600 mt-2">{result.summary}</p>
                            </div>
                            {result.criteria && (
                                <div className="grid md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Relevance', value: result.criteria.relevance },
                                        { label: 'Fluency', value: result.criteria.fluency },
                                        { label: 'Grammar', value: result.criteria.grammar },
                                        { label: 'Vocabulary', value: result.criteria.vocabulary },
                                    ].map((item) => (
                                        <div key={item.label} className="p-4 bg-white border border-slate-200 rounded-2xl">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{item.label}</p>
                                            <p className="text-2xl font-black text-slate-900 mt-2">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 bg-emerald-50/60 border border-emerald-100 rounded-3xl">
                                    <h3 className="font-bold text-emerald-700 mb-3">Strengths</h3>
                                    <ul className="space-y-2 text-sm text-slate-700">
                                        {result.strengths?.map((item, idx) => (
                                            <li key={idx}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-6 bg-orange-50/60 border border-orange-100 rounded-3xl">
                                    <h3 className="font-bold text-orange-700 mb-3">Improvements</h3>
                                    <ul className="space-y-2 text-sm text-slate-700">
                                        {result.improvements?.map((item, idx) => (
                                            <li key={idx}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
