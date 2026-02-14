'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    Code2,
    Zap,
    ArrowRight,
    ChevronDown,
    Terminal,
    Rocket,
    Globe,
    Cpu,
    Cloud
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const techStack = [
    { label: "Docker", icon: Cpu },
    { label: "Kubernetes", icon: Globe },
    { label: "AWS", icon: Cloud },
    { label: "JIRA", icon: Briefcase },
    { label: "Slack", icon: Zap },
    { label: "GitHub", icon: Terminal },
    { label: "Jenkins", icon: Rocket }
];

const faqs = [
    {
        q: "What exactly is an industry simulation at We2Hub?",
        a: "It's a high-fidelity recreation of a real tech company environment. You're assigned to a virtual squad, given a project in a professional repository, and expected to ship features via PRs, participate in stand-ups, and handle JIRA tickets."
    },
    {
        q: "Does We2Hub experience count as professional experience on my resume?",
        a: "Yes. While it's a simulation, the workflow and challenges are identical to a real software engineering internship. We provide a 'Simulation Completion Certificate' and a portfolio of production-grade code that you can showcase to recruiters."
    },
    {
        q: "How long is the We2Hub program and what's the commitment?",
        a: "Our core sprint is 21 days. We recommend 2-4 hours of commitment daily, mimicking the pace of a real software development lifecycle (SDLC). It's intensive, immersive, and designed to make you 'Day-1 Ready'."
    },
    {
        q: "What specific engineering skills will I learn?",
        a: "Beyond coding, you'll master Git/GitHub workflows (branching, merging, rebase), CI/CD pipelines, containerization with Docker, system observability, and professional code review etiquette."
    },
    {
        q: "Is there mentorship available if I get stuck on a ticket?",
        a: "Yes. You'll have access to AI-powered Tech Leads who can review your logic 24/7, plus weekly office hours with industry senior engineers from companies like Amazon and Uber who provide architectural guidance."
    }
];

function FAQItem({ q, a, idx }: { q: string, a: string, idx: number }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="border-b border-gray-100 last:border-0"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className="text-lg font-bold text-brand-black group-hover:text-brand-orange transition-colors">{q}</span>
                <ChevronDown className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={20} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-gray-500 leading-relaxed max-w-3xl">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function We2HubPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-brand-black text-white">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: `radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-6 border border-white/10"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                            Industrial Simulation Hub
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
                        >
                            Experience the Real World. <br />
                            <span className="text-brand-orange italic">Ship Production Code.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-400 max-w-2xl font-medium mb-10"
                        >
                            The bridge between learning and leading. Join virtual tech teams, participate in professional workflows, and become job-ready in weeks, not years.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Link href="/register" className="h-14 px-10 rounded-xl bg-brand-orange text-white font-bold flex items-center gap-3 hover:bg-brand-orange-hover transition-all shadow-xl shadow-brand-orange/20 hover:scale-105">
                                Enter the Simulation <ArrowRight size={20} />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Tech Stack Grid */}
            <section className="py-16 bg-gray-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10">Infrastructure We Speak</p>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-8 items-center">
                        {techStack.map(tech => (
                            <div key={tech.label} className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity group cursor-default">
                                <tech.icon size={28} className="text-brand-black group-hover:text-brand-orange transition-colors" />
                                <span className="text-[10px] font-bold text-brand-black uppercase tracking-widest">{tech.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Simulation Narrative */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl font-extrabold text-brand-black mb-8">The 21-Day Sprint.</h2>
                            <div className="space-y-6">
                                {[
                                    { title: "Week 1: System Onboarding", desc: "Set up your dev environment, explore the existing codebase, and take your first JIRA bug ticket." },
                                    { title: "Week 2: Feature Development", desc: "Write clean, modular code for a major feature. Submit PRs and go through rigorous code reviews." },
                                    { title: "Week 3: Deployment & Review", desc: "Integrate with CI/CD pipelines, handle edge cases, and finalize your work for the production demo." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-6">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center font-bold flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-brand-black mb-1">{item.title}</h4>
                                            <p className="text-gray-500 text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl relative border border-gray-800"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange/20 to-transparent pointer-events-none" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Code2 size={80} className="text-brand-orange opacity-10 animate-pulse" />
                            </div>
                            <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                                <p className="text-sm font-medium italic text-gray-300">
                                    &quot;I learned more about real Git workflows in 2 weeks at We2Hub than in 4 years of college.&quot;
                                </p>
                                <p className="text-xs font-bold text-brand-orange mt-2">&mdash; Sneha R., Software Engineer at Microsoft</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-gray-50/50">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-brand-black mb-4">Common Questions</h2>
                        <p className="text-gray-500 font-medium italic">Everything you should know about the We2Hub simulation experience.</p>
                    </div>

                    <div className="space-y-2">
                        {faqs.map((faq, idx) => (
                            <FAQItem key={idx} q={faq.q} a={faq.a} idx={idx} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-brand-black">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-black text-white mb-6">Ready to ship production code?</h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto font-medium">
                        Stop practicing in isolation. Join a tech team today and fast-track your path to seniority.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register" className="h-14 px-8 bg-brand-orange text-white font-bold rounded-xl flex items-center gap-2 hover:bg-brand-orange-hover transition-all shadow-xl shadow-brand-orange/20">
                            Apply for Next Batch <ArrowRight size={20} />
                        </Link>
                        <Link href="/how-it-works" className="h-14 px-8 bg-transparent text-white font-bold rounded-xl flex items-center gap-2 hover:bg-white/5 transition-all border border-gray-700">
                            Learn the Methodology
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
