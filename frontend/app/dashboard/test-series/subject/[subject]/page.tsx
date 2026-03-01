'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTestSeriesUsage } from '../../layout';

interface McqQuestion {
    id: string;
    subject: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
}

const SUBJECT_LABELS: Record<string, string> = {
    english: 'English',
    aptitude: 'Aptitude',
    logical_reasoning: 'Logical Reasoning',
    computer_science: 'Computer Science',
};

export default function SubjectMcqsPage() {
    const params = useParams();
    const subject = String(params.subject || '');
    const label = SUBJECT_LABELS[subject] || 'Subject';

    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [items, setItems] = useState<McqQuestion[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<Record<string, number>>({});

    const { remainingLabel, isLimited, isFreePlan } = useTestSeriesUsage();

    const hasNext = page * limit < total;

    useEffect(() => {
        const loadQuestions = async () => {
            const { getStoredToken } = await import('@/app/lib/auth-storage');
            const token = getStoredToken('user') || getStoredToken('admin');
            if (!token || !subject) return;

            setLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mcqs?category=subject&groupKey=${subject}&page=${page}&limit=${limit}&order=latest`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) return;
                const data = await response.json();
                if (data?.items) {
                    setItems(data.items);
                    setTotal(data.total || 0);
                }
            } finally {
                setLoading(false);
            }
        };
        loadQuestions();
    }, [subject, page, limit]);

    const progressLabel = useMemo(() => {
        const start = (page - 1) * limit + 1;
        const end = Math.min(page * limit, total);
        return total ? `${start}-${end} of ${total}` : '0';
    }, [page, limit, total]);

    const handleSelect = (questionId: string, optionIndex: number) => {
        setSelected((prev) => ({ ...prev, [questionId]: optionIndex }));
    };

    return (
        <div className="min-h-screen font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 bg-[#F8FAFC] pb-24">
            <div className="max-w-6xl mx-auto px-6 py-10">
                <Link href="/dashboard/test-series/subject" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-8 transition-all group px-5 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md active:scale-95">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Subjects
                </Link>

                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Test Series</p>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mt-2">{label} MCQs</h1>
                        <p className="text-slate-500 mt-3 font-medium">Practice in continuous sets of 50 questions.</p>
                        {isFreePlan && (
                            <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${isLimited ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                Free plan time left: {remainingLabel}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm">
                        <div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Progress</p>
                            <p className="text-sm font-bold text-slate-900">{progressLabel}</p>
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 font-semibold">Loading questions...</div>
                ) : (
                    <div className="space-y-8 relative">
                        {items.map((mcq, index) => {
                            const picked = selected[mcq.id];
                            return (
                                <div key={mcq.id} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 font-black flex items-center justify-center">
                                            {(page - 1) * limit + index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 mb-4">{mcq.question}</h3>
                                            <div className="grid gap-3">
                                                {mcq.options.map((opt, optIndex) => {
                                                    const isPicked = picked === optIndex;
                                                    const isCorrect = optIndex === mcq.correctOptionIndex;
                                                    const isWrong = isPicked && !isCorrect;
                                                    const showCorrect = picked !== undefined;
                                                    return (
                                                        <button
                                                            key={optIndex}
                                                            onClick={() => handleSelect(mcq.id, optIndex)}
                                                            disabled={isLimited}
                                                            className={`w-full text-left px-4 py-3 rounded-2xl border transition-all font-medium ${showCorrect && isCorrect
                                                                ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                                                                : isWrong
                                                                    ? 'border-rose-400 bg-rose-50 text-rose-700'
                                                                    : `border-slate-200 bg-white text-slate-700 ${isLimited ? 'opacity-60 cursor-not-allowed' : 'hover:border-indigo-200 hover:bg-indigo-50/40'}`
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span>{opt}</span>
                                                                {showCorrect && isCorrect && <CheckCircle2 size={18} className="text-emerald-600" />}
                                                                {isWrong && <XCircle size={18} className="text-rose-600" />}
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

                        {items.length === 0 && (
                            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 font-semibold">
                                No questions available yet. Check back soon.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between mt-12">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-6 py-3 rounded-2xl border border-slate-200 bg-white text-slate-500 font-bold disabled:opacity-50"
                    >
                        Previous 50
                    </button>
                    <button
                        onClick={() => setPage((p) => (hasNext ? p + 1 : p))}
                        disabled={!hasNext}
                        className="px-6 py-3 rounded-2xl border border-indigo-500 bg-indigo-600 text-white font-bold disabled:opacity-50 flex items-center gap-2"
                    >
                        Next 50 <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
