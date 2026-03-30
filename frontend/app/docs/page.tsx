'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Book,
    Search,
    ArrowRight,
    Code2,
    Terminal,
    Zap,
    ShieldCheck,
    ExternalLink,
    Files,
    Cpu,
    Briefcase,
    Users,
    ChevronRight,
    PlayCircle
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const categories = [
    {
        title: "Getting Started",
        desc: "Everything you need to know to begin your journey at EMBLE.",
        icon: PlayCircle,
        color: "blue",
        exploreUrl: "/how-it-works",
        links: [
            { label: "Platform Overview", slug: "platform-overview" },
            { label: "Account Setup", slug: "account-setup" },
            { label: "Student Dashboard Guide", slug: "student-dashboard-guide" }
        ]
    },
    {
        title: "Placement Mode: DSA & Interviews",
        desc: "Master the technical interview roadmap and resume building.",
        icon: Code2,
        color: "orange",
        exploreUrl: "/dashboard/preparation",
        links: [
            { label: "DSA Roadmap 2024", slug: "dsa-roadmap-2024" },
            { label: "Resume Lab Instructions", slug: "resume-lab-instructions" },
            { label: "Mock Interview Prep", href: "/dashboard/interviews" }
        ]
    },
    {
        title: "Job Simulation: Simulations",
        desc: "Deep dive into our 21-day industrial simulator workflows.",
        icon: Terminal,
        color: "emerald",
        exploreUrl: "/dashboard/projects",
        links: [
            { label: "Sprint Methodology", slug: "sprint-methodology" },
            { label: "Agile & JIRA Guide", slug: "agile-jira-guide" },
            { label: "Git & GitHub Workflows", href: "/dashboard/github" }
        ]
    },
    {
        title: "Infrastructure & Tools",
        desc: "Technical guides for the tools used in our simulation squads.",
        icon: Cpu,
        color: "purple",
        exploreUrl: "/dashboard/projects",
        links: [
            { label: "Docker & Containers", slug: "docker-containers" },
            { label: "CI/CD Pipelines", href: "/dashboard/projects" },
            { label: "System Observability", href: "/dashboard/projects" }
        ]
    },
    {
        title: "Billing & Subscriptions",
        desc: "Manage your plans, invoices, and enterprise upgrades.",
        icon: ShieldCheck,
        color: "rose",
        exploreUrl: "/pricing",
        links: [
            { label: "Pricing FAQ", href: "/pricing" },
            { label: "Refund Policy", href: "/refund" },
            { label: "Plan Comparisons", href: "/pricing" }
        ]
    },
    {
        title: "Community & Support",
        desc: "Connect with thousands of students and mentors globally.",
        icon: Users,
        color: "indigo",
        exploreUrl: "/about",
        links: [
            { label: "Discord Rules", href: "/contact" },
            { label: "Mentorship Guide", href: "/dashboard/mentors" },
            { label: "Ambassador Program", href: "/careers" }
        ]
    }
];

const popularArticles = [
    { title: "How to complete your first Sprint", views: "12k+" },
    { title: "Optimizing your resume with AI", views: "8.5k+" },
    { title: "Mastering System Design in 30 days", views: "6.2k+" },
    { title: "Understanding the hiring partner network", views: "4.1k+" }
];

