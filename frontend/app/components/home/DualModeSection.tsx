'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Briefcase, BookOpen, Zap, Sparkles, Code2, Target } from 'lucide-react';

const prepFeatures = [
    { icon: Target, label: 'Resume Scanning & Optimization' },
    { icon: Code2, label: 'Mock Technical Interviews' },
    { icon: BookOpen, label: 'Aptitude & Logic Drills' },
    { icon: Sparkles, label: 'Company-specific Question Banks' },
];

const hubFeatures = [
    { icon: Code2, label: 'Real-world JIRA Tickets' },
    { icon: Zap, label: 'Git & CI/CD Pipelines' },
    { icon: Sparkles, label: 'Code Reviews by Senior AI Devs' },
    { icon: Target, label: 'Production Deployment Drills' },
];

export default function DualModeSection() {
    const [hoveredMode, setHoveredMode] = useState<'prep' | 'work' | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <section className="py-28 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/80" />
            <div className="absolute inset-0 opacity-[0.015]" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #1e1e1e 1px, transparent 0)`,
                backgroundSize: '32px 32px'
            }} />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                        Choose Your Path
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-brand-black tracking-tight mb-5 leading-[1.1]">
                        Two Platforms. <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-brand-black to-gray-600 bg-clip-text text-transparent">One Mission.</span>
                    </h2>
                    <p className="text-lg text-gray-500 max-w-xl mx-auto">
                        Choose the pathway that matches your current career stage — from placement prep to real-world experience.
                    </p>
                </motion.div>

                {/* Cards Container */}
                <div
                    className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[620px]"
                    onMouseLeave={() => setHoveredMode(null)}
                >
                    {/* ─── Prep0 Card ─── */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={`
                            relative rounded-3xl overflow-hidden cursor-default
                            transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                            ${hoveredMode === 'work' ? 'lg:flex-[0.4] opacity-40 blur-[1px]' : 'lg:flex-1'}
                            ${hoveredMode === 'prep' ? 'lg:flex-[1.6]' : ''}
                            bg-white flex flex-col group
                            border border-gray-200/80 hover:border-emerald-200
                            shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(16,185,129,0.08)]
                        `}
                        onMouseEnter={() => setHoveredMode('prep')}
                    >
                        {/* Top gradient bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Glow effect */}
                        <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-100/40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="p-8 lg:p-10 flex flex-col h-full relative z-10">
                            {/* Top row */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/80 text-emerald-600 flex items-center justify-center border border-emerald-100 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-100">
                                    <BookOpen size={26} />
                                </div>
                                <AnimatePresence>
                                    {hoveredMode === 'prep' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8, y: -5 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, y: -5 }}
                                            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100"
                                        >
                                            Placement Ready
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Brand Name */}
                            <div className="mb-auto">
                                <h3 className="text-4xl font-extrabold text-brand-black mb-1 tracking-tight transition-colors duration-300 group-hover:text-emerald-700">
                                    Prep<span className="text-emerald-500 font-black">0</span>
                                </h3>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600/70 mb-5">
                                    Placement Preparation
                                </p>
                                <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md">
                                    Master the basics. Refine your resume, ace aptitude tests, and crack technical interviews with targeted modules.
                                </p>

                                {/* Features with stagger */}
                                <ul className={`space-y-3.5 transition-all duration-500 ${hoveredMode === 'work' ? 'opacity-0' : 'opacity-100'}`}>
                                    {prepFeatures.map((item, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                                            className="flex items-center gap-3 text-brand-black font-medium text-sm"
                                        >
                                            <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                                                <CheckCircle2 className="text-emerald-500" size={14} />
                                            </div>
                                            {item.label}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className={`mt-8 pt-6 border-t border-gray-100 transition-all duration-500 ${hoveredMode === 'work' ? 'opacity-0' : 'opacity-100'}`}>
                                <Link
                                    href="/register/student"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 hover:gap-3 transition-all duration-300 border border-emerald-100"
                                >
                                    Launch Prep0 <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* ─── We2Hub Card ─── */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`
                            relative rounded-3xl overflow-hidden cursor-default
                            transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                            ${hoveredMode === 'prep' ? 'lg:flex-[0.4] opacity-40 blur-[1px]' : 'lg:flex-1'}
                            ${hoveredMode === 'work' ? 'lg:flex-[1.6]' : ''}
                            bg-brand-black text-white flex flex-col group
                            border border-gray-800 hover:border-brand-orange/30
                            shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_60px_rgba(255,161,22,0.1)]
                        `}
                        onMouseEnter={() => setHoveredMode('work')}
                    >
                        {/* Top gradient bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-brand-orange via-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Glow effects */}
                        <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-orange/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-orange/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="p-8 lg:p-10 flex flex-col h-full relative z-10">
                            {/* Top row */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-white flex items-center justify-center border border-gray-700 transition-all duration-500 group-hover:scale-110 group-hover:border-brand-orange/30 group-hover:shadow-lg group-hover:shadow-brand-orange/10">
                                    <Briefcase size={26} />
                                </div>
                                <AnimatePresence>
                                    {hoveredMode === 'work' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8, y: -5 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, y: -5 }}
                                            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                                            className="px-3 py-1.5 bg-brand-orange/10 text-brand-orange border border-brand-orange/20 text-[10px] font-bold uppercase tracking-widest rounded-full"
                                        >
                                            Industry Ready
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Brand Name */}
                            <div className="mb-auto">
                                <h3 className="text-4xl font-extrabold text-white mb-1 tracking-tight transition-colors duration-300 group-hover:text-brand-orange">
                                    We2<span className="text-brand-orange font-black">Hub</span>
                                </h3>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/60 mb-5">
                                    Industry Connect
                                </p>
                                <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-md">
                                    Stop studying, start building. Join a virtual tech team, attend stand-ups, and ship production code.
                                </p>

                                {/* Features with stagger */}
                                <ul className={`space-y-3.5 transition-all duration-500 ${hoveredMode === 'prep' ? 'opacity-0' : 'opacity-100'}`}>
                                    {hubFeatures.map((item, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                                            className="flex items-center gap-3 text-gray-300 font-medium text-sm"
                                        >
                                            <div className="w-6 h-6 rounded-md bg-gray-800/80 flex items-center justify-center shrink-0 group-hover:bg-brand-orange/10 transition-colors">
                                                <Zap className="text-brand-orange" size={14} />
                                            </div>
                                            {item.label}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className={`mt-8 pt-6 border-t border-gray-800 transition-all duration-500 ${hoveredMode === 'prep' ? 'opacity-0' : 'opacity-100'}`}>
                                <Link
                                    href="/register/student"
                                    className="w-full block py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-400 text-white font-bold text-sm text-center transition-all duration-300 shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Start 21-Day Cycle
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom stats strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16 text-center"
                >
                    {[
                        { value: '500+', label: 'DSA Problems' },
                        { value: '50+', label: 'Simulations' },
                        { value: '24/7', label: 'AI Mentorship' },
                        { value: '95%', label: 'Placement Rate' },
                    ].map((stat, i) => (
                        <div key={i} className="group/stat">
                            <div className="text-2xl md:text-3xl font-extrabold text-brand-black group-hover/stat:text-brand-orange transition-colors duration-300">
                                {stat.value}
                            </div>
                            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-1">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
