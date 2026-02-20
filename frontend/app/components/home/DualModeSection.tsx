'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Briefcase, BookOpen, Zap, Sparkles, Code2, Target } from 'lucide-react';

const prepFeatures = [
    { icon: Sparkles, label: 'AI Mock Interviews (Voice & Video)' },
    { icon: Code2, label: '200+ Hand-picked DSA Questions' },
    { icon: BookOpen, label: 'SQL & Database Challenges' },
    { icon: Target, label: 'Resume & Skills AI Audit' },
    { icon: Target, label: 'Logic & Aptitude Drills' },
    { icon: Sparkles, label: 'Hand-picked Concept Sheets' },
];

const hubFeatures = [
    { icon: Zap, label: 'Industry Sprint Board' },
    { icon: Code2, label: 'Senior AI Code Reviews' },
    { icon: Sparkles, label: 'GitHub & Industry Standards' },
    { icon: Target, label: 'Professional Engineering Tag' },
    { icon: Zap, label: 'Production System Design' },
    { icon: Code2, label: 'Industrial Work Certificates' },
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
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-brand-orange text-[11px] font-[900] uppercase tracking-[0.25em] mb-8">
                        The transformation
                    </div>
                    <h2 className="text-5xl md:text-7xl font-[1000] text-brand-black tracking-tighter mb-8 leading-[0.95]">
                        Your Journey to <br /> <span className="text-gradient">Top Tech Companies.</span>
                    </h2>
                    <p className="text-xl text-gray-500 font-medium max-w-xl mx-auto">
                        From cracking the placement interviews to gaining real industry experience, we guide you every step of the way.
                    </p>
                </motion.div>

                {/* Cards Container */}
                <div
                    className="flex flex-col lg:flex-row gap-8 h-auto lg:min-h-[600px] items-center justify-center"
                    onMouseLeave={() => setHoveredMode(null)}
                >
                    {/* ─── Placement Ecosystem (Prep0) ─── */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                        className={`
                            relative rounded-[3rem] overflow-hidden w-full lg:w-1/2
                            transition-all duration-500 ease-out will-change-transform
                            ${hoveredMode === 'work' ? 'opacity-50 scale-[0.98]' : 'scale-100'}
                            ${hoveredMode === 'prep' ? 'shadow-emerald-200/50 -translate-y-2' : ''}
                            bg-white flex flex-col group
                            border border-gray-200/60 hover:border-emerald-200
                            shadow-2xl
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
                                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold tracking-widest uppercase">
                                        Step 1
                                    </div>
                                </div>
                            </div>

                            {/* Brand Name */}
                            <div className="mb-auto">
                                <h3 className="text-4xl md:text-5xl font-[1000] text-brand-black mb-2 tracking-tighter transition-colors duration-300 group-hover:text-emerald-700">
                                    Placement Accelerator
                                </h3>
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600/70 mb-8">
                                    Solve the rejection problem
                                </p>
                                <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md font-medium">
                                    Are you clearing the technical rounds? We bridge the logic gap that video lectures miss, ensuring you're ready for every screening.
                                </p>

                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                                    {prepFeatures.map((item, i) => (
                                        <motion.li
                                            key={i}
                                            className="flex items-center gap-3 text-brand-black font-extrabold text-[13px]"
                                        >
                                            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                                                <CheckCircle2 className="text-emerald-500" size={12} strokeWidth={3} />
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
                                    Explore Placement Mode <ArrowRight size={20} strokeWidth={3} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Arrow Divider */}
                    <div className="hidden lg:flex flex-col items-center justify-center -mx-4 z-20">
                        <div className="w-12 h-12 rounded-full bg-white shadow-xl shadow-brand-orange/20 border border-gray-100 flex items-center justify-center text-brand-orange">
                            <ArrowRight size={24} strokeWidth={3} />
                        </div>
                    </div>

                    {/* ─── Simulation Journey (We2Hub) ─── */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                        className={`
                            relative rounded-[3rem] overflow-hidden w-full lg:w-1/2
                            transition-all duration-500 ease-out will-change-transform
                            ${hoveredMode === 'prep' ? 'opacity-50 scale-[0.98]' : 'scale-100'}
                            ${hoveredMode === 'work' ? 'shadow-brand-orange/20 -translate-y-2' : ''}
                            bg-[#0B0F19] text-white flex flex-col group
                            border border-white/5 hover:border-brand-orange/20
                            shadow-2xl
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
                                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-900/40 text-brand-orange text-xs font-bold tracking-widest uppercase border border-brand-orange/20">
                                        Step 2
                                    </div>
                                </div>
                            </div>

                            {/* Brand Name */}
                            <div className="mb-auto">
                                <h3 className="text-4xl md:text-5xl font-[1000] text-white mb-2 tracking-tighter transition-colors duration-300 group-hover:text-brand-orange">
                                    Industrial Simulation
                                </h3>
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-orange/70 mb-8">
                                    Solve the "No Experience" problem
                                </p>
                                <p className="text-gray-300/80 text-lg leading-relaxed mb-10 max-w-md font-medium">
                                    Stop being just another "fresher". Build the industrial proof-of-work that top engineering teams actually respect.
                                </p>

                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                                    {hubFeatures.map((item, i) => (
                                        <motion.li
                                            key={i}
                                            className="flex items-center gap-3 text-gray-300 font-extrabold text-[13px]"
                                        >
                                            <div className="w-6 h-6 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0 border border-white/10 group-hover:border-brand-orange/30">
                                                <Zap className="text-brand-orange" size={12} strokeWidth={3} />
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
