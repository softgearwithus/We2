'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    ArrowUpRight,
    Quote,
    Trophy,
    ArrowRight,
    Target
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const stats = [
    { label: "Total Placements", value: "12,000+", icon: Target, color: "emerald" },
    { label: "Highest CTC", value: "₹54 LPA", icon: Trophy, color: "orange" },
    { label: "Avg. Salary Hike", value: "85%", icon: ArrowUpRight, color: "blue" },
    { label: "Hiring Partners", value: "450+", icon: Briefcase, color: "purple" }
];

const successStories = [
    {
        name: "Abhishek Kumar",
        role: "Software Engineer",
        company: "Google",
        previous: "Final Year Student",
        path: "Prep0",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop",
        quote: "The mock interviews on Prep0 were incredibly realistic. I converted my internship at Google into a full-time role thanks to the system design modules.",
        tags: ["FAANG", "DSA Intensive"],
        hike: "New Grad"
    },
    {
        name: "Priya Sharma",
        role: "Frontend Lead",
        company: "Zomato",
        previous: "Junior Developer",
        path: "We2Hub",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop",
        quote: "We2Hub's 21-day simulation taught me more about professional Git workflows and JIRA than my previous job did in a year.",
        tags: ["Product Based", "Simulation"],
        hike: "120% Hike"
    },
    {
        name: "Rohan Das",
        role: "Systems Engineer",
        company: "Microsoft",
        previous: "Tier-3 College Student",
        path: "Prep0",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop",
        quote: "Coming from a tier-3 college, I always felt the gap. Prep0 gave me the same level of preparation as IITians. I landed Microsoft off-campus!",
        tags: ["MNC", "Off-Campus"],
        hike: "MAANG"
    },
    {
        name: "Sneha Reddy",
        role: "Backend Dev",
        company: "Uber",
        previous: "Non-CS Background",
        path: "We2Hub",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&auto=format&fit=crop",
        quote: "Transitioning from Civil to IT was scary. The end-to-end curriculum on DBMS and OS made me feel confident in technical rounds.",
        tags: ["Transition", "Backend"],
        hike: "Career Switch"
    },
    {
        name: "Amit Patel",
        role: "DevOps Engineer",
        company: "Adobe",
        previous: "Support Engineer",
        path: "We2Hub",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&auto=format&fit=crop",
        quote: "The infrastructure simulation at We2Hub, specifically the Kubernetes modules, was exactly what Adobe was looking for in my technical round.",
        tags: ["Infrastructure", "Simulation"],
        hike: "90% Hike"
    },
    {
        name: "Vikram Malhotra",
        role: "SDE-II",
        company: "Amazon",
        previous: "QA Engineer",
        path: "Prep0",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop",
        quote: "The DSA roadmap is unmatched. I finally broke through the mid-level barrier and landed a senior role at Amazon.",
        tags: ["Promotion", "Amazon"],
        hike: "SDE-2"
    }
];

function StoryCard({ story, idx }: { story: typeof successStories[0], idx: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-white rounded-3xl border border-gray-100 p-8 hover:border-brand-orange/20 hover:shadow-2xl hover:shadow-brand-orange/5 transition-all duration-300"
        >
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-gray-50 group-hover:ring-brand-orange/10 transition-all">
                        <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-brand-black">{story.name}</h4>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">{story.company}</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                    {story.hike}
                </div>
            </div>

            <div className="relative mb-8">
                <Quote className="absolute -top-4 -left-2 text-brand-orange/10 w-12 h-12" />
                <p className="text-gray-600 text-[15px] leading-relaxed relative z-10 italic">
                    "{story.quote}"
                </p>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                <div className="flex gap-2">
                    {story.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded-md">
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-orange">
                    {story.path} <ArrowRight size={14} />
                </div>
            </div>
        </motion.div>
    );
}

export default function StoriesPage() {
    const [mounted, setMounted] = useState(false);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const filteredStories = filter === 'All'
        ? successStories
        : successStories.filter(s => s.path === filter || s.tags.includes(filter));

    return (
        <main className="min-h-screen bg-white selection:bg-brand-orange selection:text-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-white pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-6 border border-brand-orange/20"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                            Proof of Impact
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight text-brand-black mb-6 leading-tight"
                        >
                            Real Stories. <br />
                            <span className="text-brand-orange italic underline decoration-brand-orange/20">Real Success.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-500 font-medium"
                        >
                            From tier-3 colleges to global tech giants. Meet the builders who transformed their careers with We2.
                        </motion.p>
                    </div>

                    {/* Stats Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                                className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-brand-orange/30 transition-all"
                            >
                                <div className={`w-10 h-10 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${stat.color === 'emerald' ? 'group-hover:text-emerald-500 group-hover:bg-emerald-50' :
                                    stat.color === 'orange' ? 'group-hover:text-brand-orange group-hover:bg-orange-50' :
                                        stat.color === 'blue' ? 'group-hover:text-blue-500 group-hover:bg-blue-50' :
                                            'group-hover:text-purple-500 group-hover:bg-purple-50'
                                    }`}>
                                    <stat.icon size={20} />
                                </div>
                                <div className="text-2xl font-black text-brand-black mb-1">{stat.value}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="py-12 border-y border-gray-100 sticky top-16 bg-white/80 backdrop-blur-md z-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {['All', 'Prep0', 'We2Hub', 'FAANG', 'MNC', 'Transition'].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setFilter(tag)}
                                className={cn(
                                    "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                                    filter === tag
                                        ? "bg-brand-black text-white shadow-xl shadow-gray-200"
                                        : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-brand-black"
                                )}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stories Grid */}
            <section className="py-24 bg-gray-50/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredStories.map((story, idx) => (
                                <StoryCard key={story.name} story={story} idx={idx} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-brand-black text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-orange via-purple-500 to-emerald-500" />
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl font-black mb-8">Ready to write your own Story?</h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                        The same platform, the same mentors, and the same curriculum that helped these students are ready for you.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/register" className="h-14 px-10 bg-brand-orange text-white font-bold rounded-2xl flex items-center gap-3 hover:bg-brand-orange-hover transition-all shadow-xl shadow-brand-orange/20 hover:scale-105">
                            Start Your Journey <ArrowRight size={20} />
                        </Link>
                        <Link href="/pricing" className="text-white font-bold hover:text-brand-orange transition-colors flex items-center gap-2 group">
                            Explore All Plans <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
