'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { problems as mockProblems, Problem, fetchProblems } from '@/app/lib/problems';
import {
    Search, Filter, CheckCircle2, Circle, Clock, ChevronLeft, ChevronRight,
    TrendingUp, Award, Calendar, ExternalLink
} from 'lucide-react';

export default function ProblemListingPage() {
    // State for filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
    const [selectedStatus, setSelectedStatus] = useState<string>('All');
    const [selectedTag, setSelectedTag] = useState<string>('All');
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProblems = async () => {
            setLoading(true);
            const data = await fetchProblems();
            setProblems(data);
            setLoading(false);
        };
        loadProblems();
    }, []);

    // Stats Logic
    const stats = {
        solved: problems.filter(p => p.status === 'Solved').length,
        attempted: problems.filter(p => p.status === 'Attempted').length,
        total: problems.length,
        easy: problems.filter(p => p.difficulty === 'Easy').length,
        medium: problems.filter(p => p.difficulty === 'Medium').length,
        hard: problems.filter(p => p.difficulty === 'Hard').length
    };

    // Filter Logic
    const filteredProblems = useMemo(() => {
        return problems.filter(problem => {
            const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                problem.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesDifficulty = selectedDifficulty === 'All' || problem.difficulty === selectedDifficulty;
            const matchesStatus = selectedStatus === 'All' || problem.status === selectedStatus;
            const matchesTag = selectedTag === 'All' || problem.tags.includes(selectedTag); // Simple exact match for dropdown

            return matchesSearch && matchesDifficulty && matchesStatus && matchesTag;
        });
    }, [problems, searchQuery, selectedDifficulty, selectedStatus, selectedTag]);

    // Unique Tags for Filter Dropdown
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        problems.forEach(p => p.tags.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [problems]);

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'Easy': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Hard': return 'text-red-600 bg-red-50 border-red-100';
            default: return 'text-slate-600';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-8">
            {/* Header & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">Problem Set</h1>
                    <p className="text-slate-500">Master Data Structures & Algorithms with our curated list of problems.</p>
                </div>

                {/* Gamification Card - Preview */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Weekly Streak</div>
                        <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            3 Days <span className="text-base text-yellow-500">🔥</span>
                        </div>
                    </div>
                    <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                        <Award size={20} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Filters & List */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Filters Bar */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search questions, tags, or companies..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:border-indigo-500 outline-none"
                            >
                                <option value="All">Difficulty</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:border-indigo-500 outline-none"
                            >
                                <option value="All">Status</option>
                                <option value="Solved">Solved</option>
                                <option value="Attempted">Attempted</option>
                                <option value="Todo">Todo</option>
                            </select>

                            <select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:border-indigo-500 outline-none"
                            >
                                <option value="All">Tags</option>
                                {allTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Problem Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4 w-12 text-center">Status</th>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4 w-32">Difficulty</th>
                                    <th className="px-6 py-4 w-32">Acceptance</th>
                                    <th className="px-6 py-4 hidden md:table-cell">Tags</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProblems.map((problem) => (
                                    <tr key={problem.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 text-center">
                                            {problem.status === 'Solved' && <CheckCircle2 className="mx-auto text-emerald-500" size={18} />}
                                            {problem.status === 'Attempted' && <Clock className="mx-auto text-amber-500" size={18} />}
                                            {problem.status === 'Todo' && <Circle className="mx-auto text-slate-300" size={18} />}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            <Link href={`/dashboard/dsa/${problem.id}`} className="text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                                                {problem.title}
                                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(problem.difficulty)}`}>
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {problem.acceptanceRate}%
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="flex gap-2 flex-wrap">
                                                {problem.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {problem.tags.length > 2 && (
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">+{problem.tags.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredProblems.length === 0 && (
                            <div className="p-8 text-center text-slate-500">
                                No problems found matching your filters.
                            </div>
                        )}

                        {/* Pagination (Mock) */}
                        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                            <div>Showing 1 to {Math.min(filteredProblems.length, 10)} of {filteredProblems.length} entries</div>
                            <div className="flex gap-1">
                                <button className="p-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled><ChevronLeft size={16} /></button>
                                <button className="p-2 border border-slate-200 rounded hover:bg-slate-50 bg-indigo-50 text-indigo-600 border-indigo-200 font-bold">1</button>
                                <button className="p-2 border border-slate-200 rounded hover:bg-slate-50">2</button>
                                <button className="p-2 border border-slate-200 rounded hover:bg-slate-50"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Progress & Widgets */}
                <div className="space-y-6">
                    {/* Progress Card */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-indigo-600" />
                            Session Progress
                        </h3>
                        <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                            {/* Simple CSS Circle Chart Mock */}
                            <div className="absolute inset-0 rounded-full border-8 border-slate-100"></div>
                            <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-indigo-500 border-r-indigo-500 rotate-45"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-slate-900">{stats.solved}</div>
                                <div className="text-xs text-slate-400 font-medium uppercase">Solved</div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-600 font-medium">Easy</span>
                                <span className="text-slate-900 font-bold">{stats.easy} <span className="text-slate-400 font-normal">/ 45</span></span>
                            </div>
                            <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[30%]"></div>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-amber-600 font-medium">Medium</span>
                                <span className="text-slate-900 font-bold">{stats.medium} <span className="text-slate-400 font-normal">/ 86</span></span>
                            </div>
                            <div className="w-full bg-amber-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full w-[12%]"></div>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-red-600 font-medium">Hard</span>
                                <span className="text-slate-900 font-bold">{stats.hard} <span className="text-slate-400 font-normal">/ 20</span></span>
                            </div>
                            <div className="w-full bg-red-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full w-[5%]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Daily Challenge Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="text-indigo-100 text-xs font-bold uppercase mb-1">Daily Challenge</div>
                                <div className="font-bold text-lg">Merge Intervals</div>
                            </div>
                            <Calendar className="text-indigo-200" size={24} />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-indigo-100 mb-4">
                            <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-bold">Medium</span>
                            <span>+10 XP</span>
                        </div>
                        <button className="w-full py-2 bg-white text-indigo-600 font-bold rounded-lg text-sm hover:bg-indigo-50 transition-colors">
                            Solve Now
                        </button>
                    </div>

                    {/* Companies */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Top Companies</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Google', 'Amazon', 'Facebook', 'Microsoft', 'Uber'].map(c => (
                                <button key={c} className="px-3 py-1.5 bg-slate-500 hover:bg-slate-100 rounded-full text-xs font-medium text-slate-600 border border-slate-200 transition-colors">
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
