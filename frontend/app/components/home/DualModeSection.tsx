'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Briefcase, BookOpen, Zap, Sparkles, Code2, Target } from 'lucide-react';

const prepFeatures = [
    { icon: Target, label: 'Resume Scanning & Optimization' },
    { icon: Code2, label: '200+ Company-Picked Questions' },
    { icon: BookOpen, label: 'Aptitude & Logic Drills' },
    { icon: Sparkles, label: 'AI Mock Technical Interviews' },
];

const hubFeatures = [
    { icon: Code2, label: 'Real-world JIRA Tickets' },
    { icon: Zap, label: 'Git & CI/CD Pipelines' },
    { icon: Sparkles, label: 'Code Reviews by Senior AI Devs' },
    { icon: Target, label: 'Industrial Work Experience Cert' },
];

export default function DualModeSection() {
    const [hoveredMode, setHoveredMode] = useState<'prep' | 'work' | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <section className="py-32 relative overflow-hidden bg-white">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/50" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-brand-orange text-[11px] font-[900] uppercase tracking-[0.25em] mb-8">
                        One platform. Two powerhouses.
                    </div>
                    <h2 className="text-5xl md:text-7xl font-[1000] text-brand-black tracking-tighter mb-8 leading-[0.95]">
                        Choose Your <br /> <span className="text-gradient">Career Pathway.</span>
                    </h2>
                    <p className="text-xl text-gray-500 font-medium max-w-xl mx-auto">
                        Whether you need to crack your dream offer or gain industry experience, we have the right path for you.
                    </p>
                </motion.div>

                {/* Cards Container */}
                <div
                    className="flex flex-col lg:flex-row gap-8 h-auto lg:min-h-[640px]"
                    onMouseLeave={() => setHoveredMode(null)}
                >
                    {/* ─── Prep0 Card ─── */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className={`
                            relative rounded-[3rem] overflow-hidden cursor-default
                            transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                            ${hoveredMode === 'work' ? 'lg:flex-[0.6] opacity-40 blur-[2px]' : 'lg:flex-1'}
                            ${hoveredMode === 'prep' ? 'lg:flex-[1.4]' : ''}
                            bg-white flex flex-col group
                            border border-gray-200/60 hover:border-emerald-200
                            shadow-2xl hover:shadow-emerald-100/50
                        `}
                        onMouseEnter={() => setHoveredMode('prep')}
                    >
                        {/* Glow effect */}
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-50 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="p-10 lg:p-12 flex flex-col h-full relative z-10">
                            {/* Top row */}
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-100">
                                    <BookOpen size={30} strokeWidth={2.5} />
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60 mb-1">Starting At</div>
                                    <div className="text-3xl font-[1000] text-brand-black">₹799<span className="text-sm font-bold text-gray-400">/mo</span></div>
                                </div>
                            </div>

                            {/* Brand Name */}
                            <div className="mb-auto">
                                <h3 className="text-5xl font-[1000] text-brand-black mb-2 tracking-tighter transition-colors duration-300 group-hover:text-emerald-700">
                                    Prep<span className="text-emerald-500">0</span>
                                </h3>
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600/70 mb-8">
                                    Placement Readiness
                                </p>
                                <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md font-medium">
                                    Master the technical screening. Ace your resume, aptitude tests, and technical interviews with zero fluff.
                                </p>

                                {/* Features */}
                                <ul className="space-y-4">
                                    {prepFeatures.map((item, i) => (
                                        <motion.li
                                            key={i}
                                            className="flex items-center gap-4 text-brand-black font-extrabold text-sm"
                                        >
                                            <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                                                <CheckCircle2 className="text-emerald-500" size={16} strokeWidth={3} />
                                            </div>
                                            {item.label}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <Link
                                    href="/register/student"
                                    className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-emerald-50 text-emerald-700 font-[900] text-lg hover:bg-emerald-600 hover:text-white transition-all duration-300 border border-emerald-100 shadow-sm"
                                >
                                    Launch Prep0 <ArrowRight size={20} strokeWidth={3} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* ─── We2Hub Card ─── */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={`
                            relative rounded-[3rem] overflow-hidden cursor-default
                            transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                            ${hoveredMode === 'prep' ? 'lg:flex-[0.6] opacity-40 blur-[2px]' : 'lg:flex-1'}
                            ${hoveredMode === 'work' ? 'lg:flex-[1.4]' : ''}
                            bg-brand-black text-white flex flex-col group
                            border border-gray-800 hover:border-brand-orange/30
                            shadow-2xl hover:shadow-brand-orange/20
                        `}
                        onMouseEnter={() => setHoveredMode('work')}
                    >
                        {/* Glow effects */}
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-orange/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="p-10 lg:p-12 flex flex-col h-full relative z-10">
                            {/* Top row */}
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-16 h-16 rounded-3xl bg-gray-900 text-white flex items-center justify-center border border-gray-800 transition-all duration-500 group-hover:scale-110 group-hover:border-brand-orange/30 group-hover:shadow-lg group-hover:shadow-brand-orange/10">
                                    <Briefcase size={30} strokeWidth={2.5} />
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange/60 mb-1">Starting At</div>
                                    <div className="text-3xl font-[1000] text-white">₹999<span className="text-sm font-bold text-gray-500">/mo</span></div>
                                </div>
                            </div>

                            {/* Brand Name */}
                            <div className="mb-auto">
                                <h3 className="text-5xl font-[1000] text-white mb-2 tracking-tighter transition-colors duration-300 group-hover:text-brand-orange">
                                    We2<span className="text-brand-orange">Hub</span>
                                </h3>
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-orange/70 mb-8">
                                    Industrial Connect
                                </p>
                                <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-md font-medium">
                                    Get the "Experience" tag. Work on production code, attend meetings, and ship features that matter.
                                </p>

                                {/* Features */}
                                <ul className="space-y-4">
                                    {hubFeatures.map((item, i) => (
                                        <motion.li
                                            key={i}
                                            className="flex items-center gap-4 text-gray-200 font-extrabold text-sm"
                                        >
                                            <div className="w-7 h-7 rounded-xl bg-gray-900 flex items-center justify-center shrink-0 border border-gray-800 group-hover:border-brand-orange/30">
                                                <Zap className="text-brand-orange" size={16} strokeWidth={3} />
                                            </div>
                                            {item.label}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="mt-12 pt-8 border-t border-gray-800">
                                <Link
                                    href="/register/student"
                                    className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 text-white font-[900] text-lg hover:from-brand-orange-hover hover:to-amber-400 transition-all duration-300 shadow-xl shadow-brand-orange/20 active:scale-95"
                                >
                                    Start 21-Day Cycle <ArrowRight size={20} strokeWidth={3} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
