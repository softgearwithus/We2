'use client';

import React, { useEffect, useState } from 'react';
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModule = async () => {
            try {
                // Construct the DB topic ID: e.g. technology-react-module-0
                // We need to map the URL moduleId (e.g., 'module-0') to the DB ID
                // The seeder format is: specific-topic-module-X
                // For example: 'technology-react-module-0'
                // Our URL is: /skillforge/technology/react/module-0

                const dbTopicId = `${trackId}-${topicId}-${moduleId}`;
                const response = await fetch(`http://localhost:3001/course-content/${dbTopicId}`);

                if (response.ok) {
                    const text = await response.text();
                    if (text) {
                        const data = JSON.parse(text);
                        // The content field in DB is the Markdown string itself for modules?
                        // Let's check seeder: yes, content is a string.
                        // Wait, seeder: content: `# 🟡 Module 0...`
                        // But the API returns the entity, where entity.content is that string.
                        // So data.content is the markdown string.

                        setModuleData({
                            topicId: data.topicId,
                            title: data.title,
                            content: data.content
                        });
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

    // Fallback loading component
    const LoadingSpinner = () => (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Loading Content...</p>
            </div>
        </div>
    );
    if (loading) return <LoadingSpinner />;

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

            {/* Left Sidebar (Desktop) - Navigation Placeholder or Mini Syllabus */}
            <div className="hidden lg:flex flex-col w-80 border-r border-slate-200 h-screen sticky top-0 bg-slate-50/50 backdrop-blur-sm p-6 overflow-y-auto">
                <Link href={`/dashboard/skillforge/${trackId}/${topicId}`} className="text-sm font-bold text-slate-500 hover:text-indigo-600 mb-8 inline-flex items-center gap-2 transition-colors">
                    <ArrowLeft size={14} /> Back to Syllabus
                </Link>

                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Current Module</h3>
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm mb-6">
                    <h2 className="font-bold text-slate-800 text-sm">{moduleData.title}</h2>
                </div>

                {/* Future: List all modules here for quick nav */}
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-40">
                    <Link href={`/dashboard/skillforge/${trackId}/${topicId}`} className="p-2 -ml-2 text-slate-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <span className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{moduleData.title}</span>
                    <div className="w-8"></div> {/* Spacer */}
                </div>

                <div className="max-w-4xl mx-auto p-6 lg:p-12 pb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="prose prose-slate prose-lg max-w-none 
                        prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                        prose-p:text-slate-600 prose-p:leading-relaxed
                        prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-slate-800 prose-strong:font-bold
                        prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:rounded-2xl prose-pre:p-0
                        "
                    >
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
                                                    backgroundColor: '#0f172a', // slate-900
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
                            {moduleData.content}
                        </ReactMarkdown>
                    </motion.div>
                </div>

                {/* Footer Navigation */}
                <div className="fixed bottom-0 left-0 right-0 lg:left-80 p-4 border-t border-slate-200 bg-white/80 backdrop-blur-xl z-30">
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
