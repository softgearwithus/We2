'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Target,
    Rocket,
    Users,
    ShieldCheck,
    ArrowRight,
    BookOpen,
    Briefcase,
    Globe
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const coreValues = [
    {
        icon: Globe,
        title: "Accessibility",
        description: "Breaking economic and geographic barriers to provide world-class career preparation for every student."
    },
    {
        icon: Target,
        title: "Industry Alignment",
        description: "Continuously updating our curriculum to match the rapidly evolving tech landscape and employer needs."
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

export default function MissionPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-white pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-6 border border-orange-100"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                        Our Mission
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight text-brand-black mb-8 leading-[1.05]"
                    >
                        Bridging the <br />
                        <span className="text-brand-orange">Opportunity Gap.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto font-medium"
                    >
                        We founded EMBLE with a simple yet ambitious goal: to ensure that every talented individual has a direct pathway to their dream career, regardless of where they start.
                    </motion.p>
                </div>
            </section>

            {/* The Problem Section */}
            <section className="py-24 border-y border-gray-100 bg-gray-50/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold text-brand-black mb-6">The Campus-Industry Mismatch</h2>
                            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                                <p>
                                    Millions of students graduate every year with strong theoretical knowledge but lack the practical experience required by modern tech companies.
                                </p>
                                <p>
                                    On the other side, companies struggle to find "day-one ready" talent, spending months on training and orientation. This gap results in lost potential for students and wasted resources for employers.
                                </p>
                                <div className="pt-4 flex flex-col gap-4">
                                    <div className="flex items-center gap-3 text-brand-black font-semibold">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-brand-orange">
                                            <Rocket size={18} />
                                        </div>
                                        <span>We exist to fix this disconnect.</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative aspect-square lg:aspect-video rounded-3xl overflow-hidden bg-brand-black shadow-2xl group"
                        >
                            {/* Decorative Grid Overlay */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                                backgroundSize: '24px 24px'
                            }} />
                            <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
                                <div className="space-y-8">
                                    <div className="text-brand-orange text-8xl font-black opacity-10 blur-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">WE2</div>
                                    <h3 className="text-4xl font-extrabold text-white relative z-10 leading-tight">
                                        Empowering the <br />
                                        Next Generation <br />
                                        of Builders.
                                    </h3>
                                    <div className="h-1 w-24 bg-brand-orange mx-auto rounded-full" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* How We Solve It Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-black mb-4">How We Solve It</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">One unified ecosystem, two specialized pathways to career success.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Placement Mode Card */}
                        <motion.div
                            whileHover={{ y: -8 }}
                            className="p-10 rounded-3xl bg-emerald-50/50 border border-emerald-100 group transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white text-emerald-600 flex items-center justify-center border border-emerald-100 mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                <BookOpen size={28} />
                            </div>
                            <h3 className="text-3xl font-bold text-brand-black mb-4">EMBLE <span className="text-emerald-500 font-extrabold">Preparation</span></h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Designed for end-to-end foundation building. We focus on solving the rejection problem with AI Mock Interviews, 200+ Company-Picked questions, DSA/SQL challenges, and AI Resume Auditing to ensure you are technically invincible.
                            </p>
                            <Link href="/pricing" className="inline-flex items-center gap-2 text-emerald-700 font-bold hover:gap-3 transition-all">
                                Explore Preparation Mode <ArrowRight size={18} />
                            </Link>
                        </motion.div>

                        {/* Job Simulation Card */}
                        <motion.div
                            whileHover={{ y: -8 }}
                            className="p-10 rounded-3xl bg-brand-black border border-gray-800 group transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gray-900 text-brand-orange flex items-center justify-center border border-gray-800 mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                <Briefcase size={28} />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-4">EMBLE <span className="text-brand-orange font-extrabold">Simulation</span></h3>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Designed for real-world mastery. Solve the "no experience" problem by joining virtual tech teams, working on JIRA tickets, participating in GitHub residency, and making production-grade deployments.
                            </p>
                            <Link href="/pricing" className="inline-flex items-center gap-2 text-brand-orange font-bold hover:gap-3 transition-all">
                                Explore Job Simulation <ArrowRight size={18} />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl font-bold text-brand-black mb-4">Our Core Values</h2>
                        <p className="text-gray-500">The principles that guide every feature we build.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {coreValues.map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center mb-6">
                                    <value.icon size={22} />
                                </div>
                                <h4 className="text-lg font-bold text-brand-black mb-3">{value.title}</h4>
                                <p className="text-gray-500 font-medium">Preparing students for the &quot;end-to-end&quot; curriculum.</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-white">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="rounded-3xl bg-brand-orange p-12 md:p-20 text-center relative overflow-hidden group">
                        {/* Animated background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
                                Ready to join our <br />
                                mission and launch yours?
                            </h2>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link
                                    href="/register"
                                    className="px-10 py-4 bg-brand-black text-white font-bold rounded-xl hover:bg-gray-900 transition-all shadow-xl hover:scale-105"
                                >
                                    Get Started for Free
                                </Link>
                                <Link
                                    href="/contact"
                                    className="px-10 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20"
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
