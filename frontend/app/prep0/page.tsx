'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    Code2,
    CheckCircle2,
    ArrowRight,
    ChevronDown,
    Layout,
    Database,
    BrainCircuit
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const targetCompanies = [
    "Google", "Amazon", "Microsoft", "Meta", "Apple",
    "Netflix", "Goldman Sachs", "Uber", "Adobe", "Flipkart"
];

const faqs = [
    {
        q: "When should I start preparing for placements using Prep0?",
        a: "We recommend starting at least 3-6 months before your campus recruitment season. This gives you enough time to master DSA fundamentals and polish your resume through multiple AI optimization cycles."
    },
    {
        q: "What technical topics are covered in the Prep0 curriculum?",
        a: "Our curriculum is hyper-focused on what recruiters ask: Data Structures and Algorithms (DSA), System Design, Object-Oriented Programming (OOPS), Database Management Systems (DBMS), and Operating Systems (OS)."
    },
    {
        q: "How does the AI Resume Optimizer work?",
        a: "Prep0 uses advanced LLMs to scan your resume against 50,000+ successful job applications. It identifies keyword gaps, suggests impact-driven phrasing, and ensures your resume is ATS-friendly for top-tier MNCs."
    },
    {
        q: "Is Prep0 suitable for both on-campus and off-campus placements?",
        a: "Absolutely. While on-campus drives often have specific patterns, off-campus interviews at FAANG+ companies require a deeper mastery of problem-solving. Prep0 bridges both needs with specialized modules."
    },
    {
        q: "What programming languages are supported for coding rounds?",
        a: "We provide comprehensive support for Java, C++, Python, and JavaScript. We generally recommend C++ or Java for competitive rounds, but our AI mentors are equipped to guide you in all major languages."
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

export default function Prep0Page() {
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
                <div className="absolute inset-0 bg-emerald-50/30 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 text-emerald-700 text-[11px] font-bold uppercase tracking-widest mb-6 border border-emerald-200"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Placement Readiness Platform
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight text-brand-black mb-6 leading-tight"
                        >
                            Master the Basics. <br />
                            <span className="text-emerald-600 italic">Ace the Selection.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-500 max-w-2xl font-medium mb-10"
                        >
                            The complete gateway to your first software engineering role. We combine structured learning with AI-driven interview coaching to make you job-ready.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Link href="/register" className="h-14 px-10 rounded-xl bg-brand-black text-white font-bold flex items-center gap-3 hover:bg-gray-900 transition-all shadow-xl hover:scale-105">
                                Start Free Assessment <ArrowRight size={20} />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Company Logo Cloud */}
            <section className="py-12 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Targeting Top Tech MNCs</p>
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-500">
                        {targetCompanies.map(company => (
                            <span key={company} className="text-xl font-black text-brand-black">{company}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* End-to-End Curriculum */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-brand-black mb-4 tracking-tight">
                            The Full-Stack <span className="text-emerald-600">Placement Engine.</span>
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto font-medium">
                            We don't just stop at coding. Prep0 covers every dimension of the modern engineering interview.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: "Data Structures & Algorithms",
                                desc: "From arrays to advanced dynamic programming. 500+ curated problems.",
                                icon: Code2,
                                color: "emerald"
                            },
                            {
                                title: "System Design (HLD & LLD)",
                                desc: "Master scalability, load balancing, and architectural patterns used at FAANG.",
                                icon: Layout,
                                color: "blue"
                            },
                            {
                                title: "CS Fundamentals",
                                desc: "Deep dives into Operating Systems, DBMS (SQL/NoSQL), and Computer Networks.",
                                icon: Database,
                                color: "orange"
                            },
                            {
                                title: "Behavioral & HR Prep",
                                desc: "Mock behavioral rounds, salary negotiation, and company-specific culture prep.",
                                icon: BrainCircuit,
                                color: "purple"
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 rounded-3xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border transition-transform group-hover:scale-110
                                    ${item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                                    ${item.color === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' : ''}
                                    ${item.color === 'orange' ? 'bg-orange-50 text-orange-600 border-orange-100' : ''}
                                    ${item.color === 'purple' ? 'bg-purple-50 text-purple-600 border-purple-100' : ''}
                                `}>
                                    <item.icon size={24} />
                                </div>
                                <h4 className="text-lg font-bold text-brand-black mb-2 leading-tight">{item.title}</h4>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Breakdown */}
            <section className="py-24 bg-gray-50/50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 border border-emerald-100">
                                <Target size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-brand-black mb-3">Company-Specific Paths</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Curated prep journeys for 100+ top companies including Google, Amazon, and leading Indian unicorns.
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center mb-6 border border-orange-100">
                                <BrainCircuit size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-brand-black mb-3">AI Interviewer</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Practice mock technical and behavioral rounds with an AI that provides granular feedback on your tone and logic.
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 border border-blue-100">
                                <Layout size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-brand-black mb-3">ATS Resume Lab</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Real-time resume auditing. Our AI helps you craft descriptions that pass through the strictest HR screens.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-brand-black mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-500 font-medium italic">Everything you need to know about starting your career with Prep0.</p>
                    </div>

                    <div className="space-y-2">
                        {faqs.map((faq, idx) => (
                            <FAQItem key={idx} q={faq.q} a={faq.a} idx={idx} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-emerald-600 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-black mb-6">Don't leave your career to chance.</h2>
                    <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto font-medium">
                        Join 5,000+ students from top IITs and NITs who used Prep0 to land their dream offers.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register" className="h-14 px-8 bg-white text-emerald-700 font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-xl">
                            Register Now <ArrowRight size={20} />
                        </Link>
                        <Link href="/pricing" className="h-14 px-8 bg-emerald-700/50 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-all border border-emerald-500">
                            View Pricing Plans
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
