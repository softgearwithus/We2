'use client';

import { fetchApi } from '../../../../lib/apiClient';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Circle, ArrowLeft, Play, Lock, BrainCircuit, Loader2 } from 'lucide-react';
import API_BASE_URL from '@/app/lib/api-config';

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

    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                // Construct the DB topic ID: e.g. technology-react-chapters
                const dbTopicId = `${trackId}-${topicId}-chapters`;
                const response = await fetchApi(`${API_BASE_URL}/course-content/${dbTopicId}`);

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
                <Loader2 className="animate-spin text-slate-800" size={48} />
            </div>
        );
    }

    // Fallback loading component since Loader2 is not imported above (my bad)
    const LoadingSpinner = () => (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Loading Syllabus...</p>
            </div>
        </div>
    );

    if (loading) return <LoadingSpinner />;

    if (chapters.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <BrainCircuit size={64} className="text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Content Not Found</h2>
                <p className="text-slate-500 mb-8 max-w-md">
                    We couldn't find any chapters for <strong>{topicId}</strong>. This content might be coming soon!
                </p>
                <Link href={`/dashboard/skillforge/${trackId}`} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition">
                    Back to Track
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Header */}
            <div className="bg-slate-900 pt-20 pb-24 px-6 lg:px-10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="absolute top-0 right-0 w-full max-w-full max-w-[500px] h-[500px] bg-slate-500/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>

                {/* Dynamic colored blob based on track */}
                <div className="absolute bottom-0 left-0 w-full max-w-full max-w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>

                <div className="max-w-full max-w-[1200px] mx-auto relative z-10">
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
                        <div className="flex items-center gap-2 text-slate-400 font-bold bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                            <BrainCircuit size={18} />
                            <span>Structured Path</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Syllabus Content */}
            <div className="max-w-full max-w-[1000px] mx-auto px-6 lg:px-10 -mt-12 relative z-20 pb-20">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Course Syllabus</h2>
                        <span className="text-sm font-bold text-slate-500">0% Completed</span>
                    </div>

                    <div className="space-y-4">
                        {chapters.map((chapter, index) => (
                            // Note: We need a generic content viewer or reuse the existing one.
                            // Assuming we'll make a [moduleId]/page.tsx at the next level or reuse existing
                            // For now, let's point to a module viewer if it exists, or just a placeholder
                            <Link href={`/dashboard/skillforge/${trackId}/${topicId}/${chapter.id}`} key={chapter.id} className="block group">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-5 p-5 rounded-2xl hover:bg-slate-50 border border-slate-100 group-hover:border-slate-200 transition-all cursor-pointer"
                                >
                                    <div className="flex-shrink-0">
                                        {chapter.completed ? (
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                <CheckCircle2 size={20} />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Play size={20} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-slate-800 transition-colors">
                                            {chapter.title}
                                        </h3>
                                        <p className="text-slate-500 font-medium text-sm mt-1">
                                            {chapter.desc}
                                        </p>
                                    </div>

                                    <div className="hidden md:flex gap-2">
                                        <span className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 bg-white border border-slate-200 group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-800 transition-all">
                                            Start Module
                                        </span>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
