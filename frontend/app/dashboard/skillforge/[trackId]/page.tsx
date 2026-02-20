'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import {
    Code2, Terminal, Cpu, ArrowRight, Loader2, Globe, Zap,
    Database, Layout, Server, BrainCircuit, Activity, Calculator,
    Puzzle, Book, Bitcoin, GitBranch, Shield, Box, List, Sparkles, Lock
} from 'lucide-react';

interface Topic {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    bg: string;
}

export default function GenericTrackPage() {
    const params = useParams();
    const trackId = params.trackId as string;
    const { user } = useAuth();

    // Map URL friendly track IDs to database topic IDs
    const trackMapping: Record<string, string> = {
        'technology': 'technology-stacks',
        'dsa': 'dsa-topics', // Handled via redirect or direct link usually, but supporting here
        'system-design': 'system-design-topics',
        'aiml': 'aiml-topics',
        'aptitude': 'aptitude-topics',
        'datascience': 'datascience-topics',
        'blockchain': 'blockchain-topics',
        'tools': 'tools-topics',
        'core': 'core-topics',
        'hr': 'hr-topics'
    };

    const displayTitles: Record<string, string> = {
        'technology': 'Full Stack Development',
        'dsa': 'Data Structures & Algorithms',
        'system-design': 'System Design',
        'aiml': 'AI & Machine Learning',
        'aptitude': 'Speed Aptitude',
        'datascience': 'Data Science',
        'blockchain': 'Web3 & Blockchain',
        'tools': 'Developer Tools',
        'core': 'CS Fundamentals',
        'hr': 'Behavioral Skills'
    };

    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUpgrade, setShowUpgrade] = useState(false);

    useEffect(() => {
        const fetchTopics = async () => {
            const dbTopicId = trackMapping[trackId];
            if (!dbTopicId) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/course-content/${dbTopicId}`);
                if (response.ok) {
                    const text = await response.text();
                    if (text) {
                        const data = JSON.parse(text);
                        if (data && data.content) {
                            setTopics(JSON.parse(data.content));
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch topics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopics();
    }, [trackId]);

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'react': return <Globe size={32} />;
            case 'node': return <Server size={32} />;
            case 'next': return <Layout size={32} />;
            case 'docker': return <Box size={32} />; // Box not imported, fallback
            case 'array': return <Layout size={32} />;
            case 'list': return <List size={32} />; // List not imported
            case 'tree': return <GitBranch size={32} />;
            case 'dp': return <Calculator size={32} />;
            case 'cloud': return <Globe size={32} />;
            case 'code': return <Code2 size={32} />;
            case 'python': return <Terminal size={32} />;
            case 'brain': return <BrainCircuit size={32} />;
            case 'network': return <Activity size={32} />;
            case 'calculator': return <Calculator size={32} />;
            case 'puzzle': return <Puzzle size={32} />;
            case 'book': return <Book size={32} />;
            case 'database': return <Database size={32} />;
            case 'chart': return <Activity size={32} />;
            case 'math': return <Calculator size={32} />;
            case 'bitcoin': return <Bitcoin size={32} />;
            case 'git': return <GitBranch size={32} />;
            case 'terminal': return <Terminal size={32} />;
            case 'cpu': return <Cpu size={32} />;
            case 'message': return <Shield size={32} />; // Placeholder
            case 'users': return <Code2 size={32} />;
            case 'file': return <Book size={32} />;
            default: return <Code2 size={32} />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    if (topics.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <BrainCircuit size={64} className="text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Track Not Found</h2>
                <p className="text-slate-500 mb-8 max-w-md">
                    We couldn't load content for <strong>{trackId}</strong>. It might be coming soon!
                </p>
                <Link href="/dashboard/skillforge" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
                    Back to Skill Forge
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 lg:p-10 max-w-[1600px] mx-auto">
            <div className="mb-12">
                <Link href="/dashboard/skillforge" className="text-sm font-bold text-slate-500 hover:text-indigo-600 mb-4 inline-block transition-colors">
                    ← Back to Skill Forge
                </Link>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4 capitalize">
                    {displayTitles[trackId] || trackId.replace('-', ' ')}
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl">
                    Select a topic to master. Deep dive into specific skills and technologies.
                </p>
            </div>

            {(() => {
                const endDate = user?.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
                const isExpired = endDate && !Number.isNaN(endDate.getTime()) && endDate.getTime() <= Date.now();
                const isActive = user?.subscriptionStatus === 'active' && !isExpired;
                const isPremium = isActive && user?.subscriptionPlan && user.subscriptionPlan !== 'free';
                const preview = isPremium ? topics : topics.slice(0, 3);
                const locked = isPremium ? [] : topics.slice(3);

                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {preview.map((topic, index) => (
                    <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        {/* Note: We reuse the programming page structure for sub-topics. 
                            Ideally, we should rely on a generic [trackId]/[topicId] route.
                            For now, let's link to a construction page or re-use existing chapter viewer if possible.
                            Wait, we have [languageId] which expects a topicId of 'programming-{languageId}-chapters'.
                            Here we have 'technology-{topicId}-chapters'.
                            So we can reuse the chapter viewer if we route correctly.
                        */}
                        <Link href={`/dashboard/skillforge/${trackId}/${topic.id}`} className="block h-full group">
                            <div className="bg-white h-full p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 relative overflow-hidden">
                                <div className={`absolute top-0 right-0 p-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${topic.bg.replace('/10', '/30')}`}></div>

                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${topic.bg} ${topic.color} mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                    {getIcon(topic.icon)}
                                </div>

                                <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                    {topic.name}
                                </h2>
                                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                    {topic.description}
                                </p>

                                <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-indigo-600 transition-colors mt-auto">
                                    Start Topic <ArrowRight size={16} />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                            ))}
                        </div>

                        {!isPremium && locked.length > 0 && (
                            <div className="mt-8 relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 blur-[2px] pointer-events-none select-none">
                                    {locked.map((topic) => (
                                        <div key={topic.id} className="bg-white h-full p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-100 text-slate-400 mb-6">
                                                <Lock size={28} />
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-900 mb-3">{topic.name}</h2>
                                            <p className="text-slate-500 font-medium leading-relaxed mb-8">{topic.description}</p>
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
                                        <div className="text-lg font-black text-slate-900 mb-1">Only 3 free topics. The rest are locked.</div>
                                        <div className="text-xs text-slate-500 font-medium mb-4">Upgrade to Standard or Pro to unlock all Skill Forge topics.</div>
                                        <div className="inline-flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-brand-orange to-red-500 px-4 py-2 rounded-lg shadow-lg">
                                            <Sparkles size={14} /> Upgrade Now
                                        </div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </>
                );
            })()}
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
                        <h3 className="text-3xl font-black text-slate-900 mb-3">Unlock every topic and module</h3>
                        <p className="text-slate-600 font-medium mb-6">
                            You have a 3-topic preview. Upgrade to Standard or Pro to access full Skill Forge coverage.
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