export default function DocsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter categories based on search query
    const filteredCategories = categories.map(cat => {
        if (!searchQuery) return cat;

        const query = searchQuery.toLowerCase();
        const matchesCat = cat.title.toLowerCase().includes(query) || cat.desc.toLowerCase().includes(query);

        const matchingLinks = cat.links.filter(link =>
            link.label.toLowerCase().includes(query) ||
            (link.slug && link.slug.toLowerCase().includes(query)) ||
            (link.href && link.href.toLowerCase().includes(query))
        );

        if (matchesCat || matchingLinks.length > 0) {
            return {
                ...cat,
                links: matchingLinks.length > 0 ? matchingLinks : cat.links
            };
        }
        return null;
    }).filter(Boolean) as typeof categories;

    // Mapping popular articles to real slugs
    const popularArticlesMapped = [
        { title: "Sprint Methodology", views: "12k+", slug: "sprint-methodology" },
        { title: "Resume Lab Instructions", views: "8.5k+", slug: "resume-lab-instructions" },
        { title: "DSA Roadmap 2024", views: "6.2k+", slug: "dsa-roadmap-2024" },
        { title: "Pricing FAQ", views: "4.1k+", slug: "pricing-faq" }
    ];

    return (
        <main className="min-h-screen bg-white selection:bg-brand-orange selection:text-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-brand-black text-white">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: `radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-6 border border-white/10"
                        >
                            <Book size={12} />
                            Knowledge Base
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
                        >
                            How can we <span className="text-brand-orange">help you?</span>
                        </motion.h1>

                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="w-full max-w-2xl relative group"
                        >
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search guides, patterns, or system docs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-16 pl-16 pr-6 rounded-2xl bg-white/5 border border-white/10 focus:border-brand-orange focus:bg-white focus:text-brand-black outline-none transition-all text-gray-300 font-medium text-lg shadow-2xl"
                            />
                            <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-gray-500">
                                <span>CMD</span>
                                <span>+</span>
                                <span>K</span>
                            </div>
                        </motion.div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest pt-4">
                        <span>Trending:</span>
                        {['JIRA', 'Resume', 'Docker', 'Interview'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSearchQuery(tag)}
                                className="hover:text-brand-orange transition-colors underline decoration-gray-800 underline-offset-4"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Category Grid */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    {filteredCategories.length === 0 ? (
                        <div className="text-center py-20">
                            <h3 className="text-2xl font-bold text-brand-black mb-2">No guides found</h3>
                            <p className="text-gray-500">Try adjusting your search query, or ask our community on Discord.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCategories.map((cat, idx) => (
                                <motion.div
                                    key={cat.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group p-8 rounded-[40px] bg-gray-50/50 border border-gray-100 hover:border-brand-orange/20 hover:bg-white hover:shadow-2xl hover:shadow-brand-orange/5 transition-all duration-300 flex flex-col"
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform flex-shrink-0 ${cat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                        cat.color === 'orange' ? 'bg-orange-100 text-brand-orange' :
                                            cat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                                cat.color === 'purple' ? 'bg-slate-100 text-slate-800' :
                                                    cat.color === 'rose' ? 'bg-rose-100 text-rose-600' :
                                                        'bg-slate-100 text-slate-800'
                                        }`}>
                                        <cat.icon size={28} />
                                    </div>
                                    <h3 className="text-2xl font-black text-brand-black mb-4">{cat.title}</h3>
                                    <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">{cat.desc}</p>

                                    <ul className="space-y-3 mb-8 flex-1">
                                        {cat.links.map((link, i) => (
                                            <li key={i}>
                                                <Link href={link.href ? link.href : `/docs/${link.slug}`} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-orange transition-colors group/link">
                                                    <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform flex-shrink-0" />
                                                    <span className="truncate">{link.label}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link href={cat.exploreUrl} className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-orange hover:gap-3 transition-all mt-auto pt-4 group/explore">
                                        Explore More <ArrowRight size={14} className="group-hover/explore:translate-x-1 transition-transform" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Popular Articles */}
            <section className="py-24 bg-gray-50/50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row gap-16 items-start">
                        <div className="md:w-1/3">
                            <h2 className="text-3xl font-black text-brand-black mb-4">Popular Guides</h2>
                            <p className="text-gray-500 font-medium leading-relaxed mb-8">
                                These common guides help most of our students crack their first industrial simulation or technical interview.
                            </p>
                            <Link href="/contact" className="h-12 px-6 rounded-xl bg-brand-black text-white font-bold text-sm inline-flex items-center gap-2 hover:bg-brand-black/90 transition-all">
                                Need custom help? <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            {popularArticlesMapped.map((article, idx) => (
                                <Link href={`/docs/${article.slug}`} key={idx}>
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-6 h-full rounded-3xl bg-white border border-gray-100 flex items-center justify-between group hover:border-brand-orange/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-orange-50 group-hover:text-brand-orange flex items-center justify-center transition-colors shrink-0">
                                                <Files size={18} />
                                            </div>
                                            <h5 className="font-bold text-brand-black text-sm pr-4 line-clamp-2">{article.title}</h5>
                                        </div>
                                        <div className="text-[10px] font-black uppercase text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0">
                                            {article.views} reads
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-8 border-4 border-gray-50 rotate-3">
                        <Zap className="text-brand-orange" size={32} fill="currentColor" />
                    </div>
                    <h2 className="text-4xl font-black text-brand-black mb-6">Didn't find what you need?</h2>
                    <p className="text-gray-500 text-lg mb-10 font-medium">
                        Our community members and mentor team are active 24/7 on Discord. Come join the conversation.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="h-14 px-10 bg-brand-orange text-white font-black rounded-2xl flex items-center gap-3 hover:bg-brand-orange-hover transition-all shadow-xl shadow-brand-orange/20">
                            Join Community <ArrowRight size={20} />
                        </button>
                        <Link href="/contact" className="h-14 px-10 bg-transparent text-brand-black font-bold border-2 border-gray-100 rounded-2xl flex items-center gap-2 hover:bg-gray-50 transition-all">
                            Talk to Support
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
