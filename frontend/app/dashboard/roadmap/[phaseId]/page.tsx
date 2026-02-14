'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { roadmapData, RoadmapPhase, Topic } from '@/app/lib/data/roadmapData';
import { ArrowLeft, BookOpen, Video, Code, CheckCircle, ExternalLink, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopicPage() {
    const params = useParams();
    const router = useRouter();
    const phaseId = params.phaseId as string;
    const phase = (roadmapData as RoadmapPhase[]).find((p: RoadmapPhase) => p.id === phaseId);

    const [selectedLanguage, setSelectedLanguage] = useState('C++');
    const [activeTopicIndex, setActiveTopicIndex] = useState(0);

    if (!phase) return <div className="min-h-screen flex items-center justify-center">Phase not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/roadmap" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </Link>
                        <h1 className="text-lg font-bold text-slate-900">{phase.title}</h1>
                    </div>

                    {/* Language Selector */}
                    <div className="flex items-center gap-2 bg-slate-100 px-1 py-1 rounded-lg">
                        {['C++', 'Java', 'Python'].map(lang => (
                            <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${selectedLanguage === lang ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>

                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-slate-800 transition-colors">
                        Mark Phase Complete
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-4rem)]">
                {/* Sidebar Topics List */}
                <div className="lg:col-span-3 h-full overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">Curriculum</p>
                    <div className="space-y-2">
                        {(phase.topics as Topic[]).map((topic: Topic, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTopicIndex(idx)}
                                className={`w-full text-left p-3 rounded-xl border transition-all text-sm font-medium flex items-start gap-3
                                    ${activeTopicIndex === idx
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:text-slate-900'}
                                `}
                            >
                                <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border 
                                    ${activeTopicIndex === idx ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-transparent border-slate-300 text-transparent'}
                                `}>
                                    <span className="text-[10px]">{(idx + 1)}</span>
                                </span>
                                {topic.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9 h-full overflow-y-auto pb-20">
                    <motion.div
                        key={activeTopicIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">{phase.topics[activeTopicIndex].title}</h2>
                                <p className="text-slate-500 text-lg">{phase.topics[activeTopicIndex].desc}</p>
                            </div>
                            <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                                <Code size={18} /> {selectedLanguage} Mode
                            </div>
                        </div>

                        {/* Resource Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 group hover:border-indigo-200 transition-colors cursor-pointer">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                                    <BookOpen size={20} />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1">Interactive Guide</h3>
                                <p className="text-sm text-slate-500 mb-4">Read visual explanations and concepts.</p>
                                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">Read Now <ExternalLink size={12} /></span>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 group hover:border-brand-orange hover:bg-orange-50/10 transition-colors cursor-pointer">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-brand-orange mb-4 group-hover:scale-110 transition-transform">
                                    <Video size={20} />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1">Video Lecture</h3>
                                <p className="text-sm text-slate-500 mb-4">Watch curated tutorials from top instructors.</p>
                                <span className="text-xs font-bold text-brand-orange flex items-center gap-1">Watch <ExternalLink size={12} /></span>
                            </div>
                        </div>

                        {/* Coding Playground Stub */}
                        <div className="mt-8 border-t border-slate-100 pt-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Code size={20} className="text-slate-400" /> Practice {selectedLanguage} Code
                            </h3>
                            <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm text-slate-300 relative group">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded-md text-xs">Copy</button>
                                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-md text-xs">Run</button>
                                </div>
                                <p className="text-indigo-400 mb-2">// Write your {selectedLanguage} code here</p>
                                <p>
                                    <span className="text-purple-400">function</span> <span className="text-blue-400">helloWorld</span>() {'{'} <br />
                                    &nbsp;&nbsp;console.<span className="text-yellow-400">log</span>(<span className="text-green-400">"Happy Learning!"</span>); <br />
                                    {'}'}
                                </p>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </main>
        </div>
    );
}
