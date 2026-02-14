'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Building2, ChevronRight, Mic, Star, Zap, Trophy, Target, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function TestSeriesPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 overflow-x-hidden">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto p-6 lg:p-12 relative z-10">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 text-center lg:text-left"
                >
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-8 transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </Link>

                    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
                                Test Series <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">Pro</span>
                                <span className="text-brand-orange">.</span>
                            </h1>
                            <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
                                The industry's most advanced simulation platform.
                                <span className="block mt-2 font-medium text-slate-700">
                                    Master <span className="text-indigo-600 underline decoration-2 decoration-indigo-200 underline-offset-4">Subjects</span>,
                                    crack <span className="text-brand-orange underline decoration-2 decoration-orange-200 underline-offset-4">Top Companies</span>,
                                    and ace <span className="text-emerald-600 underline decoration-2 decoration-emerald-200 underline-offset-4">Communication</span>.
                                </span>
                            </p>
                        </div>

                        {/* Trust Badge */}
                        <div className="hidden lg:flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg shadow-indigo-500/5 hover:scale-105 transition-transform duration-300">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                </div>
                                <p className="text-xs font-bold text-slate-700 mt-1">Trusted by 10,000+ Students</p>
                            </div>
                        </div>
                    </div>
                </motion.header>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {/* Subject Wise Card */}
                    <motion.div variants={item}>
                        <Link href="/dashboard/test-series/subject" className="group relative bg-white rounded-[32px] p-1 h-full block">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                            <div className="relative bg-white rounded-[30px] p-8 h-full border border-slate-100 shadow-xl shadow-slate-200/50 group-hover:shadow-2xl group-hover:shadow-indigo-500/20 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-100 transition-colors" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                                            <BookOpen size={32} />
                                        </div>
                                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Foundation</span>
                                    </div>

                                    <h3 className="text-3xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">Subject Wise</h3>
                                    <p className="text-slate-500 leading-relaxed text-base">
                                        Deep dive into <span className="font-semibold text-slate-700">DSA, OS, DBMS, and CN</span>.
                                        Build the rock-solid technical base required for every interview.
                                    </p>
                                </div>

                                <div className="relative z-10 mt-8 pt-8 border-t border-slate-100">
                                    <div className="flex items-center justify-between text-indigo-600 font-bold text-lg group-hover:translate-x-1 transition-transform">
                                        <span>Start Practice</span>
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Company Wise Card */}
                    <motion.div variants={item}>
                        <Link href="/dashboard/test-series/company" className="group relative bg-white rounded-[32px] p-1 h-full block">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-[32px] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                            <div className="relative bg-white rounded-[30px] p-8 h-full border border-slate-100 shadow-xl shadow-slate-200/50 group-hover:shadow-2xl group-hover:shadow-orange-500/20 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-100 transition-colors" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-16 h-16 bg-orange-50 text-brand-orange rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm">
                                            <Building2 size={32} />
                                        </div>
                                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Dream Job</span>
                                    </div>

                                    <h3 className="text-3xl font-bold text-slate-900 mb-3 group-hover:text-brand-orange transition-colors">Company Wise</h3>
                                    <p className="text-slate-500 leading-relaxed text-base">
                                        Targeted patterns for <span className="font-semibold text-slate-700">Google, Amazon, Microsoft</span>.
                                        Experience the pressure of real interview rounds.
                                    </p>
                                </div>

                                <div className="relative z-10 mt-8 pt-8 border-t border-slate-100">
                                    <div className="flex items-center justify-between text-brand-orange font-bold text-lg group-hover:translate-x-1 transition-transform">
                                        <span>Take Mock Test</span>
                                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition-colors duration-300">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Communication Skills Card */}
                    <motion.div variants={item}>
                        <Link href="/dashboard/test-series/communication" className="group relative bg-white rounded-[32px] p-1 h-full block">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[32px] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                            <div className="relative bg-white rounded-[30px] p-8 h-full border border-slate-100 shadow-xl shadow-slate-200/50 group-hover:shadow-2xl group-hover:shadow-emerald-500/20 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-100 transition-colors" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                                            <Mic size={32} />
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Soft Skills</span>
                                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">New</span>
                                        </div>
                                    </div>

                                    <h3 className="text-3xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">Communication</h3>
                                    <p className="text-slate-500 leading-relaxed text-base">
                                        Crack <span className="font-semibold text-slate-700">Amcat, WriteX, and HR Rounds</span>.
                                        Don't let poor communication hold back your technical skills.
                                    </p>
                                </div>

                                <div className="relative z-10 mt-8 pt-8 border-t border-slate-100">
                                    <div className="flex items-center justify-between text-emerald-600 font-bold text-lg group-hover:translate-x-1 transition-transform">
                                        <span>Improve Skills</span>
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Features / Why Choose Us Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 lg:mt-32"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">Why our tests are <span className="text-indigo-600">Different</span></h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">We don't just give you questions. We give you a simulation environment that mimics the actual exam pressure.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Zap, title: "Real-time Analysis", desc: "Get instant feedback on your speed and accuracy after every test.", color: "text-amber-500", bg: "bg-amber-50" },
                            { icon: Trophy, title: "Global Ranking", desc: "Compete with thousands of students and know where you stand.", color: "text-indigo-500", bg: "bg-indigo-50" },
                            { icon: Target, title: "Targeted Prep", desc: "AI identifies your weak areas and suggests specific subject modules.", color: "text-rose-500", bg: "bg-rose-50" },
                            { icon: Sparkles, title: "AI-Powered", desc: "Questions adapt to your skill level to keep you constantly challenged.", color: "text-emerald-500", bg: "bg-emerald-50" }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg hover:-translate-y-2 transition-transform duration-300">
                                <div className={`w-12 h-12 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-500 text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
