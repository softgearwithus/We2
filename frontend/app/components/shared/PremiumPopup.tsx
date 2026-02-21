'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { cn } from '@/app/lib/utils';

export default function PremiumPopup() {
    const { user, isLoading } = useAuth();
    const pathname = usePathname();
    const [showMainModal, setShowMainModal] = useState(false);
    const [showMinimizedBanner, setShowMinimizedBanner] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    // Completely hide the component if the user is a premium member.
    // Also, don't show it if the user is already on the pricing page.
    const isPremium = user?.subscriptionPlan === 'standard_tier' || user?.subscriptionPlan === 'pro_tier';
    const isPricingPage = pathname === '/pricing';

    useEffect(() => {
        // If they are premium, loading, or on the pricing page, reset and don't run the timer.
        if (isLoading || isPremium || isPricingPage) {
            setShowMainModal(false);
            setShowMinimizedBanner(false);
            return;
        }

        // Only run the timer once per session/visit
        if (!hasTriggered) {
            const timer = setTimeout(() => {
                setShowMainModal(true);
                setHasTriggered(true);
            }, 45000); // 45 seconds

            return () => clearTimeout(timer);
        }
    }, [isLoading, isPremium, isPricingPage, hasTriggered]);

    // If premium or on pricing, render absolutely nothing
    if (isPremium || isPricingPage) return null;

    return (
        <>
            {/* Global Main Overlay Modal */}
            <AnimatePresence>
                {showMainModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
                            onClick={() => {
                                setShowMainModal(false);
                                setShowMinimizedBanner(true);
                            }}
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    setShowMainModal(false);
                                    setShowMinimizedBanner(true);
                                }}
                                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-10"
                            >
                                <X size={20} />
                            </button>

                            {/* Decorative Header Banner */}
                            <div className="h-32 bg-gradient-to-br from-brand-orange via-orange-500 to-purple-600 relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <Sparkles className="text-white w-12 h-12 opacity-90 drop-shadow-lg" />
                            </div>

                            <div className="p-8 text-center bg-white relative">
                                {/* Badge */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-5 py-2 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Premium Access Required</span>
                                </div>

                                <h2 className="text-3xl font-black text-brand-black mb-3 tracking-tight mt-4">
                                    Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-purple-600">Placement-Ready</span> Faster.
                                </h2>

                                <p className="text-gray-500 mb-6 font-medium leading-relaxed px-2 text-sm">
                                    You're exploring the free version. Upgrade to experience the complete Full Stack Bootcamp and double your chances of clearing technical rounds.
                                </p>

                                {/* Catchy Data-Driven Feature List */}
                                <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-100">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-[20px] filled-icon">terminal</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-brand-black block">Master the Fundamentals</span>
                                                <span className="text-xs text-gray-500">Build a rock-solid foundation with curated DSA & SQL patterns.</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-[20px] filled-icon">mic</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-brand-black block">Eliminate Interview Anxiety</span>
                                                <span className="text-xs text-gray-500">Practice actual tech rounds with real-time AI feedback.</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-[20px] filled-icon">rocket_launch</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-brand-black block">Build Real-World Systems</span>
                                                <span className="text-xs text-gray-500">Move beyond tutorials. Deploy scalable, industry-standard code.</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-[20px] filled-icon">verified</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-brand-black block">Unlock Hiring Networks</span>
                                                <span className="text-xs text-gray-500">Showcase your verified 'Proof of Work' directly to recruiters.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Link
                                        href="/pricing"
                                        onClick={() => setShowMainModal(false)}
                                        className="w-full h-14 bg-brand-black hover:bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl hover:-translate-y-1 hover:shadow-brand-orange/20 active:scale-[0.98]"
                                    >
                                        Unlock Full Access Now
                                        <ArrowRight size={18} />
                                    </Link>

                                    <button
                                        onClick={() => {
                                            setShowMainModal(false);
                                            setShowMinimizedBanner(true);
                                        }}
                                        className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors py-2"
                                    >
                                        Maybe later, let me explore first
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Minimized Permanent Floating Banner */}
            <AnimatePresence>
                {showMinimizedBanner && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="fixed right-6 bottom-1/4 z-[90] flex items-center group cursor-pointer"
                    >
                        {/* Hidden CTA that expands on hover */}
                        <Link href="/pricing" className="absolute right-0 pr-16 opacity-0 group-hover:opacity-100 group-hover:-translate-x-4 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                            <div className="bg-white px-4 py-2.5 rounded-l-xl shadow-lg border border-gray-100 border-r-0 flex items-center gap-2 text-sm font-bold text-brand-black whitespace-nowrap">
                                Subscribe Now
                                <ArrowRight size={14} className="text-brand-orange" />
                            </div>
                        </Link>

                        {/* Core Circular Badge */}
                        <Link
                            href="/pricing"
                            className="relative w-14 h-14 bg-brand-black rounded-full flex items-center justify-center shadow-2xl border-4 border-white z-10 hover:scale-110 transition-transform duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-md -z-10"></div>
                            <ShieldCheck size={24} className="text-white relative z-10" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-orange"></span>
                            </span>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

