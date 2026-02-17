'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Cpu, Wrench, Users, BookOpen, ChevronRight, Trophy, Flame, Target, Star, MoreHorizontal, Calendar, BarChart, Search, Filter, Sparkles } from 'lucide-react';

const tracks = [
    {
        id: 'programming',
        title: 'Programming Skills',
        desc: 'Master compilation, runtime, and algorithms.',
        icon: Code2,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        href: '/dashboard/skillforge/programming',
        progress: 65,
        total: 120,
        tags: ['Java', 'Python', 'C++'],
        category: 'Development'
    },
    {
        id: 'technology',
        title: 'Full Stack Development',
        desc: 'Build scalable web applications from scratch.',
        icon: Cpu,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        href: '/dashboard/skillforge/technology',
        progress: 30,
        total: 80,
        tags: ['React', 'Node.js', 'Docker'],
        category: 'Development'
    },
    {
        id: 'ds_algo',
        title: 'Data Structures & Algo',
        desc: 'Ace technical interviews with optimized solutions.',
        icon: Target,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        href: '/dashboard/skillforge/dsa',
        progress: 45,
        total: 150,
        tags: ['Arrays', 'Graphs', 'DP'],
        category: 'Placement'
    },
    {
        id: 'system_design',
        title: 'System Design',
        desc: 'Architect scalable systems (HLD/LLD).',
        icon: Users,
        color: 'text-indigo-500',
        bg: 'bg-indigo-500/10',
        href: '/dashboard/skillforge/system-design',
        progress: 15,
        total: 50,
        tags: ['Scalability', 'Load Balancing'],
        category: 'Placement'
    },
    {
        id: 'aptitude',
        title: 'Speed Aptitude',
        desc: 'Quant, Logic, and Verbal speed tests.',
        icon: Target,
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
        href: '/dashboard/skillforge/aptitude',
        progress: 80,
        total: 100,
        tags: ['Quant', 'Logical'],
        category: 'Placement'
    },
    {
        id: 'aiml',
        title: 'AI & Machine Learning',
        desc: 'Neural Networks and Deep Learning.',
        icon: Cpu,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        href: '/dashboard/skillforge/aiml',
        progress: 25,
        total: 100,
        tags: ['Pytorch', 'TensorFlow'],
        category: 'Deep Tech'
    },
    {
        id: 'datascience',
        title: 'Data Science',
        desc: 'SQL, Pandas, and Data Visualization.',
        icon: BarChart,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        href: '/dashboard/skillforge/datascience',
        progress: 40,
        total: 80,
        tags: ['EDA', 'Analytics'],
        category: 'Deep Tech'
    },
    {
        id: 'blockchain',
        title: 'Web3 & Blockchain',
        desc: 'Consensus, Mining, and Smart Contracts.',
        icon: Wrench,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        href: '/dashboard/skillforge/blockchain',
        progress: 10,
        total: 50,
        tags: ['Solidity', 'Ethereum'],
        category: 'Deep Tech'
    },
    {
        id: 'tools',
        title: 'Developer Tools',
        desc: 'Version control and development.',
        icon: Wrench,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        href: '/dashboard/skillforge/tools',
        progress: 10,
        total: 40,
        tags: ['Git', 'VS Code', 'Linux'],
        category: 'Development'
    },
    {
        id: 'core',
        title: 'CS Fundamentals',
        desc: 'Operating Systems, DBMS, and Networks.',
        icon: BookOpen,
        color: 'text-cyan-500',
        bg: 'bg-cyan-500/10',
        href: '/dashboard/skillforge/core',
        progress: 0,
        total: 60,
        tags: ['OS', 'DBMS', 'CN'],
        category: 'Placement'
    },
    {
        id: 'hr',
        title: 'Behavioral Skills',
        desc: 'Communication and leadership.',
        icon: Users,
        color: 'text-rose-500',
        bg: 'bg-rose-500/10',
        href: '/dashboard/skillforge/hr',
        progress: 0,
        total: 25,
        tags: ['Leadership', 'Negotiation'],
        category: 'Soft Skills'
    }
];

