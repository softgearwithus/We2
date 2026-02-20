'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    Lock,
    Eye,
    Database,
    ChevronRight,
    HardDrive,
    Cookie
} from 'lucide-react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const sections = [
    {
        id: "collection",
        title: "1. Information We Collect",
        content: "We collect information you provide directly to us (name, email, profile details), academic data from your DSA progress, and technical data about your industrial simulation performance. This helps us tailor your learning experience."
    },
    {
        id: "usage",
        title: "2. How We Use Data",
        content: "Your data is used to personalize your curriculum, track your progress in Emble Simulations, provide AI-assisted insights in Emble Bootcamp, and improve our platform's overall efficiency. We do not sell your personal data to third parties."
    },
    {
        id: "sharing",
        title: "3. Data Sharing",
        content: "We share your data only with essential service providers like Supabase (secure database) and Razorpay (secure payments). In industrial simulations, anonymized performance metrics may be shared with hiring partners if you've opted into the placement program."
    },
    {
        id: "security",
        title: "4. Data Security",
        content: "We implement industry-standard security measures, including end-to-end encryption for sensitive data and regular security audits. Your account is protected by multi-factor authentication options to ensure your learning history remains private."
    },
    {
        id: "rights",
        title: "5. Your Privacy Rights",
        content: "You have the right to access, export, or delete your personal data at any time. You can manage these settings through your student dashboard or by contacting our privacy team directly."
    },
    {
        id: "cookies",
        title: "6. Cookies & Tracking",
        content: "We use essential cookies to maintain your session and preference-based cookies to remember your workspace configuration. You can manage your cookie preferences through your browser settings."
    }
];

export default function PrivacyPage() {
    const [mounted, setMounted] = useState(false);
    const [activeSection, setActiveSection] = useState("collection");

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

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
                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-6 border border-white/10"
                        >
                            <Lock size={12} />
                            Data Sovereignty
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
                        >
                            Privacy at <span className="text-brand-orange underline decoration-white/20 underline-offset-8">Emble.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-400 max-w-2xl font-medium"
                        >
                            Transparency is the core of our platform. Learn how we protect your data while powering your industrial learning journey.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                        {/* Left Sidebar Navigation */}
                        <div className="lg:col-span-4 sticky top-32 hidden lg:block">
                            <div className="p-8 rounded-[40px] bg-gray-50 border border-gray-100">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 ml-2">Data Sections</h5>
                                <nav className="space-y-2">
                                    {sections.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => {
                                                setActiveSection(s.id);
                                                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between p-4 rounded-2xl text-sm font-bold transition-all group",
                                                activeSection === s.id
                                                    ? "bg-brand-black text-white shadow-xl"
                                                    : "text-gray-400 hover:text-brand-black hover:bg-white"
                                            )}
                                        >
                                            {s.title.split('. ')[1]}
                                            <ChevronRight size={14} className={cn(
                                                "transition-transform",
                                                activeSection === s.id ? "rotate-90 text-brand-orange" : "group-hover:translate-x-1"
                                            )} />
                                        </button>
                                    ))}
                                </nav>

                                <div className="mt-12 p-6 rounded-3xl bg-brand-orange/5 border border-brand-orange/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-2">GDPR Compliant</p>
                                    <p className="text-sm font-bold text-brand-black flex items-center gap-2">
                                        <Shield size={16} className="text-brand-orange" />
                                        Verified Security
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Content Area */}
                        <div className="lg:col-span-8 space-y-16">
                            {sections.map((s, idx) => (
                                <motion.div
                                    id={s.id}
                                    key={s.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="pb-12 border-b border-gray-100 last:border-0"
                                >
                                    <h2 className="text-3xl font-black text-brand-black mb-6 flex items-center gap-4">
                                        <span className="w-10 h-10 rounded-xl bg-gray-50 text-brand-orange flex items-center justify-center text-sm font-black border border-gray-100">
                                            {idx + 1}
                                        </span>
                                        {s.title.split('. ')[1]}
                                    </h2>
                                    <p className="text-lg text-gray-500 leading-relaxed font-medium">
                                        {s.content}
                                    </p>

                                    {/* Data Visualization Cards */}
                                    {idx === 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                                            {[
                                                { icon: Eye, label: "Identity Data", desc: "Name, Email, Profile" },
                                                { icon: Database, label: "Academic Data", desc: "DSA Progress, Scores" },
                                                { icon: HardDrive, label: "Technical Data", desc: "Simulation Logs" }
                                            ].map((item, i) => (
                                                <div key={i} className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                                                    <item.icon className="text-brand-orange mb-4" size={20} />
                                                    <h4 className="font-bold text-brand-black text-sm mb-1">{item.label}</h4>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-black">{item.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {idx === 5 && (
                                        <div className="mt-8 p-6 rounded-3xl bg-brand-black text-white flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                                <Cookie className="text-brand-orange" size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold mb-1">Essential Cookies Only</h4>
                                                <p className="text-sm text-gray-400">We prioritize your performance and security over marketing trackers.</p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Privacy Team Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="p-12 rounded-[40px] bg-brand-orange text-white relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                                <h3 className="text-3xl font-black mb-6">Manage Your Data</h3>
                                <p className="text-white/80 mb-10 text-lg font-medium leading-relaxed">
                                    Want to export your learning history or delete your account? You can do it all from your dashboard settings, or reach out to our team.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <a href="/dashboard/settings" className="h-14 px-10 bg-brand-black text-white font-black rounded-2xl inline-flex items-center gap-3 hover:scale-105 transition-all">
                                        Go to Settings <ChevronRight size={20} />
                                    </a>
                                    <a href="/contact" className="h-14 px-10 bg-white/10 text-white font-black rounded-2xl inline-flex items-center gap-3 border border-white/20 hover:bg-white/20 transition-all">
                                        Contact Privacy Team
                                    </a>
                                </div>
                            </motion.div>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}
