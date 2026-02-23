'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { roadmapData } from '@/app/lib/data/roadmapData';
import { ArrowLeft, BookOpen, Video, Code, CheckCircle, ExternalLink, Globe, Lightbulb, ChevronRight, X, Loader2, Sparkles, Star, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '@/app/lib/api-config';

// Simple Markdown-like Renderer for Drawer
const RichContentRenderer = ({ content }: { content: string }) => {
    // Basic regex based transformation for headers, lists, and bold text
    const lines = content.split('\n');

    return (
        <div className="space-y-6">
            {lines.map((line, i) => {
                if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-3xl font-black text-slate-900 mt-8 mb-4 border-b-2 border-indigo-100 pb-2">{line.replace('# ', '')}</h1>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-2xl font-extrabold text-slate-800 mt-6 mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                        {line.replace('## ', '')}
                    </h2>;
                }
                if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-xl font-bold text-slate-800 mt-4 mb-2">{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                    return (
                        <div key={i} className="flex gap-3 text-slate-600 mb-2 pl-2">
                            <span className="text-indigo-500 font-bold">•</span>
                            <span className="leading-relaxed">{line.substring(2)}</span>
                        </div>
                    );
                }
                if (line.startsWith('![')) {
                    const altMatch = line.match(/!\[(.*?)\]/);
                    const urlMatch = line.match(/\((.*?)\)/);
                    if (altMatch && urlMatch) {
                        return (
                            <div key={i} className="my-8 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-slate-50 group">
                                <img
                                    src={urlMatch[1]}
                                    alt={altMatch[1]}
                                    className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                />
                                <div className="p-3 text-center bg-white/80 backdrop-blur-sm border-t border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">{altMatch[1]}</p>
                                </div>
                            </div>
                        );
                    }
                }
                if (line.trim() === '') return <div key={i} className="h-4"></div>;

                // Handle bold text **...**
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                    <p key={i} className="text-slate-600 leading-relaxed text-lg font-sans">
                        {parts.map((part, pi) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={pi} className="text-slate-900 font-extrabold">{part.slice(2, -2)}</strong>;
                            }
                            return part;
                        })}
                    </p>
                );
            })}
        </div>
    );
};

