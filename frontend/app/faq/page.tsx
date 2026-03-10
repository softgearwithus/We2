'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, ArrowRight, Zap, Target, BookOpen, Briefcase } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const FAQ_CATEGORIES = [
    { id: 'general', label: 'General', icon: Target },
    { id: 'preparation', label: 'Preparation Mode', icon: BookOpen },
    { id: 'simulation', label: 'Job Simulation', icon: Briefcase },
    { id: 'billing', label: 'Billing & Plans', icon: Zap },
];

const FAQS = [
    {
        id: 'g1',
        category: 'general',
        question: 'What is EMBLE?',
        answer: 'EMBLE is an advanced career placement and job simulation platform designed to bridge the gap between academic learning and industry requirements. We help students master their skills through targeted preparation mode and real-world job simulations.'
    },
    {
        id: 'g2',
        category: 'general',
        question: 'Who is this platform for?',
        answer: 'EMBLE is built primarily for college students, fresh graduates, and early-career software engineers who are looking to crack high-paying tech jobs. We also serve colleges looking to improve placement metrics, and companies looking to hire pre-vetted talent.'
    },
    {
        id: 'g3',
        category: 'general',
        question: 'How do I reach out if I have an issue?',
        answer: 'You can reach out to our support team 24/7 by visiting the Contact page, or by joining our Discord community where our team and thousands of other students are active.'
    },
    {
        id: 'p1',
        category: 'preparation',
        question: 'What does the Preparation Mode include?',
        answer: 'Preparation mode includes hundreds of company-specific DSA & SQL questions, Interactive AI Voice Interviews, unlimited AI Video Mock Interviews, and an AI-powered Resume Builder that checks ATS compatibility.'
    },
    {
        id: 'p2',
        category: 'preparation',
        question: 'How accurate are the AI Mock Interviews?',
        answer: 'Our AI Mock interviews are engineered to simulate the actual pressure and question patterns of top product-based companies. They follow up on your answers dynamically, grade you on multiple axes (communication, correctness, optimal complexity), and provide actionable feedback.'
    },
    {
        id: 's1',
        category: 'simulation',
        question: 'How do Job Simulations work?',
        answer: 'Job simulations place you in a virtual corporate environment. You are assigned Jira tickets, required to review PRs on GitHub, write production-grade code, and deploy. It mimics exactly what you would do in your first 3 months as an SDE-1.'
    },
    {
        id: 's2',
        category: 'simulation',
        question: 'Can I put Job Simulations on my Resume?',
        answer: 'Absolutely. Employers value practical experience over theoretical knowledge. The projects you build and the workflows you learn during the simulations serve as excellent talking points in your real interviews to prove you are "Day-1 Ready".'
    },
    {
        id: 'b1',
        category: 'billing',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major Credit/Debit cards, UPI (GPay, PhonePe, Paytm), Net Banking, and Wallet payments via our secure Razorpay integration.'
    },
    {
        id: 'b2',
        category: 'billing',
        question: 'Can I upgrade from Standard to Pro later?',
        answer: 'Yes, you can upgrade your plan at any time from your account settings. The remaining duration of your current plan will be pro-rated against the new plan cost.'
    },
    {
        id: 'b3',
        category: 'billing',
        question: 'What is the refund policy?',
        answer: 'We offer a no-questions-asked 3-day refund policy. If you feel the platform isn\'t right for you within the first 3 days of purchase, please contact support for a full refund.'
    }
];

export default function FAQPage() {
    const [mounted, setMounted] = useState(false);
    const [activeCategory, setActiveCategory] = useState('general');
    const [openItem, setOpenItem] = useState<string | null>('g1');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const filteredFAQs = FAQS.filter(faq => faq.category === activeCategory);

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white pointer-events-none" />
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-6 border border-brand-orange/20"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                        Help Center
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-extrabold tracking-tight text-brand-black mb-6"
                    >
                        How can we <span className="text-brand-orange italic">help?</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-gray-500 font-medium"
                    >
                        Everything you need to know about the product and billing.
                    </motion.p>
                </div>
            </section>

            <section className="py-12 pb-24 relative">
                <div className="max-w-4xl mx-auto px-6">
                    {/* Categories */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
                        {FAQ_CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setActiveCategory(cat.id);
                                        // Auto-open first item of new category
                                        const firstOfCat = FAQS.find(f => f.category === cat.id);
                                        if (firstOfCat) setOpenItem(firstOfCat.id);
                                    }}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${isActive
                                            ? 'bg-brand-black text-white shadow-xl'
                                            : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={16} className={isActive ? "text-brand-orange" : "text-gray-400"} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* FAQ Items */}
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredFAQs.map((faq, idx) => {
                                const isOpen = openItem === faq.id;
                                return (
                                    <motion.div
                                        key={faq.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                                        className={`rounded-3xl border transition-all duration-300 overflow-hidden ${isOpen
                                                ? 'bg-white border-brand-orange/20 shadow-xl shadow-brand-orange/5'
                                                : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                                            }`}
                                    >
                                        <button
                                            onClick={() => setOpenItem(isOpen ? null : faq.id)}
                                            className="w-full flex items-center justify-between p-6 md:p-8 text-left outline-none"
                                        >
                                            <span className={`text-lg font-bold pr-8 ${isOpen ? 'text-brand-orange' : 'text-brand-black'}`}>
                                                {faq.question}
                                            </span>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'bg-orange-50 text-brand-orange rotate-180' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                <ChevronDown size={18} />
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                >
                                                    <div className="px-6 md:px-8 pb-8 text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                                                        {faq.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Still have questions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16 p-8 md:p-10 rounded-[32px] bg-brand-black text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                                <MessageCircle className="text-brand-orange" size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
                                <p className="text-gray-400 font-medium">Can't find the answer you're looking for?</p>
                            </div>
                        </div>
                        <Link
                            href="/contact"
                            className="w-full md:w-auto px-8 py-4 bg-brand-orange text-white font-bold rounded-xl hover:bg-brand-orange-hover transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-orange/20 hover:scale-105"
                        >
                            Contact Support <ArrowRight size={18} />
                        </Link>
                    </motion.div>

                </div>
            </section>

            <Footer />
        </main>
    );
}
