'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    Code2,
    Layout,
    Database,
    BrainCircuit,
    Rocket,
    Globe,
    Cpu,
    Cloud,
    ArrowRight,
    ChevronDown,
    Server,
    Briefcase,
    Zap,
    Mic,
    Video,
    FileText,
    Sparkles,
    Newspaper
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const targetCompanies = [
    "Google", "Amazon", "Microsoft", "Meta", "Apple",
    "Netflix", "Goldman Sachs", "Uber", "Adobe", "Flipkart"
];

const unifiedTechStack = [
    { label: "React & Next.js", icon: Globe },
    { label: "Node & NestJS", icon: Server },
    { label: "Docker", icon: Cpu },
    { label: "AWS", icon: Cloud },
    { label: "PostgreSQL", icon: Database },
    { label: "GitHub CI/CD", icon: Rocket },
    { label: "System Design", icon: Layout }
];

const combinedFaqs = [
    {
        q: "What makes Emble India's #1 AI Interview platform?",
        a: "Emble is the only platform offering a dual-mode AI interview simulation experience: Audiotail for immersive voice-only rounds and full AI video simulation interviews that track your body language and confidence in real-time."
    },
    {
        q: "How does the DSA training work?",
        a: "We offer a curated suite of 200+ hand-picked questions that are frequently asked in top companies like Google, Amazon, and Microsoft. Each question comes with an AI-powered hint system and optimal solution walkthroughs."
    },
    {
        q: "What is Snipes?",
        a: "Snipes is our built-in AI intelligence feed that keeps you updated with the latest AI news and industry trends, ensuring you're never out of the loop during technical discussions."
    },
    {
        q: "Tell me more about the SQL training.",
        a: "We've identified the top 50 industry-asked SQL questions and built a dedicated sandbox where you can practice complex queries and database schema designs asked by top employers."
    },
    {
        q: "What is the structure of the overall Bootcamp Curriculum?",
        a: "The curriculum is divided into two major phases: Phase 1 focuses on Placement Mastery (DSA, SQL, AI Interviews), and Phase 2 focuses on Industrial Simulation (building real-word production systems)."
    }
];

// Animation Variants for Performance
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 }
    }
};

