'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Clock,
    Share2,
    Bookmark,
    ChevronRight,
    HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'next/navigation';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import { docsData } from '../data';

export default function DocArticlePage() {
    const params = useParams();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const slug = params.slug as string;
    const article = docsData[slug];

    if (!article) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <HelpCircle size={64} className="text-gray-200 mb-6" />
                    <h1 className="text-3xl font-black text-brand-black mb-4">Article Not Found</h1>
                    <p className="text-gray-500 mb-8 max-w-md">We couldn&apos;t find the guide you were looking for. It might have been moved or renamed.</p>
                    <Link href="/docs" className="h-12 px-8 bg-brand-orange text-white font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform">
                        <ArrowLeft size={18} /> Back to Hub
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-6">

                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-12">
                        <Link href="/docs" className="hover:text-brand-orange transition-colors">Docs Hub</Link>
                        <ChevronRight size={10} />
                        <span className="text-gray-300">{article.category}</span>
                        <ChevronRight size={10} />
                        <span className="text-brand-orange">{article.title}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                        {/* Left Content Area */}
                        <div className="lg:col-span-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h1 className="text-4xl md:text-6xl font-black text-brand-black mb-6 leading-tight">
                                    {article.title}
                                </h1>
                                <p className="text-xl text-gray-500 font-medium mb-12 border-l-4 border-brand-orange/20 pl-6 italic">
                                    {article.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-6 py-6 border-y border-gray-100 mb-12">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                        <Clock size={14} />
                                        Last Updated: {article.lastUpdated}
                                    </div>
                                    <div className="flex items-center gap-4 ml-auto">
                                        <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-brand-orange transition-all">
                                            <Bookmark size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-brand-orange transition-all">
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Article Content (ReactMarkdown) */}
                                <div className="max-w-none space-y-6">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-4xl md:text-5xl font-black text-brand-black mt-16 mb-8 leading-tight tracking-tight" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-3xl font-extrabold text-brand-black mt-12 mb-6 tracking-tight flex items-center gap-3"><span className="w-1.5 h-6 bg-brand-orange rounded-full"></span>{props.children}</h2>,
                                            h3: ({ node, ...props }) => <h3 className="text-2xl font-bold text-brand-black mt-8 mb-4 tracking-tight" {...props} />,
                                            p: ({ node, ...props }) => <p className="text-lg text-gray-600 leading-relaxed font-medium mb-6" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="space-y-4 my-6 ml-2" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal list-outside space-y-4 my-6 ml-6 text-gray-600 font-medium" {...props} />,
                                            li: ({ node, ...props }) => (
                                                <li className="flex items-start gap-4">
                                                    <div className="w-2 h-2 rounded-full bg-brand-orange mt-2.5 shrink-0 shadow-[0_0_8px_rgba(255,87,34,0.4)]" />
                                                    <span className="text-gray-600 font-medium leading-relaxed flex-1">{props.children}</span>
                                                </li>
                                            ),
                                            strong: ({ node, ...props }) => <strong className="text-brand-black font-extrabold bg-brand-orange/5 px-1 rounded" {...props} />,
                                            a: ({ node, ...props }) => <a className="font-bold text-brand-orange hover:text-brand-orange-hover hover:underline transition-all inline-flex items-center gap-1" {...props} />,
                                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-brand-orange/30 pl-6 py-2 my-8 italic text-gray-500 bg-gray-50/50 rounded-r-2xl" {...props} />
                                        }}
                                    >
                                        {article.content.replace(/^# .*\n/, '') /* Remove the first H1 since it's already rendered globally above */}
                                    </ReactMarkdown>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="lg:col-span-4 sticky top-32 space-y-8">

                            {/* Related Links */}
                            {article.relatedLinks && (
                                <div className="p-8 rounded-[32px] bg-gray-50 border border-gray-100">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Related Guides</h5>
                                    <div className="space-y-4">
                                        {article.relatedLinks.map((link, idx) => (
                                            <Link
                                                key={idx}
                                                href={link.href}
                                                className="flex items-center justify-between p-4 rounded-2xl bg-white border border-transparent hover:border-brand-orange/30 hover:shadow-lg transition-all group"
                                            >
                                                <span className="font-bold text-sm text-brand-black group-hover:text-brand-orange transition-colors">{link.label}</span>
                                                <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Need Help? */}
                            <div className="p-8 rounded-[32px] bg-brand-black text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-orange/20 transition-colors" />
                                <h5 className="text-xl font-black mb-4 relative z-10">Stuck or Confused?</h5>
                                <p className="text-sm text-gray-400 mb-8 relative z-10 font-medium">
                                    Our mentor team is available 24/7 on Discord to help you with complex topics.
                                </p>
                                <button className="w-full h-12 rounded-xl bg-brand-orange text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2 relative z-10">
                                    Join Community <ArrowRight size={14} />
                                </button>
                            </div>

                        </div>

                    </div>

                </div>
            </div>

            <Footer />
        </main>
    );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}
