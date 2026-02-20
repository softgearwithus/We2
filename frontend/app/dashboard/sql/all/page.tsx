'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, ListFilter, Lock, Sparkles, X } from 'lucide-react';

import { fetchSqlProblems, SqlProblem } from '@/app/lib/sql-problems';
import { fetchSqlTrainingTaskForProblem } from '@/app/lib/sql-training';
import { useAuth } from '@/app/context/AuthContext';

const PLAN_HIERARCHY = {
    free: 0,
    standard_tier: 1,
    pro_tier: 2,
    placement_plus: 3,
    industry_plus: 4,
    we2_max: 5,
};

const PREVIEW_COUNT = 3;

export default function SqlAllProblemsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [problems, setProblems] = useState<SqlProblem[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [difficulty, setDifficulty] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showUpgrade, setShowUpgrade] = useState(false);

    useEffect(() => {
        const loadProblems = async () => {
            setLoading(true);
            try {
                setErrorMessage(null);
                const data = await fetchSqlProblems();
                setProblems(data);
            } catch (error) {
                setErrorMessage('Failed to load questions. Check your API server and try again.');
                setProblems([]);
            } finally {
                setLoading(false);
            }
        };
        loadProblems();
    }, []);

    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return problems.filter((p) => {
            const matchesQuery = !normalized
                || p.title.toLowerCase().includes(normalized)
                || p.id.toLowerCase().includes(normalized);
            const matchesDifficulty = difficulty === 'all' || p.difficulty === difficulty;
            return matchesQuery && matchesDifficulty;
        });
    }, [problems, query, difficulty]);

    const endDate = user?.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
    const isExpired = endDate && !Number.isNaN(endDate.getTime()) && endDate.getTime() <= Date.now();
    const isActive = user?.subscriptionStatus === 'active' && !isExpired;
    const userPlan = isActive ? (user?.subscriptionPlan || 'free') : 'free';
    const userLevel = PLAN_HIERARCHY[userPlan as keyof typeof PLAN_HIERARCHY] ?? 0;
    const hasFullAccess = userLevel >= PLAN_HIERARCHY.standard_tier;
    const preview = hasFullAccess ? filtered : filtered.slice(0, PREVIEW_COUNT);
    const locked = hasFullAccess ? [] : filtered.slice(PREVIEW_COUNT);

    const handleSelect = async (problem: SqlProblem) => {
        const token = localStorage.getItem('accessToken') || '';
        try {
            await fetchSqlTrainingTaskForProblem(token, problem.uuid);
            router.push('/dashboard/sql');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to open training task.');
        }
    };

    return (
        <>
            <div className="min-h-screen bg-slate-50">
            <div className="border-b border-slate-200 bg-white">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <Link href="/dashboard/sql" className="flex items-center hover:text-indigo-600 transition-colors">
                            <ArrowLeft size={16} /> <span className="ml-1">Training</span>
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="font-bold text-slate-700">All Questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <ListFilter size={12} /> {problems.length} questions
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6">
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 flex-1">
                            <Search size={14} />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search problems..."
                                className="bg-transparent outline-none flex-1 text-xs"
                            />
                        </div>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as any)}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 bg-white"
                        >
                            <option value="all">All difficulties</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="text-sm text-slate-500">Loading questions...</div>
                    ) : errorMessage ? (
                        <div className="text-sm text-rose-500">{errorMessage}</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {!filtered.length ? (
                                <div className="py-6 text-sm text-slate-500">No questions match your filters.</div>
                            ) : (
                                <>
                                    {preview.map((problem) => (
                                        <button
                                            key={problem.uuid}
                                            onClick={() => handleSelect(problem)}
                                            className="w-full text-left px-3 py-4 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-800">{problem.title}</div>
                                                    <div className="mt-1 text-[11px] text-slate-500">{problem.id}</div>
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                                                    problem.difficulty === 'Easy'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : problem.difficulty === 'Medium'
                                                            ? 'bg-amber-50 text-amber-700'
                                                            : 'bg-rose-50 text-rose-700'
                                                }`}>
                                                    {problem.difficulty}
                                                </span>
                                            </div>
                                        </button>
                                    ))}

                                    {!hasFullAccess && locked.length > 0 && (
                                        <div className="px-3 py-4">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-white px-5 py-4 shadow-lg">
                                                <div>
                                                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-orange-100 text-brand-orange text-[10px] font-bold uppercase tracking-widest mb-2">
                                                        <Lock size={12} /> Preview Limit
                                                    </div>
                                                    <div className="text-lg font-black text-slate-900">You unlocked 3 free SQL questions.</div>
                                                    <div className="text-xs text-slate-500 font-medium">Go Standard or Pro to open the full SQL vault + mastery tracking.</div>
                                                </div>
                                                <button
                                                    onClick={() => setShowUpgrade(true)}
                                                    className="inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-brand-orange to-red-500 px-4 py-2.5 rounded-xl shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 hover:-translate-y-0.5 transition-all"
                                                >
                                                    <Sparkles size={14} /> Upgrade Now
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!hasFullAccess && locked.length > 0 && (
                                        <div className="divide-y divide-slate-100 blur-[2px] pointer-events-none select-none">
                                            {locked.map((problem) => (
                                                <div key={problem.uuid} className="w-full text-left px-3 py-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <div className="text-sm font-semibold text-slate-800">{problem.title}</div>
                                                            <div className="mt-1 text-[11px] text-slate-500">{problem.id}</div>
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                                                            problem.difficulty === 'Easy'
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : problem.difficulty === 'Medium'
                                                                    ? 'bg-amber-50 text-amber-700'
                                                                    : 'bg-rose-50 text-rose-700'
                                                        }`}>
                                                            {problem.difficulty}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            </div>
            {showUpgrade && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
                onClick={() => setShowUpgrade(false)}
            >
                <div
                    className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-8 text-center shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => setShowUpgrade(false)}
                        className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                        <X size={16} />
                    </button>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-4">
                        SQL Premium
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-3">Unlock the full SQL problem bank</h3>
                    <p className="text-slate-600 font-medium mb-6">
                        You have a 3-question preview. Upgrade to Standard or Pro to access every query challenge and mastery tracking.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/pricing"
                            className="flex-1 bg-gradient-to-r from-brand-orange to-red-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles size={18} /> Upgrade Now
                        </Link>
                        <button
                            onClick={() => setShowUpgrade(false)}
                            className="flex-1 bg-white text-slate-700 font-bold py-3.5 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                            Maybe Later
                        </button>
                    </div>
                    <p className="mt-6 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Join the students shipping offers faster
                    </p>
                </div>
            </div>
            )}
        </>
    );
}
