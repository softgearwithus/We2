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
    const isPremium = user?.subscriptionPlan === 'standard_tier' || user?.subscriptionPlan === 'pro_tier';
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
                        className="fixed bottom-6 right-6 z-[100] w-[calc(100%-3rem)] max-w-[360px] bg-white rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 will-change-transform"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setShowMainModal(false);
                                setShowMinimizedBanner(true);
                            }}
                            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-10"
                        >
                            <X size={16} />
                        </button>

                        <div className="p-6 text-left bg-white relative">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                    <Sparkles size={18} className="text-brand-orange" />
                                </div>
                                <h3 className="text-lg font-black text-brand-black tracking-tight leading-tight">
                                    Unlock Premium <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-purple-600">Placement Mode</span>
                                </h3>
                            </div>

                            <p className="text-gray-500 mb-5 font-medium leading-relaxed text-[13px]">
                                Upgrade to experience the complete Full Stack Bootcamp and double your chances of clearing technical rounds with AI mock interviews.
                            </p>

                            <div className="flex items-center gap-3">
                                <Link
                                    href="/pricing"
                                    onClick={() => setShowMainModal(false)}
                                    className="flex-1 h-10 bg-brand-black hover:bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-sm"
                                >
                                    Upgrade Now
                                    <ArrowRight size={16} />
                                </Link>

                                <button
                                    onClick={() => {
                                        setShowMainModal(false);
                                        setShowMinimizedBanner(true);
                                    }}
                                    className="px-4 h-10 text-sm font-bold text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
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