export default function TopicPage() {
    const params = useParams();
    const phaseId = params.phaseId as string;
    const phase = roadmapData.find(p => p.id === phaseId);

    const [selectedLanguage, setSelectedLanguage] = useState('C++');
    const [activeTopicIndex, setActiveTopicIndex] = useState(0);
    const [completedPhases, setCompletedPhases] = useState<string[]>([]);
    const [isProgressLoaded, setIsProgressLoaded] = useState(false);

    const [showDetails, setShowDetails] = useState(false);
    const [detailedContent, setDetailedContent] = useState<{ title: string, content: string } | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    if (!phase) return <div className="min-h-screen flex items-center justify-center">Phase not found</div>;

    const activeTopic = phase.topics[activeTopicIndex];
    const hasContent = !!activeTopic.content;
    const topicId = activeTopic.title.toLowerCase().replace(/\s+/g, '-');

    const handleReadMore = async () => {
        setShowDetails(true);
        setLoadingDetails(true);
        try {
            const response = await fetch(`${API_BASE_URL}/course-content/${topicId}`);
            if (response.ok) {
                const data = await response.json();
                setDetailedContent(data);
            } else {
                setDetailedContent(null);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
            setDetailedContent(null);
        } finally {
            setLoadingDetails(false);
        }
    };

    useEffect(() => {
        const loadProgress = async () => {
            const token = localStorage.getItem('accessToken') || '';
            if (!token) {
                setIsProgressLoaded(true);
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/preparation/me/progress`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) return;
                const data = await response.json();
                const completed = Array.isArray(data.completedPhaseIds) ? data.completedPhaseIds : [];
                setCompletedPhases(completed);
            } catch (error) {
                console.error('Failed to load preparation progress', error);
            } finally {
                setIsProgressLoaded(true);
            }
        };

        loadProgress();
    }, []);

    useEffect(() => {
        const persistProgress = async () => {
            if (!isProgressLoaded) return;
            const token = localStorage.getItem('accessToken') || '';
            if (!token) return;
            try {
                await fetch(`${API_BASE_URL}/preparation/me/progress`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ completedPhaseIds: completedPhases }),
                });
            } catch (error) {
                console.error('Failed to update preparation progress', error);
            }
        };

        persistProgress();
    }, [completedPhases, isProgressLoaded]);

    const isPhaseCompleted = completedPhases.includes(phase.id);
    const handleCompletePhase = () => {
        if (isPhaseCompleted) return;
        setCompletedPhases((prev) => (prev.includes(phase.id) ? prev : [...prev, phase.id]));
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/preparation" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-tight">{phase.title}</h1>
                            <p className="text-xs text-slate-500 hidden md:block">Step {activeTopicIndex + 1}: {activeTopic.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {hasContent && activeTopic.content?.codeExamples && (
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                                {Object.keys(activeTopic.content.codeExamples).map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => setSelectedLanguage(lang)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${selectedLanguage === lang ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        )}
                        <Link href="/admin/content" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Sparkles size={18} />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-4rem)]">
                {/* Sidebar Topics List */}
                <div className="lg:col-span-3 h-full overflow-y-auto pr-2 custom-scrollbar lg:block hidden">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">Curriculum</p>
                    <div className="space-y-2">
                        {phase.topics.map((topic, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setActiveTopicIndex(idx);
                                    setShowDetails(false);
                                }}
                                className={`w-full text-left p-3 rounded-xl border transition-all text-sm font-medium flex items-start gap-3
                                    ${activeTopicIndex === idx
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:text-slate-900'}
                                `}
                            >
                                <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border text-[10px] font-bold transition-colors
                                    ${activeTopicIndex === idx ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-400'}
                                `}>
                                    {idx + 1}
                                </span>
                                <span className="line-clamp-2">{topic.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9 h-full overflow-y-auto pb-40 custom-scrollbar relative">
                    <motion.div
                        key={activeTopicIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex-1">
                                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">{activeTopic.title}</h2>
                                <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
                                    {activeTopic.content?.introduction || activeTopic.desc}
                                </p>

                                <button
                                    onClick={handleReadMore}
                                    className="mt-6 inline-flex items-center gap-3 bg-white border-2 border-indigo-100 text-indigo-600 px-6 py-3 rounded-2xl font-black shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
                                >
                                    <BookOpen size={20} />
                                    <span>Read Comprehensive Guide</span>
                                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Content Blocks */}
                        {hasContent ? (
                            <>
                                {activeTopic.content?.keyConcepts && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {activeTopic.content.keyConcepts.map((concept: any, i: number) => (
                                            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                    <h3 className="font-bold text-slate-900">{concept.label}</h3>
                                                </div>
                                                <p className="text-sm text-slate-500">{concept.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTopic.content?.codeExamples && (
                                    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-slate-900">
                                        <div className="bg-slate-800/50 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                                            <div className="flex items-center gap-2">
                                                <Code size={16} className="text-indigo-400" />
                                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{selectedLanguage} Example</span>
                                            </div>
                                        </div>
                                        <div className="p-6 overflow-x-auto">
                                            <pre className="font-mono text-sm text-slate-300 leading-relaxed">
                                                <code>{activeTopic.content.codeExamples[selectedLanguage]}</code>
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-slate-100 rounded-2xl p-12 text-center">
                                <p className="text-slate-500 font-medium">Core structure ready. Detailed lesson coming soon!</p>
                            </div>
                        )}

                        {/* Next/Prev Navigation */}
                        <div className="flex items-center justify-between pt-8 border-t border-slate-200 mt-12 pb-20">
                            <button
                                disabled={activeTopicIndex === 0}
                                onClick={() => setActiveTopicIndex(prev => prev - 1)}
                                className="text-slate-500 hover:text-indigo-600 font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ArrowLeft size={16} /> Previous Topic
                            </button>

                            {activeTopicIndex < phase.topics.length - 1 ? (
                                <button
                                    onClick={() => setActiveTopicIndex(prev => prev + 1)}
                                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg"
                                >
                                    Next Topic <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleCompletePhase}
                                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg ${isPhaseCompleted ? 'bg-emerald-100 text-emerald-700 cursor-default shadow-emerald-100' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200'}`}
                                >
                                    {isPhaseCompleted ? 'Phase Completed' : 'Complete Phase'} <CheckCircle size={16} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Read More Side Drawer */}
            <AnimatePresence>
                {showDetails && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDetails(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-3xl bg-white shadow-2xl z-50 overflow-y-auto custom-scrollbar"
                        >
                            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-6 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">Comprehensive Guide</h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{activeTopic.title}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="px-10 py-12 pb-32">
                                {loadingDetails ? (
                                    <div className="py-40 flex flex-col items-center justify-center gap-6 text-slate-400">
                                        <div className="relative">
                                            <Loader2 className="animate-spin text-indigo-600" size={50} />
                                            <Sparkles className="absolute top-0 right-0 text-brand-orange animate-pulse" size={20} />
                                        </div>
                                        <p className="font-black text-lg text-slate-500">Preparing your deep dive lesson...</p>
                                    </div>
                                ) : detailedContent ? (
                                    <div className="max-w-none">
                                        <div className="mb-10 text-center">
                                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-[10px] font-black uppercase tracking-widest mb-4">
                                                <Target size={12} /> Detailed Curriculum
                                            </span>
                                            <h1 className="text-4xl font-black text-slate-900 leading-tight">{detailedContent.title}</h1>
                                        </div>

                                        <RichContentRenderer content={detailedContent.content} />

                                        <div className="mt-20 p-8 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-start gap-4">
                                            <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                                                <Lightbulb size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-indigo-900 mb-1">Learning Tip</h4>
                                                <p className="text-indigo-700/80 leading-relaxed font-medium">
                                                    Try implementing the logic explained above in the code editor to solidify your understanding. Practical application is the fastest way to master these concepts.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                            <Zap size={40} className="text-slate-300" />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-800 mb-2">Deep dive coming soon!</h4>
                                        <p className="text-slate-500 max-w-sm mx-auto font-medium text-lg leading-relaxed">
                                            Our industry experts are currently crafting a high-fidelity guide for this topic. Check back soon for the full breakdown.
                                        </p>
                                        <Link
                                            href="/admin/content"
                                            className="mt-10 inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl"
                                        >
                                            Create Guide (Admin)
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