export default function SkillForgeLanding() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeFilter, setActiveFilter] = React.useState('All');

    const filters = ['All', 'Development', 'Placement', 'Deep Tech', 'Soft Skills'];

    const filteredTracks = tracks.filter(track => {
        const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesFilter = activeFilter === 'All' || track.category === activeFilter;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 lg:p-10 max-w-[1600px] mx-auto">

            {/* Ambient Background Gradient */}
            <div className="fixed inset-0 pointer-events-none opacity-40">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-200/50 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-200/50 rounded-full blur-[120px]"></div>
            </div>

            {/* Header / Stats Row */}
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Sparkles className="text-amber-500" size={24} /> Skill Forge
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Master specialized tracks with interactive templates.</p>
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-sm border border-slate-200/60">
                        <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl text-orange-500">
                            <Flame size={20} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Streak</p>
                            <p className="text-xl font-black text-slate-800 leading-none">12</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-sm border border-slate-200/60">
                        <div className="p-2 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl text-yellow-600">
                            <Trophy size={20} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rank</p>
                            <p className="text-xl font-black text-slate-800 leading-none">#428</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Main Content Area: Tracks */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Search and Filters */}
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by skill, technology, or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm group-hover:shadow-md font-medium text-slate-700"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar mask-linear-fade">
                            {filters.map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300
                                        ${activeFilter === filter
                                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105'
                                            : 'bg-white/60 text-slate-600 border border-slate-200/60 hover:bg-white hover:scale-105'}
                                    `}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                            Explore Tracks
                            <span className="text-xs font-black bg-slate-200 text-slate-600 px-2 py-1 rounded-lg">
                                {filteredTracks.length}
                            </span>
                        </h2>
                    </div>

                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <AnimatePresence mode='popLayout'>
                            {filteredTracks.map((track) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    key={track.id}
                                >
                                    <Link href={track.href} className="block group h-full">
                                        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-200 transition-all h-full flex flex-col relative overflow-hidden">

                                            <div className={`absolute top-0 right-0 p-20 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${track.bg.replace('/10', '/30')}`}></div>

                                            <div className="flex justify-between items-start mb-5 relative z-10">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${track.bg} ${track.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                                    <track.icon size={28} />
                                                </div>
                                                <div className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{track.category}</span>
                                                </div>
                                            </div>

                                            <h3 className="font-bold text-slate-900 text-lg mb-2 relative z-10 group-hover:text-indigo-600 transition-colors">
                                                {track.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 font-medium mb-5 line-clamp-2 flex-1 relative z-10 leading-relaxed">
                                                {track.desc}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                                                {track.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] font-bold bg-slate-100/80 text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200/50">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="mt-auto relative z-10">
                                                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                                    <span>Completion</span>
                                                    <span className="text-slate-700">{Math.round((track.progress / track.total) * 100)}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(track.progress / track.total) * 100}%` }}
                                                        transition={{ delay: 0.2, duration: 1 }}
                                                        className={`h-full rounded-full ${track.progress > 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-slate-200'}`}
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Right Sidebar: Daily Challenge & Calendar */}
                <div className="space-y-6">
                    {/* Daily Challenge Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Calendar size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Daily Challenge</p>
                                    <h3 className="text-2xl font-bold">Feb 15</h3>
                                </div>
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <Trophy size={20} className="text-yellow-400" fill="currentColor" />
                                </div>
                            </div>

                            <h4 className="font-medium text-lg mb-2 group-hover:underline decoration-emerald-400 underline-offset-4">Reverse Linked List II</h4>
                            <div className="flex items-center gap-3 text-sm text-slate-400 mb-6">
                                <span className="text-emerald-400 font-bold">Medium</span>
                                <span>•</span>
                                <span>+10 XP</span>
                            </div>

                            <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-900/20 active:scale-95">
                                Start Challenge
                            </button>
                        </div>
                    </div>

                    {/* Progress Calendar Stub */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-slate-400" /> Activity
                        </h3>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 28 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`
                                        aspect-square rounded-md 
                                        ${[0, 3, 4, 8, 12, 15, 16, 20, 22].includes(i) ? 'bg-emerald-500' : 'bg-slate-100'}
                                    `}
                                ></div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-3 font-medium">
                            <span>Less</span>
                            <span>More</span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4">Your Progress</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">Solved</span>
                                <span className="font-bold text-slate-800">142</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">Accepted</span>
                                <span className="font-bold text-slate-800">128</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">Submission Rate</span>
                                <span className="font-bold text-slate-800">90.1%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
