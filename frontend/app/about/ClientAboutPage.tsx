'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Mic,
    FileText,
    BarChart3,
    Briefcase,
    ArrowRight,
    Target,
    Users,
    ShieldCheck,
    Globe
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const coreValues = [
    {
        icon: Globe,
        title: "Accessibility",
        description: "Breaking economic barriers to provide world-class tech preparation for every student."
    },
    {
        icon: Target,
        title: "Targeted Approach",
        description: "Focusing on company-specific patterns instead of generic, directionless grinding."
    },
    {
        icon: Users,
        title: "Community Driven",
        description: "Fostering a network of motivated learners, expert mentors, and forward-thinking recruiters."
    },
    {
        icon: ShieldCheck,
        title: "Trust & Quality",
        description: "Ensuring high-fidelity simulations and verified results that students and companies can rely on."
    }
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden border-b border-border/50">
                <div className="absolute inset-0 bg-[#0F2317]/5 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-primary text-xs font-bold uppercase tracking-widest mb-6 border border-primary/20"
                    >
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Our Mission
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-[80px] font-black tracking-tighter text-foreground mb-8 leading-[1.05]"
                    >
                        Bridging the <br />
                        <span className="text-primary">Preparation Gap.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-foreground/70 leading-relaxed max-w-2xl mx-auto font-medium"
                    >
                        We founded Emble with a single purpose: to ensure that talented engineers stop failing technical interviews due to a lack of realistic, high-pressure practice.
                    </motion.p>
                </div>
            </section>

            {/* The Problem Section */}
            <section className="py-24 border-b border-border bg-secondary/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-6 tracking-tight">The Interview Disconnect</h2>
                            <div className="space-y-6 text-foreground/70 text-lg leading-relaxed font-medium">
                                <p>
                                    Millions of students grind generic coding questions on autopilot, only to freeze when a real human recruiter asks them to explain their architecture or dive into system design.
                                </p>
                                <p>
                                    Technical capability does not equal interview capability. The nervousness, the time constraints, and the vocal communication are entirely different skills.
                                </p>
                                <div className="pt-6 flex flex-col gap-4">
                                    <div className="flex items-center gap-4 text-foreground font-bold text-xl">
                                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                            <Target size={24} />
                                        </div>
                                        <span>We built the simulator to fix this.</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative aspect-square lg:aspect-video rounded-[2.5rem] overflow-hidden bg-[#0F2317] shadow-2xl group flex items-center justify-center border border-border"
                        >
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                                backgroundSize: '32px 32px'
                            }} />
                            <div className="text-white text-center p-12 relative z-10">
                                <h3 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter mb-4">
                                    Train Like <br/>
                                    You Fight.
                                </h3>
                                <div className="h-1.5 w-16 bg-primary mx-auto rounded-full" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* What We Provide Section */}
            <section className="py-24 bg-background border-b border-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">Our Core Offerings</h2>
                        <p className="text-lg text-foreground/60 max-w-xl mx-auto font-medium">Everything you need to confidently clear the modern technical hiring bar.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Voice AI */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-10 rounded-3xl bg-secondary/50 border border-border group transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-background text-primary flex items-center justify-center border border-border mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                <Mic size={28} />
                            </div>
                            <h3 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Dynamic Voice Interviews</h3>
                            <p className="text-foreground/70 mb-8 leading-relaxed font-medium">
                                Practice realistic, high-pressure vocal interviews with our AI simulator. Stop typing answers and start speaking them. Receive granular feedback on your tone, pacing, and technical accuracy.
                            </p>
                            <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                                Try Voice AI <ArrowRight size={18} />
                            </Link>
                        </motion.div>

                        {/* Test Series */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-10 rounded-3xl bg-secondary/50 border border-border group transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-background text-primary flex items-center justify-center border border-border mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                <Briefcase size={28} />
                            </div>
                            <h3 className="text-3xl font-bold text-foreground mb-4 tracking-tight">100+ Company Test Series</h3>
                            <p className="text-foreground/70 mb-8 leading-relaxed font-medium">
                                Stop guessing what they will ask. We have compiled exact technical screening patterns, DSA questions, and logic puzzles from over 100 top tech companies into targeted test series.
                            </p>
                            <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                                Browse Companies <ArrowRight size={18} />
                            </Link>
                        </motion.div>

                        {/* Resume Builder */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-10 rounded-3xl bg-secondary/50 border border-border group transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-background text-primary flex items-center justify-center border border-border mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                <FileText size={28} />
                            </div>
                            <h3 className="text-3xl font-bold text-foreground mb-4 tracking-tight">ATS-Optimized Resumes</h3>
                            <p className="text-foreground/70 mb-8 leading-relaxed font-medium">
                                Your skills don\'t matter if your resume gets auto-rejected. Our built-in ATS generator creates perfect, machine-readable resumes strictly formatted to pass modern recruitment algorithms.
                            </p>
                            <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                                Build Resume <ArrowRight size={18} />
                            </Link>
                        </motion.div>

                        {/* Analytics */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-10 rounded-3xl bg-secondary/50 border border-border group transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-background text-primary flex items-center justify-center border border-border mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                <BarChart3 size={28} />
                            </div>
                            <h3 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Instant Granular Analytics</h3>
                            <p className="text-foreground/70 mb-8 leading-relaxed font-medium">
                                Don\'t wait three days for human feedback. Get instant, mathematically precise analytics on your coding efficiency, time-space complexity, and syntax errors immediately after finishing a simulation.
                            </p>
                            <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                                View Demo <ArrowRight size={18} />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-secondary/20 border-b border-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {coreValues.map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-secondary text-primary border border-border flex items-center justify-center mb-6">
                                    <value.icon size={22} />
                                </div>
                                <h4 className="text-lg font-bold text-foreground mb-3">{value.title}</h4>
                                <p className="text-sm text-foreground/60 font-medium leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-background">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="rounded-[3rem] bg-[#0F2317] p-12 md:p-20 text-center relative overflow-hidden group border border-[#1a3a26] shadow-2xl">
                        <div className="absolute top-1/2 left-1/2 w-[150%] h-[150%] bg-primary/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center">
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight tracking-tighter">
                                Start failing in private. <br />
                                Pass in public.
                            </h2>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                                <Link
                                    href="/dashboard"
                                    className="w-full sm:w-auto px-10 py-5 bg-white text-[#0F2317] font-bold text-lg rounded-2xl hover:bg-white/90 transition-all hover:scale-105 shadow-xl"
                                >
                                    Start Practicing Now
                                </Link>
                                <Link
                                    href="/contact"
                                    className="w-full sm:w-auto px-10 py-5 bg-transparent text-white font-bold text-lg rounded-2xl hover:bg-white/10 transition-all border border-white/20"
                                >
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
