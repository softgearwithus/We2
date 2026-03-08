'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, ListFilter } from 'lucide-react';

import { fetchSqlProblems, SqlProblem } from '@/app/lib/sql-problems';
import { fetchSqlTrainingTaskForProblem } from '@/app/lib/sql-training';
import { useSectionUsage } from '@/app/hooks/useSectionUsage';
import UsageUpgradeGate from '@/app/components/shared/UsageUpgradeGate';

const platformLabel = (platform?: string | null) => {
    if (platform === 'hackerrank') return 'HackerRank';
    return 'LeetCode';
};

export default function SqlAllProblemsPage() {
    const router = useRouter();
    const [problems, setProblems] = useState<SqlProblem[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [difficulty, setDifficulty] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [platform, setPlatform] = useState<string | null>(null);

    const { remainingLabel, isLimited, isFreePlan } = useSectionUsage('sql');

    useEffect(() => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('sql_platform') : null;
        setPlatform(stored || 'leetcode');
    }, []);

    useEffect(() => {
        if (!platform) return;
        const loadProblems = async () => {
            setLoading(true);
            try {
                setErrorMessage(null);
                const data = await fetchSqlProblems(platform);
                setProblems(data);
            } catch (error) {
                setErrorMessage('Failed to load questions. Check your API server and try again.');
                setProblems([]);
            } finally {
                setLoading(false);
            }
        };
        loadProblems();
    }, [platform]);

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

    const handleSelect = async (problem: SqlProblem) => {
        const { getActiveToken } = await import('@/app/lib/auth-storage');
        const token = getActiveToken() || '';
        try {
            await fetchSqlTrainingTaskForProblem(token, problem.uuid);
            router.push('/dashboard/sql');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to open training task.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="border-b border-slate-200 bg-white">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <Link href="/dashboard/sql" className="flex items-center hover:text-indigo-600 transition-colors">
                            <ArrowLeft size={16} /> <span className="ml-1">Training</span>
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="font-bold text-slate-700">All Questions</span>
                        {platform && (
                            <span className="ml-1 text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                {platformLabel(platform)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <ListFilter size={12} /> {problems.length} questions
                    </div>
                </div>
            </div>

            {isFreePlan && (
                <div className="max-w-6xl mx-auto px-6 pt-4">
                    <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${isLimited ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                        Free plan time left in SQL: {remainingLabel}
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-6 py-6">
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4 relative">
                    {isLimited && (
                        <UsageUpgradeGate message="Upgrade to continue your SQL practice." />
                    )}
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
                            {filtered.map((problem) => (
                                <button
                                    key={problem.uuid}
                                    onClick={() => handleSelect(problem)}
                                    disabled={isLimited}
                                    className={`w-full text-left px-3 py-4 transition-colors ${isLimited ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-semibold text-slate-800">{problem.title}</div>
                                            <div className="mt-1 text-[11px] text-slate-500">{problem.id}</div>
                                            {problem.companies && problem.companies.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {problem.companies.slice(0, 5).map((c) => (
                                                        <span key={c} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                                            {c}
                                                        </span>
                                                    ))}
                                                    {problem.companies.length > 5 && (
                                                        <span className="text-[10px] text-slate-400">+{problem.companies.length - 5}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0 ${
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
                            {!filtered.length && (
                                <div className="py-6 text-sm text-slate-500">No questions match your filters.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

