'use client';

import React from 'react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import DotBackground from '@/app/components/ui/DotBackground';
import { Bot, Sparkles, MessageSquare, Code, BrainCircuit, Zap } from 'lucide-react';

export default function AiMentorsPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-brand-black relative selection:bg-brand-orange-hover selection:text-white">
            <DotBackground />
            <Navbar />

            <main className="relative z-10 pt-32 pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-6">
                            24/7 Intelligent Support
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-brand-black tracking-tight mb-6 leading-tight">
                            Personalized mentorship <br />
                            <span className="text-brand-orange">at scale.</span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            Never get stuck again. Our context-aware AI understands your code, your curriculum, and your career goals.
                        </p>
                    </div>

                    {/* Dual Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
                        {/* Technical Mentor */}
                        <div className="group relative rounded-[2.5rem] bg-brand-black overflow-hidden shadow-premium border border-gray-800">
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-orange/10 blur-[80px] rounded-full pointer-events-none"></div>
                            <div className="relative p-10 h-full flex flex-col items-start">
                                <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-8 backdrop-blur-sm">
                                    <Code className="text-brand-orange" size={32} />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-4">Technical Mentor</h2>
                                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                    "I analyze your code complexity, suggest optimizations, and help you debug errors instantly. I'm trained on millions of lines of high-quality production code."
                                </p>
                                <ul className="space-y-4 mt-auto">
                                    <li className="flex items-center gap-3 text-white font-medium">
                                        <Zap size={18} className="text-brand-orange" /> Real-time Syntax Checking
                                    </li>
                                    <li className="flex items-center gap-3 text-white font-medium">
                                        <Zap size={18} className="text-brand-orange" /> Complexity Analysis (Big O)
                                    </li>
                                    <li className="flex items-center gap-3 text-white font-medium">
                                        <Zap size={18} className="text-brand-orange" /> Best Practice Suggestions
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Career Coach */}
                        <div className="group relative rounded-[2.5rem] bg-white border border-gray-100 overflow-hidden shadow-subtle hover:shadow-premium transition-shadow duration-300">
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-50 blur-[80px] rounded-full pointer-events-none"></div>
                            <div className="relative p-10 h-full flex flex-col items-start">
                                <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-8">
                                    <MessageSquare className="text-brand-orange" size={32} />
                                </div>
                                <h2 className="text-3xl font-bold text-brand-black mb-4">Career Coach</h2>
                                <p className="text-gray-500 text-lg leading-relaxed mb-8">
                                    "I conduct mock interviews, review your resume keywords, and help you negotiate your salary. I know what recruiters at top companies are looking for."
                                </p>
                                <ul className="space-y-4 mt-auto">
                                    <li className="flex items-center gap-3 text-brand-black font-medium">
                                        <Sparkles size={18} className="text-brand-orange" /> Behavioral Mock Interviews
                                    </li>
                                    <li className="flex items-center gap-3 text-brand-black font-medium">
                                        <Sparkles size={18} className="text-brand-orange" /> Resume & LinkedIn Review
                                    </li>
                                    <li className="flex items-center gap-3 text-brand-black font-medium">
                                        <Sparkles size={18} className="text-brand-orange" /> Negotiation Scripts
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* How it works (Interactive Demo Placeholder) */}
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-subtle">
                        <BrainCircuit className="mx-auto text-gray-400 mb-6" size={48} />
                        <h3 className="text-2xl font-bold text-brand-black mb-4">Powered by EMBLE AI</h3>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            We use the proprietary EMBLE AI engine to ensure high accuracy and deep contextual understanding of your codebase.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