function FAQItem({ q, a, idx }: { q: string, a: string, idx: number }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <motion.div
            variants={itemVariants}
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

export default function CurriculumPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-white selection:bg-brand-orange/10 selection:text-brand-orange">
            <Navbar />

            {/* Unified Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-brand-black text-white">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: `radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,87,34,0.15)_0%,rgba(255,255,255,0)_70%)] blur-[80px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-brand-orange text-xs font-bold uppercase tracking-widest mb-6 border border-white/10"
                    >
                        <Zap size={14} className="fill-current" />
                        India's #1 AI Interview Simulation Platform
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl"
                    >
                        Learn Like a Student. <br />
                        <span className="text-brand-orange italic">Build Like a Professional.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-400 max-w-2xl font-medium mb-10 text-balance"
                    >
                        Master the interview with our world-class AI simulations and dominate the job with residential-style industrial projects.
                    </motion.p>
                </div>
            </section>

            {/* Phase 1: Placement Mode */}
            <section id="placement-mode" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={containerVariants}
                        className="text-center mb-16"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold tracking-widest uppercase mb-4">
                            Phase 1: Recruitment Readiness
                        </motion.div>
                        <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-extrabold text-brand-black mb-4 tracking-tight">
                            Placement Accelerator.
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-gray-500 max-w-2xl mx-auto font-medium text-lg">
                            Are you clearing the technical rounds? We bridge the logic gap that video lectures miss, ensuring you're ready for every screening.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
                    >
                        {[
                            {
                                title: "200+ DSA Questions",
                                desc: "Hand-picked problem set covering all patterns asked in top product-based company interviews.",
                                icon: Code2,
                                color: "emerald",
                                badge: "MNC Focused"
                            },
                            {
                                title: "AI Interview Simulation",
                                desc: "Practice with voice and video interviews that give you real-time feedback on your confidence and answers.",
                                icon: Mic,
                                color: "orange",
                                badge: "India's First"
                            },
                            {
                                title: "Top 50 SQL Questions",
                                desc: "Master complex database queries and schema designs asked by top product-based companies.",
                                icon: Database,
                                color: "blue",
                                badge: "Practical"
                            },
                            {
                                title: "Resume & Skills Audit",
                                desc: "Get your profile scanned by AI to ensure it passes through top company filters effortlessly.",
                                icon: FileText,
                                color: "purple",
                                badge: "ATS Optimized"
                            },
                            {
                                title: "Latest AI News",
                                desc: "Stay ahead with a daily feed of the most important AI updates and industry trends.",
                                icon: Newspaper,
                                color: "pink",
                                badge: "Real-time"
                            },
                            {
                                title: "Behavioral & HR Prep",
                                desc: "AI feedback on tone, body language, and salary negotiation strategies.",
                                icon: BrainCircuit,
                                color: "emerald",
                                badge: "Holistic"
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                className="p-8 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group relative overflow-hidden will-change-transform"
                            >
                                <div className="absolute top-4 right-6">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white px-2 py-1 rounded-full">{item.badge}</span>
                                </div>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border transition-transform duration-300 group-hover:scale-105 will-change-transform
                                    ${item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                                    ${item.color === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' : ''}
                                    ${item.color === 'orange' ? 'bg-orange-50 text-orange-600 border-orange-100' : ''}
                                    ${item.color === 'purple' ? 'bg-purple-50 text-purple-600 border-purple-100' : ''}
                                    ${item.color === 'pink' ? 'bg-pink-50 text-pink-600 border-pink-100' : ''}
                                `}>
                                    <item.icon size={24} strokeWidth={2.5} />
                                </div>
                                <h4 className="text-lg font-bold text-brand-black mb-2 leading-tight">{item.title}</h4>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Phase 2: Job Simulation */}
            <section id="job-simulation" className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={containerVariants}
                        className="text-center mb-16"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-bold tracking-widest uppercase mb-4">
                            Phase 2: Industrial Mastery
                        </motion.div>
                        <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-extrabold text-brand-black mb-4 tracking-tight">
                            Industrial Simulation.
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-gray-500 max-w-2xl mx-auto font-medium text-lg">
                            Stop being just another "fresher". Build the industrial proof-of-work that top engineering teams actually respect.
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            variants={containerVariants}
                        >
                            <motion.h3 variants={itemVariants} className="text-3xl font-extrabold text-brand-black mb-8">The 21-Day Industry Sprint</motion.h3>
                            <div className="space-y-8">
                                {[
                                    { title: "Week 1: System Onboarding", desc: "Set up your dev environment, explore the existing microservices architecture, and take your first bug ticket." },
                                    { title: "Week 2: Feature Development", desc: "Write clean, modular code for a major feature. Submit Pull Requests and go through rigorous senior AI code reviews." },
                                    { title: "Week 3: Deployment & Refinement", desc: "Integrate with CI/CD pipelines, handle edge cases, and finalize your work for the production deployment." }
                                ].map((item, idx) => (
                                    <motion.div key={idx} variants={itemVariants} className="flex gap-6 group">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm text-brand-orange flex items-center justify-center font-black text-lg flex-shrink-0 group-hover:scale-110 group-hover:border-brand-orange transition-all">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-brand-black mb-2">{item.title}</h4>
                                            <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            variants={containerVariants}
                            className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100"
                        >
                            <motion.p variants={itemVariants} className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 text-center">Infrastructure You Will Master</motion.p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                                {unifiedTechStack.map((tech, idx) => (
                                    <motion.div key={tech.label} variants={itemVariants} className="flex flex-col items-center gap-3 group cursor-default">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-brand-orange/5 group-hover:border-brand-orange/20 transition-all group-hover:scale-110">
                                            <tech.icon size={28} className="text-gray-400 group-hover:text-brand-orange transition-colors" />
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">{tech.label}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Target Companies */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Targeting Top Tech MNCs</p>
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-500">
                        {targetCompanies.map(company => (
                            <span key={company} className="text-xl font-black text-brand-black">{company}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Unified FAQ Section */}
            <section className="py-24 bg-gray-50/50 border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-brand-black mb-4">Curriculum FAQs</h2>
                        <p className="text-gray-500 font-medium text-lg">Everything you need to know about the unified Bootcamp experience.</p>
                    </div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={containerVariants}
                        className="space-y-2"
                    >
                        {combinedFaqs.map((faq, idx) => (
                            <FAQItem key={idx} q={faq.q} a={faq.a} idx={idx} />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-brand-black">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to start the journey?</h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto font-medium">
                        Stop practicing in isolation. Join Emble and master both the interviews and the engineering realities.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register" className="h-14 px-10 bg-brand-orange text-white font-bold rounded-xl flex items-center gap-2 hover:bg-brand-orange-hover transition-all shadow-xl shadow-brand-orange/20 hover:-translate-y-1">
                            Join the Bootcamp <ArrowRight size={20} />
                        </Link>
                        <Link href="/pricing" className="h-14 px-10 bg-transparent text-white font-bold rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all border border-gray-700">
                            View Pricing Plans
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
