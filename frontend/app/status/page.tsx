'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    CheckCircle2,
    Zap,
    Shield,
    Server,
    Database,
    Globe,
    RefreshCcw,
    ChevronRight,
    ArrowUpRight,
    Terminal
} from 'lucide-react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const services = [
    { name: "Core API", status: "operational", uptime: "99.98%", icon: Server },
    { name: "Database Cluster", status: "operational", uptime: "100%", icon: Database },
    { name: "We2Hub Engine", status: "operational", uptime: "99.95%", icon: Zap },
    { name: "Prep0 AI Mentors", status: "operational", uptime: "99.99%", icon: Activity },
    { name: "Asset CDN", status: "operational", uptime: "100%", icon: Globe },
    { name: "Auth Provider", status: "operational", uptime: "99.99%", icon: Shield },
];

const changelog = [
    {
        date: "February 12, 2024",
        version: "v2.1.0",
        type: "Feature",
        title: "Platform-wide Rebranding & High-Fidelity Resources",
        description: "Successfully transitioned the entire platform to the We2 identity. This update includes the launch of the high-fidelity Documentation Hub, Terms of Service, and Privacy Policy centers.",
        items: [
            "Launched high-fidelity Documentation Hub with dynamic guide navigation.",
            "Implemented brand-consistent Terms of Service and Privacy Policy pages.",
            "Updated all landing pages (Prep0, We2Hub) with premium aesthetics.",
            "System-wide CSS optimization and post-compilation stability fixes."
        ],
        author: "We2 Engineering",
        color: "brand-orange"
    },
    {
        date: "February 11, 2024",
        version: "v2.0.5",
        type: "Improvement",
        title: "Documentation Deep-Linking & Content Expansion",
        description: "Linked the resource ecosystem directly with application features to provide a seamless learning flow for students.",
        items: [
            "Added DSA Roadmap 2024 content to the Documentation Hub.",
            "Integrated deep-links from Problem Dashboard to related study guides.",
            "Optimized markdown rendering for technical architecture diagrams."
        ],
        author: "Product Team",
        color: "blue"
    },
    {
        date: "February 10, 2024",
        version: "v2.0.0",
        type: "Release",
        title: "The We2 Hub Simulation Engine",
        description: "A major overhaul of the industrial simulation engine, providing realistic 21-day sprint cycles for aspirants.",
        items: [
            "New simulation dashboard with real-time PR/Issue tracking simulation.",
            "Enhanced AI mentor response speed by 40%.",
            "Added support for multi-workspace career paths."
        ],
        author: "Core Engine Team",
        color: "emerald"
    },
    {
        date: "February 08, 2024",
        version: "v1.9.8",
        type: "Fix",
        title: "Infrastructure Stability & Build Optimization",
        description: "Resolved critical hydration errors and optimized static asset delivery for lower latency.",
        items: [
            "Fixed Next.js hydration mismatches on complex animation sections.",
            "Improved image loading strategy for landing page heroes.",
            "Condensed font-loading strategy to prevent cumulative layout shift."
        ],
        author: "DevOps",
        color: "purple"
    }
];

