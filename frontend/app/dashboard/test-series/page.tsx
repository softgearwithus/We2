'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Building2, ChevronRight, Mic, Star, Zap, Trophy, Target, Sparkles, TrendingUp } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

// --- Hyper-Premium Components ---

const TiltCard = ({ children, className, href }: { children: React.ReactNode; className?: string; href: string }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

    function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    }

    function onMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            className={`group perspective-1000 ${className}`}
        >
            <Link href={href} className="block h-full cursor-none">
                {children}
            </Link>
        </motion.div>
    );
};

const AnimatedBackground = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#F8FAFC]">
        {/* Living Ambient Orbs */}
        <motion.div
            animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
                scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]"
        />
        <motion.div
            animate={{
                x: [0, -80, 0],
                y: [0, 100, 0],
                scale: [1, 1.1, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px]"
        />

        {/* Floating Geometric Shapes */}
        <motion.div
            animate={{ rotate: 360, y: [0, -20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-12 h-12 border border-indigo-200/20 rounded-lg"
        />
        <motion.div
            animate={{ rotate: -360, x: [0, 20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/3 right-1/4 w-16 h-16 border border-emerald-200/20 rounded-full"
        />

        {/* Grain Overlay for Cinematic Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] mix-blend-overlay pointer-events-none" />
    </div>
);

const SpotlightInside = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            className="absolute inset-0 z-10 transition-opacity duration-300 pointer-events-none overflow-hidden rounded-[32px]"
            style={{
                opacity,
                background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(99, 102, 241, 0.08), transparent 40%)`,
            }}
        />
    );
};

export default function TestSeriesPage() {
    return (
        <div className="min-h-screen font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 overflow-x-hidden pb-20">
            <AnimatedBackground />

            <div className="max-w-7xl mx-auto p-6 lg:p-12 relative z-10">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-8 transition-all group px-5 py-2.5 rounded-full hover:bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-sm hover:shadow-md active:scale-95">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </Link>

                    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-flex items-center gap-2 border border-indigo-600/20"
                            >
                                <Sparkles size={12} className="animate-pulse" /> Pro Simulation Platform
                            </motion.div>
                            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter text-slate-900 mb-6 leading-none">
                                Test Series <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">Pro.</span>
                            </h1>
                            <p className="text-xl text-slate-500 max-w-2xl leading-relaxed italic">
                                "The difference between semi-pro and elite is the quality of your practice."
                            </p>
                        </div>

                        {/* Status Stats - Hyper Premium Style */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col gap-5 bg-white/90 backdrop-blur-xl p-8 rounded-[40px] border border-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors" />

                            <div className="flex items-center gap-5">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center overflow-hidden shadow-lg group-hover:translate-x-1 transition-transform cursor-pointer">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 22}`} alt="user" />
                                        </div>
                                    ))}
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-1.5 text-yellow-500">
                                        {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} fill="currentColor" />)}
                                        <span className="text-sm font-black text-slate-900 ml-1">4.9</span>
                                    </div>
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-black">12.4k Trusted Reviews</p>
                                </div>
                            </div>
                            <div className="h-[1px] w-full bg-slate-100/80" />
                            <div className="flex items-center gap-10">
                                <div>
                                    <p className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                        <TrendingUp size={20} className="text-emerald-500" /> 10k+
                                    </p>
                                    <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">Active Candidates</p>
                                </div>
                                <div className="w-[1px] h-10 bg-slate-100" />
                                <div>
                                    <p className="text-2xl font-black text-indigo-600">95.2%</p>
                                    <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">Offer Conversion</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.header>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-32"
                >
                        {/* Subject Wise Card */}
                        <TiltCard href="/dashboard/test-series/subject">
                        <div className="relative bg-white rounded-[40px] p-10 h-full border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] group-hover:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.15)] transition-all duration-500 flex flex-col justify-between overflow-hidden">
                            <SpotlightInside />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />

                            <div className="relative z-20">
                                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-inner border border-indigo-100/50">
                                    <BookOpen size={40} />
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                    <h3 className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">Subject <br />Practice Series.</h3>
                                </div>
                                    <p className="text-slate-500 leading-relaxed text-lg font-medium">
                                        Practice <span className="text-indigo-600 font-bold">English, Aptitude, Logical Reasoning, & Computer Science</span> with structured MCQs.
                                    </p>
                            </div>

                            <div className="relative z-20 mt-14 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-indigo-600 font-black text-xl">Start Practice</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">4 Subjects Live</span>
                                </div>
                                <div className="w-14 h-14 rounded-[22px] bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-300 shadow-xl group-hover:shadow-indigo-500/40">
                                    <ChevronRight size={28} />
                                </div>
                            </div>
                        </div>
                    </TiltCard>

                    {/* Company Wise Card */}
                    <TiltCard href="/dashboard/test-series/company">
                        <div className="relative bg-white rounded-[40px] p-10 h-full border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] group-hover:shadow-[0_40px_80px_-20px_rgba(249,115,22,0.15)] transition-all duration-500 flex flex-col justify-between overflow-hidden">
                            <SpotlightInside />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />

                            <div className="relative z-20">
                                <div className="w-20 h-20 bg-orange-50 text-brand-orange rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500 shadow-inner border border-orange-100/50">
                                    <Building2 size={40} />
                                </div>
                                 <div className="flex items-center gap-2 mb-4">
                                     <div className="w-1.5 h-6 bg-brand-orange rounded-full" />
                                     <h3 className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">Company <br />Patterns.</h3>
                                 </div>
                                <p className="text-slate-500 leading-relaxed text-lg font-medium">
                                     Direct simulations for <span className="text-brand-orange font-bold">company-specific patterns</span>. Master interview mental models.
                                 </p>
                            </div>

                            <div className="relative z-20 mt-14 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-brand-orange font-black text-xl">Start Mock</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Premium Questions</span>
                                </div>
                                <div className="w-14 h-14 rounded-[22px] bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-orange transition-all duration-300 shadow-xl group-hover:shadow-orange-500/40">
                                    <ChevronRight size={28} />
                                </div>
                            </div>
                        </div>
                    </TiltCard>

                    {/* WriteX Analysis Card */}
                    <TiltCard href="/dashboard/test-series/communication">
                        <div className="relative bg-white rounded-[40px] p-10 h-full border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] group-hover:shadow-[0_40px_80px_-20px_rgba(16,185,129,0.15)] transition-all duration-500 flex flex-col justify-between overflow-hidden">
                            <SpotlightInside />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />

                            <div className="relative z-20">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-inner border border-emerald-100/50">
                                    <Mic size={40} />
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                                    <h3 className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">WriteX Analysis.</h3>
                                </div>
                                <p className="text-slate-500 leading-relaxed text-lg font-medium">
                                    Practice long-form responses and get a lenient AI score across relevance, fluency, grammar, and vocabulary.
                                </p>
                            </div>

                            <div className="relative z-20 mt-14 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-emerald-600 font-black text-xl">Start WriteX</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Get Question Now</span>
                                </div>
                                <div className="w-14 h-14 rounded-[22px] bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 shadow-xl group-hover:shadow-emerald-500/40">
                                    <ChevronRight size={28} />
                                </div>
                            </div>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* Cutting Edge Support section removed */}
            </div>
        </div>
    );
}
