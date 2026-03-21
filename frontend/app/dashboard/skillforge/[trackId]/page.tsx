'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Code2, Terminal, Cpu, ArrowRight, Loader2, Globe, Zap,
    Database, Layout, Server, BrainCircuit, Activity, Calculator,
    Puzzle, Book, Bitcoin, GitBranch, Shield, Box, List
} from 'lucide-react';
import API_BASE_URL from '@/app/lib/api-config';

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

    useEffect(() => {
        const fetchTopics = async () => {
            const dbTopicId = trackMapping[trackId];
            if (!dbTopicId) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/course-content/${dbTopicId}`);
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
                <Loader2 className="animate-spin text-slate-800" size={48} />
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
                <Link href="/dashboard/skillforge" className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition">
                    Back to Skill Forge
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 lg:p-10 max-w-full max-w-[1600px] mx-auto">
            <div className="mb-12">
                <Link href="/dashboard/skillforge" className="text-sm font-bold text-slate-500 hover:text-slate-800 mb-4 inline-block transition-colors">
                    ← Back to Skill Forge
                </Link>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4 capitalize">
                    {displayTitles[trackId] || trackId.replace('-', ' ')}
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl">
                    Select a topic to master. Deep dive into specific skills and technologies.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map((topic, index) => (
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
                            <div className="bg-white h-full p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 relative overflow-hidden">
                                <div className={`absolute top-0 right-0 p-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${topic.bg.replace('/10', '/30')}`}></div>

                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${topic.bg} ${topic.color} mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                    {getIcon(topic.icon)}
                                </div>

                                <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-slate-800 transition-colors">
                                    {topic.name}
                                </h2>
                                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                    {topic.description}
                                </p>

                                <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-slate-800 transition-colors mt-auto">
                                    Start Topic <ArrowRight size={16} />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