export default function StatusPage() {
    const [mounted, setMounted] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1500);
    };

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-white selection:bg-brand-orange selection:text-white">
            <Navbar />

            {/* Header / Hero */}
            <section className="relative pt-32 pb-24 overflow-hidden bg-brand-black text-white">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: `radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                        <div className="max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold uppercase tracking-widest mb-6 border border-emerald-500/20"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                All Systems Operational
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
                            >
                                Platform <span className="text-brand-orange underline decoration-white/20 underline-offset-8">Status.</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-xl text-gray-400 font-medium"
                            >
                                Real-time health monitoring and the latest updates from the We2 engineering team.
                            </motion.p>
                        </div>

                        <motion.button
                            onClick={handleRefresh}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-14 px-8 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 font-bold hover:bg-white/10 transition-all active:scale-95 group"
                        >
                            <RefreshCcw size={18} className={cn(isRefreshing ? "animate-spin text-brand-orange" : "group-hover:rotate-180 transition-transform duration-500")} />
                            {isRefreshing ? "Refreshing..." : "Check for Updates"}
                        </motion.button>
                    </div>

                    {/* Service Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.map((service, idx) => (
                            <motion.div
                                key={service.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + idx * 0.05 }}
                                className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-brand-orange/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-brand-orange group-hover:bg-brand-orange/10 transition-colors">
                                        <service.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">{service.name}</h4>
                                        <p className="text-[10px] uppercase tracking-widest font-black text-emerald-400">Operational</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-1">Uptime</p>
                                    <p className="text-xs font-bold text-white/60">{service.uptime}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Changelog Section (Antigravity Style) */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-6 relative">

                    <div className="flex items-center gap-4 mb-20">
                        <div className="w-12 h-12 rounded-2xl bg-brand-black text-white flex items-center justify-center shadow-xl shadow-brand-orange/20">
                            <Terminal size={24} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-brand-black">Changelog</h2>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Platform Evolution History</p>
                        </div>
                    </div>

                    <div className="relative border-l-2 border-gray-100 ml-6 pl-12 space-y-24">
                        {changelog.map((entry, idx) => (
                            <motion.div
                                key={entry.version}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative"
                            >
                                {/* Timeline Dot */}
                                <div className="absolute -left-[61px] top-2">
                                    <div className={`w-6 h-6 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center`}>
                                        <div className={`w-2 h-2 rounded-full ${entry.type === 'Feature' ? 'bg-brand-orange' :
                                            entry.type === 'Release' ? 'bg-emerald-500' :
                                                entry.type === 'Fix' ? 'bg-purple-500' : 'bg-blue-500'
                                            }`} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="max-w-3xl">
                                    <div className="flex flex-wrap items-center gap-3 mb-6">
                                        <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            {entry.date}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${entry.type === 'Feature' ? 'bg-orange-50 text-brand-orange' :
                                            entry.type === 'Release' ? 'bg-emerald-50 text-emerald-600' :
                                                entry.type === 'Fix' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            <Zap size={10} />
                                            {entry.type}
                                        </span>
                                        <span className="text-xs font-black text-gray-300 tracking-wider">
                                            {entry.version}
                                        </span>
                                    </div>

                                    <h3 className="text-3xl font-black text-brand-black mb-6 hover:text-brand-orange transition-colors cursor-default">
                                        {entry.title}
                                    </h3>

                                    <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8 italic">
                                        "{entry.description}"
                                    </p>

                                    <div className="p-8 rounded-[32px] bg-gray-50 border border-gray-100 group hover:shadow-2xl hover:shadow-brand-orange/5 transition-all">
                                        <ul className="space-y-4">
                                            {entry.items.map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 group/item">
                                                    <div className="mt-1.5 shrink-0 transition-transform group-hover/item:translate-x-1">
                                                        <CheckCircle2 size={16} className="text-brand-orange/40 group-hover/item:text-brand-orange" />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-500 leading-relaxed group-hover/item:text-brand-black transition-colors">
                                                        {item}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-black text-white flex items-center justify-center text-[10px] font-black">
                                                    {entry.author.split(' ')[0][0]}{entry.author.split(' ').slice(-1)[0][0]}
                                                </div>
                                                <span className="text-xs font-bold text-gray-400">Published by <span className="text-brand-black">{entry.author}</span></span>
                                            </div>
                                            <button className="flex items-center gap-1.5 text-xs font-black text-brand-orange opacity-0 group-hover:opacity-100 transition-opacity">
                                                View Source <ArrowUpRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full filter blur-[100px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full filter blur-[100px] -ml-48 -mb-48" />
            </section>

            <Footer />
        </main>
    );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}
