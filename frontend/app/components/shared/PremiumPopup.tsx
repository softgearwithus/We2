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
            {/* Lightweight Floating Card */}
            <AnimatePresence>
                {showMainModal && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] w-[calc(100%-2rem)] sm:w-full max-w-[380px] bg-card rounded-[24px] overflow-hidden shadow-2xl border border-border will-change-transform"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setShowMainModal(false);
                                setShowMinimizedBanner(true);
                            }}
                            className="absolute top-4 right-4 p-1.5 text-foreground/50 hover:text-foreground hover:bg-secondary rounded-full transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#556B2F]"
                        >
                            <X size={16} />
                        </button>

                        <div className="p-6 text-left bg-card relative">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#556B2F]/10 flex items-center justify-center shrink-0 border border-[#556B2F]/20">
                                    <Sparkles size={20} className="text-[#556B2F]" />
                                </div>
                                <h3 className="text-xl font-black text-foreground tracking-tight leading-tight">
                                    Unlock Premium <br />
                                    <span className="text-[#556B2F]">Interview Mode</span>
                                </h3>
                            </div>

                            <p className="text-foreground/70 mb-6 font-medium leading-relaxed text-sm">
                                Upgrade to access unlimited AI mock interviews, advanced analytics, and double your chances of clearing technical rounds.
                            </p>

                            <div className="flex items-center gap-3">
                                <Link
                                    href="/pricing"
                                    onClick={() => setShowMainModal(false)}
                                    className="flex-1 h-12 bg-[#556B2F] hover:bg-[#4b5e29] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#556B2F] focus-visible:ring-offset-2"
                                >
                                    Upgrade Now
                                    <ArrowRight size={16} />
                                </Link>

                                <button
                                    onClick={() => {
                                        setShowMainModal(false);
                                        setShowMinimizedBanner(true);
                                    }}
                                    className="px-5 h-12 text-sm font-bold text-foreground/50 hover:text-foreground hover:bg-secondary bg-transparent rounded-xl transition-colors"
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Minimized Permanent Floating Banner - Simplified Animation */}
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
                        <Link href="/pricing" className="absolute right-0 pr-16 opacity-0 group-hover:opacity-100 group-hover:-translate-x-4 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                            <div className="bg-card px-5 py-3 rounded-l-2xl shadow-xl border border-border border-r-0 flex items-center gap-2 text-sm font-bold text-foreground whitespace-nowrap">
                                Subscribe Now
                                <ArrowRight size={14} className="text-[#556B2F]" />
                            </div>
                        </Link>

                        {/* Core Circular Badge */}
                        <Link
                            href="/pricing"
                            className="relative w-14 h-14 bg-card rounded-[18px] flex items-center justify-center shadow-2xl border border-border z-10 hover:scale-110 transition-transform duration-300"
                        >
                            <div className="absolute inset-0 bg-[#556B2F]/20 rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity blur-md -z-10"></div>
                            <ShieldCheck size={24} className="text-[#556B2F] relative z-10" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#556B2F] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#556B2F]"></span>
                            </span>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
