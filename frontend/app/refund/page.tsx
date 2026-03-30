'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    ArrowUpCircle,
    AlertTriangle,
    ChevronRight,
    ArrowRight,
    ShieldAlert
} from 'lucide-react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const sections = [
    {
        id: "no-refunds",
        title: "1. Strictly No Refunds",
        content: "EMBLE operates on a strict no-refund policy. Payments made for EMBLE Standard, EMBLE Pro, or any other premium plans or services are entirely non-refundable under all circumstances, including but not limited to partial usage, change of mind, or accidental purchase."
    },
    {
        id: "upgrades",
        title: "2. Plan Upgrades",
        content: "While refunds are not permitted, we encourage users to scale their learning. You can upgrade to a higher-tier plan (e.g., from Standard to Pro, or Monthly to Yearly) at any time. When upgrading, your payment will be prorated based on the unused portion of your current active billing cycle."
    },
    {
        id: "cancellations",
        title: "3. Subscription Cancellations",
        content: "You may cancel your auto-renewal at any time through your dashboard settings. Cancelling your subscription simply ensures you will not be billed for the next billing cycle. You will continue to have access to your premium features until your current pre-paid billing period expires."
    },
    {
        id: "exceptions",
        title: "4. No Exceptions",
        content: "To maintain fairness and consistency for all members, EMBLE support and administrative staff cannot make exceptions to this no-refund policy for any reason. Please ensure you are fully committed to your purchase before completing the checkout process."
    }
];

export default function RefundPage() {
    const [activeSection, setActiveSection] = useState("no-refunds");

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
                            <CreditCard size={12} />
                            Billing Policies
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
                        >
                            Refund <span className="text-brand-orange underline decoration-white/20 underline-offset-8">Policy.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-400 max-w-2xl font-medium"
                        >
                            Clear and straightforward rules regarding payments, upgrades, and cancellations to ensure fairness across our platform.
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
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 ml-2">Navigation</h5>
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
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-2">Upgrade Friendly</p>
                                    <p className="text-sm font-bold text-brand-black flex items-center gap-2">
                                        <ArrowUpCircle size={16} className="text-brand-orange" />
                                        Scale Anytime
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                            <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 flex items-start gap-4">
                                                <ShieldAlert className="text-rose-500 shrink-0" size={20} />
                                                <div>
                                                    <h4 className="font-bold text-rose-900 text-sm mb-1 text-uppercase tracking-wide">Final Sales</h4>
                                                    <p className="text-xs text-rose-700">All purchases are final and non-reversible.</p>
                                                </div>
                                            </div>
                                            <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
                                                <ArrowUpCircle className="text-emerald-500 shrink-0" size={20} />
                                                <div>
                                                    <h4 className="font-bold text-emerald-900 text-sm mb-1 text-uppercase tracking-wide">Upgrades Permitted</h4>
                                                    <p className="text-xs text-emerald-700">You may switch to a higher plan prorated.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {idx === 2 && (
                                        <div className="mt-8 p-6 rounded-3xl bg-brand-black text-white flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                                <AlertTriangle className="text-brand-orange" size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold mb-1">Cancellation != Refund</h4>
                                                <p className="text-sm text-gray-400">Cancelling merely stops the next cycle's charge. You keep access until the cycle finishes.</p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Upgrade Reminder */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="p-12 rounded-[40px] bg-brand-black text-white relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                                <h3 className="text-3xl font-black mb-6">Ready to scale up?</h3>
                                <p className="text-gray-400 mb-10 text-lg font-medium leading-relaxed">
                                    If you want more interview credits or advanced technical simulations, you can easily switch your current plan to a higher tier directly in your dashboard.
                                </p>
                                <a href="/student/billing" className="h-14 px-10 bg-brand-orange text-white font-black rounded-2xl inline-flex items-center gap-3 hover:bg-brand-orange-hover transition-all shadow-xl shadow-brand-orange/20 hover:scale-105">
                                    Manage Subscription <ArrowRight size={20} />
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
