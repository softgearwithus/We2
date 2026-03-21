'use client';

import React from 'react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import DotBackground from '@/app/components/ui/DotBackground';
import { BookOpen, Code2, Users, Trophy, Target, Zap } from 'lucide-react';

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-brand-black relative selection:bg-brand-orange-hover selection:text-white">
            <DotBackground />
            <Navbar />

            <main className="relative z-10 pt-32 pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-6">
                            The Methodology
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-brand-black tracking-tight mb-6 leading-tight">
                            From Student to <br />
                            <span className="text-brand-orange">Software Engineer.</span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            EMBLE bridges the gap between academic theory and industrial application through a proven 4-step process.
                        </p>
                    </div>

                    {/* Timeline / Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
                        <div className="space-y-12">
                            {[
                                {
                                    icon: BookOpen,
                                    title: "1. Master the Fundamentals",
                                    desc: "Build a rock-solid foundation. You'll master DSA patterns, SQL queries, and core computer science concepts that top companies actually test for."
                                },
                                {
                                    icon: Code2,
                                    title: "2. Build Full Stack Systems",
                                    desc: "Stop watching tutorials. You'll build production-ready applications using professional tech stacks (React, Node, AWS) and collaborate using GitHub."
                                },
                                {
                                    icon: Target,
                                    title: "3. Crack AI Interviews",
                                    desc: "Practice makes perfect. Face our AI-driven voice and video interviews to get real-time feedback on your communication and technical logic."
                                },
                                {
                                    icon: Trophy,
                                    title: "4. Launch Your Career",
                                    desc: "Graduate with a verified portfolio. We take your completed projects and Skill Scorecard directly to our network of hiring partners."
                                }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center shrink-0 border border-orange-100 group-hover:scale-110 transition-transform">
                                        <step.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-brand-black mb-2">{step.title}</h3>
                                        <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl opacity-20 blur-2xl"></div>
                            <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-premium">
                                <img loading="lazy" decoding="async"
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                                    alt="Team collaboration"
                                    className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 to-transparent flex items-end p-8">
                                    <p className="text-white font-medium italic">"The simulation felt exactly like my first month at Amazon. I was ready on Day 1."</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Value Prop Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="premium-card p-8 group">
                            <Target className="text-brand-orange mb-6" size={32} />
                            <h3 className="text-xl font-bold text-brand-black mb-3">Structured Roadmap</h3>
                            <p className="text-gray-500 text-sm">No more tutorial hell. Follow a clear, linear path designed by engineering managers from FAANG companies.</p>
                        </div>
                        <div className="premium-card p-8 group">
                            <Users className="text-brand-orange mb-6" size={32} />
                            <h3 className="text-xl font-bold text-brand-black mb-3">Community Driven</h3>
                            <p className="text-gray-500 text-sm">Learn alongside thousands of peers. Pair program, and grow your network.</p>
                        </div>
                        <div className="premium-card p-8 group">
                            <Zap className="text-brand-orange mb-6" size={32} />
                            <h3 className="text-xl font-bold text-brand-black mb-3">AI Advantage</h3>
                            <p className="text-gray-500 text-sm">Get 24/7 unblocking support. Our custom LLMs understand your context and help you fix bugs instantly.</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
