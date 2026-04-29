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

    // Completely hide the component if the user is a premium member or on the pricing page
    const normalizedPlan = (user?.subscriptionPlan || '').toLowerCase();
    const isPremium =
        normalizedPlan === 'pro' ||
        normalizedPlan === 'we2_max' ||
        normalizedPlan.includes('pro') ||
        normalizedPlan === 'placement_plus' ||
        normalizedPlan.includes('standard');
    const isPricingPage = pathname === '/pricing';
    const isHomePage = pathname === '/';

    // The minimized banner should show if the user has dismissed the modal on the home page,
    // OR if they are simply browsing any other page (excluding pricing and if they are not premium).
    const [hasTriggered, setHasTriggered] = useState(false);
    const [showMinimizedBanner, setShowMinimizedBanner] = useState(!isHomePage && !isPremium && !isPricingPage);

    // Update banner visibility immediately when route changes, overriding local state if needed
    useEffect(() => {
        if (!isHomePage && !isPremium && !isPricingPage) {
            setShowMinimizedBanner(true);
            setShowMainModal(false); // Force close modal if navigating away from home
        } else if (isHomePage && !hasTriggered) {
            setShowMinimizedBanner(false);
        }
    }, [pathname, isHomePage, isPremium, isPricingPage, hasTriggered]);


    useEffect(() => {
        // Only run the timer if we are explicitly on the Home Page, not loading, and not premium.
        if (isLoading || isPremium || !isHomePage) {
            return;
        }

        // Only run the modal timer once per session/visit on the home page
        if (!hasTriggered) {
            const timer = setTimeout(() => {
                setShowMainModal(true);
                setHasTriggered(true);
            }, 45000); // 45 seconds on the home page

            return () => clearTimeout(timer);
        }
    }, [isLoading, isPremium, isHomePage, hasTriggered]);

    // If premium or on pricing, render absolutely nothing
    if (isPremium || isPricingPage) return null;

    return (
        <>
            {/* Lightweight Floating Card - Clean Brutalist Style */}
            <AnimatePresence>
                {showMainModal && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] w-[calc(100%-2rem)] sm:w-full max-w-[380px] bg-[#f8f9fa] rounded-xl overflow-hidden border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] will-change-transform"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setShowMainModal(false);
                                setShowMinimizedBanner(true);
                            }}
                            className="absolute top-4 right-4 p-1.5 text-[#202b20]/60 hover:text-[#202b20] hover:bg-black/5 rounded-full transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202b20]"
                        >
                            <X size={16} strokeWidth={3} />
                        </button>

                        <div className="p-6 text-left relative">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-[#ffa116] flex items-center justify-center shrink-0 border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20]">
                                    <Sparkles size={20} className="text-[#202b20]" strokeWidth={3} />
                                </div>
                                <h3 className="text-xl font-black text-[#202b20] tracking-tight leading-tight">
                                    Unlock Premium <br />
                                    <span className="text-[#34d399]">Interview Mode</span>
                                </h3>
                            </div>

                            <p className="text-[#202b20]/80 mb-6 font-medium leading-relaxed text-sm">
                                Upgrade to access unlimited AI mock interviews, advanced analytics, and double your chances of clearing technical rounds.
                            </p>

                            <div className="flex items-center gap-3">
                                <Link
                                    href="/pricing"
                                    onClick={() => setShowMainModal(false)}
                                    className="flex-1 h-12 bg-[#ffa116] text-[#202b20] rounded-xl border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] font-bold flex items-center justify-center gap-2 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-[0.98] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202b20] focus-visible:ring-offset-2"
                                >
                                    Upgrade Now
                                    <ArrowRight size={16} strokeWidth={3} />
                                </Link>

                                <button
                                    onClick={() => {
                                        setShowMainModal(false);
                                        setShowMinimizedBanner(true);
                                    }}
                                    className="px-5 h-12 text-sm font-bold text-[#202b20]/60 hover:text-[#202b20] hover:bg-white border-2 border-transparent hover:border-[#202b20] hover:shadow-[2px_2px_0_0_#202b20] rounded-xl transition-all"
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Minimized Permanent Floating Banner - Clean Brutalist */}
            <AnimatePresence>
                {showMinimizedBanner && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="fixed right-6 bottom-1/4 z-[90] flex items-center group cursor-pointer will-change-transform"
                    >
                        {/* Hidden CTA that expands on hover */}
                        <Link href="/pricing" className="absolute right-0 pr-16 opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                            <div className="bg-[#f8f9fa] px-5 py-3 rounded-l-xl border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] flex items-center gap-2 text-sm font-bold text-[#202b20] whitespace-nowrap">
                                Subscribe Now
                                <ArrowRight size={14} strokeWidth={3} className="text-[#34d399]" />
                            </div>
                        </Link>

                        {/* Core Circular Badge */}
                        <Link
                            href="/pricing"
                            className="relative w-14 h-14 bg-[#ffa116] rounded-xl flex items-center justify-center border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] z-10 transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#202b20]"
                        >
                            <ShieldCheck size={26} className="text-[#202b20] relative z-10" strokeWidth={2.5} />
                            <span className="absolute -top-2 -right-2 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded border-2 border-[#202b20] bg-[#34d399] opacity-75"></span>
                                <span className="relative inline-flex rounded border-2 border-[#202b20] h-4 w-4 bg-[#34d399]"></span>
                            </span>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
