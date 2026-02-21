'use client';

import React, { useEffect, useState } from 'react';
import API_BASE_URL from '@/app/lib/api-config';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    BookOpen, CheckCircle2, ChevronLeft, ChevronRight,
    Play, Lock, BrainCircuit, Loader2, ArrowLeft
} from 'lucide-react';

interface ModuleContent {
    topicId: string;
    title: string;
    content: string; // Markdown content
}

export default function GenericModulePage() {
    const params = useParams();
    const trackId = params.trackId as string;
    const topicId = params.topicId as string;
    const moduleId = params.moduleId as string;

    const [moduleData, setModuleData] = useState<ModuleContent | null>(null);
    const [parsedGenerata, setParsedData] = useState<{ theory: string; mindMap: string; revision: string }>({ theory: '', mindMap: '', revision: '' });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'theory' | 'mindmap' | 'revision'>('theory');

    useEffect(() => {
        const fetchModule = async () => {
            try {
                const dbTopicId = `${trackId}-${topicId}-${moduleId}`;
                const response = await fetch(`${API_BASE_URL}/course-content/${dbTopicId}`);

                if (response.ok) {
                    const text = await response.text();
                    if (text) {
                        const data = JSON.parse(text);
                        setModuleData({
                            topicId: data.topicId,
                            title: data.title,
                            content: data.content
                        });

                        // Attempt to parse content as JSON for new verified structure
                        try {
                            const jsonContent = JSON.parse(data.content);
                            if (jsonContent.theory) {
                                setParsedData({
                                    theory: jsonContent.theory,
                                    mindMap: jsonContent.mindMap || '',
                                    revision: jsonContent.revision || ''
                                });
                            } else {
                                // Fallback for pure JSON array/object that isn't our structure
                                setParsedData({ theory: data.content, mindMap: '', revision: '' });
                            }
                        } catch (e) {
                            // Data is a simple Markdown string (Legacy)
                            setParsedData({ theory: data.content, mindMap: '', revision: '' });
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch module", error);
            } finally {
                setLoading(false);
            }
        };

        if (trackId && topicId && moduleId) {
            fetchModule();
        }
    }, [trackId, topicId, moduleId]);


    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    if (!moduleData) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <BrainCircuit size={64} className="text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Module Not Found</h2>
                <p className="text-slate-500 mb-8 max-w-md">
                    We couldn't load the content for <strong>{moduleId}</strong>.
                </p>
                <Link href={`/dashboard/skillforge/${trackId}/${topicId}`} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
                    Back to Syllabus
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col lg:flex-row">

            {/* Left Sidebar (Desktop) */}
            <div className="hidden lg:flex flex-col w-80 border-r border-slate-200 h-screen sticky top-0 bg-slate-50/50 backdrop-blur-sm p-6 overflow-y-auto">
                <Link href={`/dashboard/skillforge/${trackId}/${topicId}`} className="text-sm font-bold text-slate-500 hover:text-indigo-600 mb-8 inline-flex items-center gap-2 transition-colors">
                    <ArrowLeft size={14} /> Back to Syllabus
                </Link>

                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Current Module</h3>
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm mb-6">
                    <h2 className="font-bold text-slate-800 text-sm">{moduleData.title}</h2>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-40">
                    <Link href={`/dashboard/skillforge/${trackId}/${topicId}`} className="p-2 -ml-2 text-slate-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <span className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{moduleData.title}</span>
                    <div className="w-8"></div>
                </div>

                {/* Tabs Header */}
                <div className="sticky top-14 lg:top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 lg:px-12 pt-6">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => setActiveTab('theory')}
                            className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'theory' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-800'}`}
                        >
                            Deep Dive
                        </button>
                        <button
                            onClick={() => setActiveTab('mindmap')}
                            className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'mindmap' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-800'}`}
                        >
                            Mind Map
                        </button>
                        <button
                            onClick={() => setActiveTab('revision')}
                            className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'revision' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-800'}`}
                        >
                            Quick Revision
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto p-6 lg:p-12 pb-32 flex-1 w-full">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'theory' && (
                            <div className="prose prose-slate prose-lg max-w-none 
                            prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                            prose-p:text-slate-600 prose-p:leading-relaxed
                            prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-slate-800 prose-strong:font-bold
                            prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                            prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:rounded-2xl prose-pre:p-0
                            ">
                                <ReactMarkdown
                                    components={{
                                        code({ node, inline, className, children, ...props }: any) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline && match ? (
                                                <div className="relative group">
                                                    <div className="absolute top-0 right-0 px-4 py-2 text-xs font-bold text-slate-500 bg-slate-800 rounded-bl-xl rounded-tr-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {match[1]}
                                                    </div>
                                                    <SyntaxHighlighter
                                                        style={vscDarkPlus}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        customStyle={{
                                                            margin: 0,
                                                            borderRadius: '1rem',
                                                            padding: '1.5rem',
                                                            backgroundColor: '#0f172a',
                                                        }}
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                </div>
                                            ) : (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        }
                                    }}
                                >
                                    {parsedGenerata.theory}
                                </ReactMarkdown>
                            </div>
                        )}

                        {activeTab === 'mindmap' && (
                            <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-50 border border-slate-200 rounded-3xl p-8">
                                {parsedGenerata.mindMap ? (
                                    <div className="w-full prose prose-slate max-w-none">
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                            <pre className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg overflow-x-auto">
                                                {parsedGenerata.mindMap}
                                            </pre>
                                            <p className="text-center text-xs text-slate-400 mt-4">Mermaid Diagram Source (Visualization coming soon)</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <BrainCircuit size={48} className="text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium">No mind map available for this module.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'revision' && (
                            <div className="space-y-6">
                                {parsedGenerata.revision ? (
                                    <div className="prose prose-slate prose-lg max-w-none 
                                    prose-ul:list-disc prose-ul:pl-6 
                                    prose-li:text-slate-700 prose-li:font-medium prose-li:mb-2
                                    prose-strong:text-indigo-600
                                    bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100
                                    ">
                                        <ReactMarkdown>{parsedGenerata.revision}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="text-center py-20">
                                        <p className="text-slate-500 font-medium">No revision notes available.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Footer Navigation */}
                <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white/80 backdrop-blur-xl z-30">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                            <ChevronLeft size={16} /> Previous
                        </button>

                        <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
                            Next Module <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
