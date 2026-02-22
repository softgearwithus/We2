'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code2, Loader2, Search } from 'lucide-react';
import { DsaAdminProblem, fetchAdminDsaProblems } from '@/app/lib/training-admin';

const DIFFICULTIES = [
    { value: '', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
];

const CATEGORIES = [
    { value: '', label: 'All Categories' },
    { value: 'array', label: 'Array' },
    { value: 'string', label: 'String' },
    { value: 'linked_list', label: 'Linked List' },
    { value: 'tree', label: 'Tree' },
    { value: 'graph', label: 'Graph' },
    { value: 'dp', label: 'DP' },
    { value: 'greedy', label: 'Greedy' },
    { value: 'backtracking', label: 'Backtracking' },
    { value: 'sorting', label: 'Sorting' },
    { value: 'searching', label: 'Searching' },
];

export default function AdminDsaTrainingList() {
    const [items, setItems] = useState<DsaAdminProblem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        difficulty: '',
        category: '',
        search: '',
        page: 1,
    });

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';

    const loadData = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const response = await fetchAdminDsaProblems(token, {
                difficulty: filters.difficulty,
                category: filters.category,
                search: filters.search,
                page: filters.page,
                limit: 50,
            });
            setItems(response.items);
        } catch (error: any) {
            setMessage(error.message || 'Failed to load DSA problems.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token) return;
        loadData();
    }, [filters.difficulty, filters.category, filters.search, filters.page]);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 pb-6">
                <div>
                    <Link href="/admin/training" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-4 transition-colors">
                        <ArrowLeft size={18} /> Back to Training
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">DSA Training Problems</h1>
                    <p className="text-slate-500 mt-1 font-medium">Read-only list for admin oversight and dataset verification.</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Code2 size={18} /> Problem Index
                    </div>
                    <div className="flex-1" />
                    <div className="flex flex-1 gap-3">
                        <div className="flex-1 relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={filters.search}
                                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                                placeholder="Search by title or slug"
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm"
                            />
                        </div>
                        <select
                            value={filters.difficulty}
                            onChange={(e) => setFilters((prev) => ({ ...prev, difficulty: e.target.value, page: 1 }))}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
                        >
                            {DIFFICULTIES.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value, page: 1 }))}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
                        >
                            {CATEGORIES.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {message && (
                    <div className="mt-4 px-4 py-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 text-sm font-bold">
                        {message}
                    </div>
                )}

                {isLoading ? (
                    <div className="py-16 text-center text-slate-400">
                        <Loader2 className="animate-spin mx-auto mb-3" />
                        Loading problems...
                    </div>
                ) : (
                    <div className="mt-6 space-y-4">
                        {items.map((problem) => (
                            <div key={problem.id} className="border border-slate-200 rounded-2xl p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{problem.difficulty}</p>
                                        <h3 className="text-base font-bold text-slate-900 mt-1">{problem.title}</h3>
                                        <p className="text-xs text-slate-500 mt-2">Slug: {problem.slug}</p>
                                    </div>
                                    <div className="text-xs font-semibold text-slate-400">
                                        {new Date(problem.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && (
                            <div className="py-10 text-center text-slate-500">No problems found for this filter.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
