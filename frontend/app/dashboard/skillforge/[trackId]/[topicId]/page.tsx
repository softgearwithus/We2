'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Circle, ArrowLeft, Play, Lock, BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

interface Chapter {
    id: string;
    title: string;
    desc: string;
    completed: boolean;
}

export default function GenericTopicPage() {
    const params = useParams();
    const trackId = params.trackId as string;
    const topicId = params.topicId as string;
    const { user } = useAuth();

    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUpgrade, setShowUpgrade] = useState(false);

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                // Construct the DB topic ID: e.g. technology-react-chapters
                const dbTopicId = `${trackId}-${topicId}-chapters`;
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/course-content/${dbTopicId}`);

                if (response.ok) {
                    const text = await response.text();
                    if (text) {
                        const data = JSON.parse(text);
                        if (data && data.content) {
                            setChapters(JSON.parse(data.content));
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch chapters", error);
            } finally {
                setLoading(false);
            }
        };

        if (trackId && topicId) {
            fetchChapters();
        }
    }, [trackId, topicId]);

    const displayTitles: Record<string, string> = {
        'react': 'React.js Mastery',
        'node': 'Node.js Backend',
        'next': 'Next.js Framework',
        'docker': 'Docker & DevOps',
        'arrays': 'Arrays & Strings',
        'linkedlist': 'Linked List Data Structures',
        'trees': 'Trees & Graphs',
        'dp': 'Dynamic Programming',
        'hld': 'High Level Design',
        'lld': 'Low Level Design (SOLID)',
        'python-ml': 'Python for Data Science',
        'ml-basics': 'Machine Learning Fundamentals',
        'deep-learning': 'Deep Learning & Neural Networks',
        'quant': 'Quantitative Aptitude',
        'verbal': 'Verbal Ability',
        'logical': 'Logical Reasoning',
        'crypto': 'Cryptocurrency Basics',
        'solidity': 'Solidity Development',
        'web3js': 'Web3.js Integration',
        'git': 'Git Version Control',
        'linux': 'Linux & Shell Scripting',
        'vscode': 'VS Code Productivity',
        'os': 'Operating Systems',
        'dbms': 'Database Management Systems',
        'cn': 'Computer Networks',
        'comm': 'Effective Communication',
        'leadership': 'Leadership Skills',
        'resume': 'Resume & Interview Prep'
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Loading Syllabus...</p>
                </div>
            </div>
        );
    }

    const endDate = user?.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
    const isExpired = endDate && !Number.isNaN(endDate.getTime()) && endDate.getTime() <= Date.now();
    const isActive = user?.subscriptionStatus === 'active' && !isExpired;
    const isPremium = isActive && user?.subscriptionPlan && user.subscriptionPlan !== 'free';

    const preview = isPremium ? chapters : chapters.slice(0, 3);
    const locked = isPremium ? [] : chapters.slice(3);

    if (chapters.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <BrainCircuit size={64} className="text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Content Not Found</h2>
                <p className="text-slate-500 mb-8 max-w-md">
                    We couldn't find any chapters for <strong>{topicId}</strong>. This content might be coming soon!
                </p>
                <Link href={`/dashboard/skillforge/${trackId}`} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
                    Back to Track
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-white font-sans">
            {/* Header */}
            <div className="bg-slate-900 pt-20 pb-24 px-6 lg:px-10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>

                {/* Dynamic colored blob based on track */}
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>

                <div className="max-w-[1200px] mx-auto relative z-10">
                    <Link href={`/dashboard/skillforge/${trackId}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                        <ArrowLeft size={16} /> Back to {trackId}
                    </Link>

                    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 capitalize">
                        {displayTitles[topicId] || topicId.replace('-', ' ')}
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
                        Master {topicId.replace(/-/g, ' ')} with our structured, hands-on curriculum.
                    </p>

                    <div className="flex items-center gap-6 mt-8">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                            <BookOpen size={18} />
                            <span>{chapters.length} Modules</span>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-400 font-bold bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                            <BrainCircuit size={18} />
                            <span>Structured Path</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Syllabus Content */}
            <div className="max-w-[1000px] mx-auto px-6 lg:px-10 -mt-12 relative z-20 pb-20">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Course Syllabus</h2>
                        <span className="text-sm font-bold text-slate-500">0% Completed</span>
                    </div>

                    <div className="space-y-4">
                        {preview.map((chapter, index) => (
                            // Note: We need a generic content viewer or reuse the existing one.
                            // Assuming we'll make a [moduleId]/page.tsx at the next level or reuse existing
                            // For now, let's point to a module viewer if it exists, or just a placeholder
                            <Link href={`/dashboard/skillforge/${trackId}/${topicId}/${chapter.id}`} key={chapter.id} className="block group">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-5 p-5 rounded-2xl hover:bg-slate-50 border border-slate-100 group-hover:border-indigo-100 transition-all cursor-pointer"
                                >
                                    <div className="flex-shrink-0">
                                        {chapter.completed ? (
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                <CheckCircle2 size={20} />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Play size={20} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
                                            {chapter.title}
                                        </h3>
                                        <p className="text-slate-500 font-medium text-sm mt-1">
                                            {chapter.desc}
                                        </p>
                                    </div>

                                    <div className="hidden md:flex gap-2">
                                        <span className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 bg-white border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                                            Start Module
                                        </span>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                        {!isPremium && locked.length > 0 && (
                            <div className="relative">
                                <div className="divide-y divide-slate-100 blur-[2px] pointer-events-none select-none">
                                    {locked.map((chapter) => (
                                        <div key={chapter.id} className="block group">
                                            <div className="flex items-center gap-5 p-5 rounded-2xl border border-slate-100 bg-white">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                                                        <Lock size={18} />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-slate-800 text-lg">{chapter.title}</h3>
                                                    <p className="text-slate-500 font-medium text-sm mt-1">
                                                        {chapter.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowUpgrade(true)}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <div className="max-w-sm text-center bg-white/90 border border-slate-200 rounded-2xl px-6 py-5 shadow-xl">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-brand-orange text-[10px] font-bold uppercase tracking-widest mb-3">
                                            <Lock size={12} /> Premium Access
                                        </div>
                                        <div className="text-lg font-black text-slate-900 mb-1">Only 3 modules free. Unlock the rest.</div>
                                        <div className="text-xs text-slate-500 font-medium mb-4">Upgrade to Standard or Pro to open the full Skill Forge path.</div>
                                        <div className="inline-flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-brand-orange to-red-500 px-4 py-2 rounded-lg shadow-lg">
                                            <Sparkles size={14} /> Upgrade Now
                                        </div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
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
                            ×
                        </button>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-4">
                            Skill Forge Premium
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-3">Unlock the full learning path</h3>
                        <p className="text-slate-600 font-medium mb-6">
                            You have a 3-module preview. Upgrade to Standard or Pro to access every module, examples, and revision packs.
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
                    </div>
                </div>
            )}
        </>
    );
}
