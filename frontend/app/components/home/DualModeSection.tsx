'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Briefcase, BookOpen, Zap, Sparkles, Code2, Target } from 'lucide-react';

const prepFeatures = [
    { icon: Sparkles, label: 'AI Mock Interviews (Voice & Video)' },
    { icon: Code2, label: '200+ Company-Picked Questions' },
    { icon: BookOpen, label: 'SQL & Database Challenges' },
    { icon: Target, label: 'Resume & Skills AI Audit' },
    { icon: Target, label: 'Logic & Aptitude Drills' },
];

const hubFeatures = [
    { icon: Zap, label: 'GitHub Residency' },
    { icon: Code2, label: 'Professional Deployment' },
    { icon: Sparkles, label: 'Industrial Logic & Standards' },
    { icon: Target, label: 'Production Ready Tag' },
    { icon: Zap, label: 'Microservices Architecture' },
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
        <section className="py-12 md:py-16 relative overflow-hidden bg-transparent">
            {/* Semantic wrapper */}
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-foreground text-[11px] font-[900] uppercase tracking-[0.25em] mb-8">
                        The transformation
                    </div>
                    <h2 className="text-5xl md:text-7xl font-[1000] text-foreground tracking-tighter mb-8 leading-[0.95]">
                        Your Journey to <br /> <span className="text-primary">Top Tech Companies.</span>
                    </h2>
                    <p className="text-xl text-foreground/70 font-medium max-w-xl mx-auto">
                        From cracking the placement interviews to gaining real industry experience, we guide you every step of the way.
                    </p>
                </div>

                {/* Cards Container */}
                <div
                    className="flex flex-col lg:flex-row gap-8 h-auto lg:min-h-[600px] items-center justify-center"
                    onMouseLeave={() => setHoveredMode(null)}
                >
                    {/* ─── Placement Ecosystem (Amber) ─── */}
                    <div
                        className={`
                            relative rounded-[3rem] overflow-hidden w-full lg:w-1/2
                            transition-all duration-300 ease-out
                            ${hoveredMode === 'work' ? 'opacity-50 scale-[0.98]' : 'scale-100'}
                            ${hoveredMode === 'prep' ? 'shadow-primary/20 -translate-y-2' : ''}
                            bg-card flex flex-col group
                            border border-border hover:border-primary/50 text-card-foreground
                            shadow-xl
                        `}
                        onMouseEnter={() => setHoveredMode('prep')}
                    >
                        {/* Glow effect */}
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform-gpu will-change-opacity blur-3xl" />

                        <div className="p-10 lg:p-12 flex flex-col h-full relative z-10">
                            {/* Top row */}
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-16 h-16 rounded-3xl bg-secondary text-primary flex items-center justify-center border border-border transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20">
                                    <BookOpen size={30} strokeWidth={2.5} />
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-secondary text-primary text-xs font-bold tracking-widest uppercase border border-border">
                                        Step 1
                                    </div>
                                </div>
                            </div>

                            {/* Brand Name */}
                            <div className="mb-auto">
                                <h3 className="text-4xl md:text-5xl font-[1000] text-foreground mb-2 tracking-tighter transition-colors duration-300 group-hover:text-primary">
                                    The Screening Filter
                                </h3>
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary/80 mb-8">
                                    Survive the technical rounds
                                </p>
                                <p className="text-foreground/70 text-lg leading-relaxed mb-10 max-w-md font-medium">
                                    Lectures don't pass interviews; writing optimal code under a timer does. We simulate the exact technical checks you'll face before a recruiter ever looks at your resume.
                                </p>

                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                                    {prepFeatures.map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-center gap-3 text-foreground font-extrabold text-[13px]"
                                        >
                                            <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border">
                                                <CheckCircle2 className="text-primary" size={12} strokeWidth={3} />
                                            </div>
                                            {item.label}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="mt-12 pt-8 border-t border-border/50">
                                <Link
                                    href="/register/student"
                                    className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-secondary text-foreground font-[900] text-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 border border-border shadow-sm"
                                >
                                    Explore Placement Mode <ArrowRight size={20} strokeWidth={3} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Arrow Divider */}
                    <div className="hidden lg:flex flex-col items-center justify-center -mx-4 z-20">
                        <div className="w-12 h-12 rounded-full bg-background shadow-lg shadow-primary/10 border border-border flex items-center justify-center text-primary">
                            <ArrowRight size={24} strokeWidth={3} />
                        </div>
                    </div>

                    {/* ─── Simulation Journey (We2Hub) ─── */}
                    <div
                        className={`
                            relative rounded-[3rem] overflow-hidden w-full lg:w-1/2
                            transition-all duration-300 ease-out
                            ${hoveredMode === 'prep' ? 'opacity-50 scale-[0.98]' : 'scale-100'}
                            ${hoveredMode === 'work' ? 'shadow-primary/20 -translate-y-2' : ''}
                            bg-card text-card-foreground flex flex-col group
                            border border-border hover:border-primary/50
                            shadow-xl
                        `}
                        onMouseEnter={() => setHoveredMode('work')}
                    >
                        {/* Glow effects */}
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform-gpu will-change-opacity blur-3xl" />

                        <div className="p-10 lg:p-12 flex flex-col h-full relative z-10">
                            {/* Top row */}
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-16 h-16 rounded-3xl bg-secondary text-primary flex items-center justify-center border border-border transition-all duration-500 group-hover:scale-110 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/20">
                                    <Briefcase size={30} strokeWidth={2.5} />
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-secondary text-primary text-xs font-bold tracking-widest uppercase border border-border">
                                        Step 2
                                    </div>
                                </div>
                            </div>

                            {/* Brand Name */}
                            <div className="mb-auto">
                                <h3 className="text-4xl md:text-5xl font-[1000] text-foreground mb-2 tracking-tighter transition-colors duration-300 group-hover:text-primary">
                                    Industrial Proof of Work
                                </h3>
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary/80 mb-8">
                                    Beat the "No Experience" trap
                                </p>
                                <p className="text-foreground/70 text-lg leading-relaxed mb-10 max-w-md font-medium">
                                    Stop being just another fresher with a to-do list app. Build and deploy production-scale systems that force senior engineers to take you seriously.
                                </p>

                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                                    {hubFeatures.map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-center gap-3 text-foreground font-extrabold text-[13px]"
                                        >
                                            <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border group-hover:border-primary/50">
                                                <Zap className="text-primary" size={12} strokeWidth={3} />
                                            </div>
                                            {item.label}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="mt-12 pt-8 border-t border-border/50">
                                <Link
                                    href="/register/student"
                                    className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-primary text-primary-foreground font-[900] text-lg hover:bg-primary/90 transition-all duration-300 shadow-md shadow-primary/20 active:scale-95"
                                >
                                    Start 21-Day Cycle <ArrowRight size={20} strokeWidth={3} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
