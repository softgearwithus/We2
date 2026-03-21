'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, Menu, CheckCircle } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import API_BASE_URL from '@/app/lib/api-config';

interface CourseContent {
    id: string;
    title: string;
    content: string;
}

export default function ChapterPage() {
    const params = useParams();
    const router = useRouter();
    const languageId = params.languageId as string;
    const chapterId = params.chapterId as string;

    const [content, setContent] = useState<CourseContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Fetch content for this chapter
                const topicId = `programming-${languageId}-${chapterId}`;
                const response = await fetch(`${API_BASE_URL}/course-content/${topicId}`);

                if (response.ok) {
                    const text = await response.text();
                    if (text) {
                        const data = JSON.parse(text);
                        if (data) {
                            setContent(data);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch content", error);
            } finally {
                setLoading(false);
            }
        };

        if (languageId && chapterId) {
            fetchContent();
        }
    }, [languageId, chapterId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-800" size={48} />
            </div>
        );
    }

    if (!content) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Content Not Found</h2>
                <Link href={`/dashboard/skillforge/programming/${languageId}`} className="text-slate-800 font-bold hover:underline">
                    Back to Syllabus
                </Link>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white font-sans overflow-hidden">
            {/* Sidebar (Optional - for larger screens could show chapter list) */}
            <div className="hidden lg:flex flex-col w-80 border-r border-slate-100 bg-slate-50/50 h-full">
                <div className="p-6 border-b border-slate-100">
                    <Link href={`/dashboard/skillforge/programming/${languageId}`} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-4">
                        <ArrowLeft size={16} /> Back to Course
                    </Link>
                    <h2 className="text-xl font-black text-slate-900 capitalize">{languageId} Mastery</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Current Module</p>
                        <p className="font-bold text-slate-900">{content.title}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Mobile Header */}
                <div className="lg:hidden h-16 border-b border-slate-100 flex items-center px-6 justify-between bg-white z-10">
                    <Link href={`/dashboard/skillforge/programming/${languageId}`} className="p-2 -ml-2 text-slate-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <span className="font-bold text-slate-800 truncate">{content.title}</span>
                    <button className="p-2 -mr-2 text-slate-500">
                        <Menu size={20} />
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
                    <div className="max-w-3xl mx-auto pb-24">
                        <div className="mb-8">
                            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-4">
                                Module Content
                            </span>
                        </div>

                        {/* Markdown Rendering */}
                        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-slate-800 prose-img:rounded-2xl">
                            <ReactMarkdown
                                components={{
                                    code({ node, inline, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <div className="relative group rounded-xl overflow-hidden my-6 border border-slate-200 shadow-sm">
                                                <div className="absolute top-0 right-0 px-3 py-1 bg-slate-800 text-slate-400 text-xs font-mono rounded-bl-lg">
                                                    {match[1]}
                                                </div>
                                                <SyntaxHighlighter
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.9rem', backgroundColor: '#1e293b' }}
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-sm font-bold" {...props}>
                                                {children}
                                            </code>
                                        );
                                    }
                                }}
                            >
                                {content.content}
                            </ReactMarkdown>
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between mt-16 pt-8 border-t border-slate-100">
                            <button className="flex items-center gap-3 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                                <ChevronLeft size={18} /> Previous
                            </button>
                            <button className="flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 shadow-lg shadow-slate-200 transition-all hover:translate-x-1">
                                Next Lesson <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
