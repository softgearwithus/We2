'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    CreditCard,
    AlertCircle,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const sections = [
    {
        id: "acceptance",
        title: "1. Acceptance of Terms",
        content: "By accessing or using the EMBLE platform (including EMBLE Standard and EMBLE Pro features), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services."
    },
    {
        id: "eligibility",
        title: "2. Eligibility",
        content: "You must be at least 18 years old or have the permission of a parent or legal guardian to use our platform. Our services are primarily designed for students, educators, and industry professionals."
    },
    {
        id: "accounts",
        title: "3. User Accounts",
        content: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. EMBLE reserves the right to suspend or terminate accounts that violate our community guidelines."
    },
    {
        id: "subscriptions",
        title: "4. Subscriptions & Payments",
        content: "Payments for EMBLE Standard and EMBLE Pro are strictly non-refundable under any circumstances. However, users are always welcome to upgrade to a higher-tier plan at any time. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period."
    },
    {
        id: "conduct",
        title: "5. User Conduct",
        content: "Users are expected to maintain professional conduct during industrial simulations. Harassment, plagiarism, or any form of cheating in DSA problems or simulations will result in immediate termination of access without refund."
    },
    {
        id: "ip",
        title: "6. Intellectual Property",
        content: "All content on the EMBLE platform, including curriculum, code simulations, and proprietary tools, is the property of EMBLE and is protected by copyright laws. You may not reproduce or distribute our content without written permission."
    }
];

export default function TermsPage() {
    const [mounted, setMounted] = useState(false);
    const [activeSection, setActiveSection] = useState("acceptance");

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-background text-foreground border-b border-border">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: `radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest mb-6 border border-primary/20"
                        >
                            <Shield size={12} />
                            Platform Governance
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
                        >
                            Terms of <span className="text-primary underline decoration-primary/20 underline-offset-8">Service.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-foreground/70 max-w-2xl font-medium"
                        >
                            Please read these terms carefully. They govern your use of the EMBLE ecosystem and help us maintain a professional, high-impact environment for everyone.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-24 bg-background relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                        {/* Left Sidebar Navigation */}
                        <div className="lg:col-span-4 sticky top-32 hidden lg:block">
                            <div className="p-8 rounded-[40px] bg-card border border-border">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-8 ml-2">Navigation</h5>
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
                                                    ? "bg-foreground text-background shadow-xl"
                                                    : "text-foreground/60 hover:text-foreground hover:bg-secondary"
                                            )}
                                        >
                                            {s.title.split('. ')[1]}
                                            <ChevronRight size={14} className={cn(
                                                "transition-transform",
                                                activeSection === s.id ? "rotate-90 text-background" : "group-hover:translate-x-1"
                                            )} />
                                        </button>
                                    ))}
                                </nav>

                                <div className="mt-12 p-6 rounded-3xl bg-secondary border border-border">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Last Updated</p>
                                    <p className="text-sm font-bold text-foreground">February 12, 2024</p>
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
                                    className="pb-12 border-b border-border last:border-0"
                                >
                                    <h2 className="text-3xl font-black text-foreground mb-6 flex items-center gap-4">
                                        <span className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center text-sm font-black border border-border">
                                            {idx + 1}
                                        </span>
                                        {s.title.split('. ')[1]}
                                    </h2>
                                    <p className="text-lg text-foreground/70 leading-relaxed font-medium">
                                        {s.content}
                                    </p>

                                    {/* Sub-cards for emphasis */}
                                    {idx === 3 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                            <div className="p-6 rounded-3xl bg-card border border-border flex items-start gap-4">
                                                <CreditCard className="text-primary shrink-0" size={20} />
                                                <div>
                                                    <h4 className="font-bold text-foreground text-sm mb-1 text-uppercase tracking-wide">Automatic Renewal</h4>
                                                    <p className="text-xs text-foreground/50">Cancel 24h prior to period end.</p>
                                                </div>
                                            </div>
                                            <div className="p-6 rounded-3xl bg-card border border-border flex items-start gap-4">
                                                <AlertCircle className="text-rose-500 shrink-0" size={20} />
                                                <div>
                                                    <h4 className="font-bold text-foreground text-sm mb-1 text-uppercase tracking-wide">Refund Policy</h4>
                                                    <p className="text-xs text-foreground/50">Strictly no refunds. Plan upgrades only.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Contact Reminder */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="p-12 rounded-[40px] bg-secondary border border-border text-foreground relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                                <h3 className="text-3xl font-black mb-6">Questions about our Terms?</h3>
                                <p className="text-foreground/80 mb-10 text-lg font-medium leading-relaxed">
                                    If you have any questions regarding these terms, your account, or our privacy practices, please reach out to our legal team.
                                </p>
                                <a href="/contact" className="h-14 px-10 bg-foreground text-background font-black rounded-2xl inline-flex items-center gap-3 hover:bg-foreground/90 transition-all shadow-xl shadow-primary/10 hover:scale-105">
                                    Contact Support <ArrowRight size={20} />
                                </a>
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
