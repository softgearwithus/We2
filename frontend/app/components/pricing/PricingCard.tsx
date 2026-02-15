'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useAuth } from '@/app/context/AuthContext';

interface PricingFeature {
    text: string;
    included: boolean;
}

interface PricingCardProps {
    title: string;
    price: string;
    period: string;
    features: PricingFeature[];
    variant?: 'default' | 'popular' | 'premium';
    badgeText?: string;
    ctaText: string;
    onCtaClick?: () => void;
    description: string;
    icon?: React.ReactNode;
    delay?: number;
    savings?: string;
    planId?: string; // e.g., 'placement_plus', 'industry_plus', 'we2_max'
}

export default function PricingCard({
    title,
    price,
    period,
    features,
    variant = 'default',
    badgeText,
    ctaText,
    onCtaClick,
    description,
    icon,
    delay = 0,
    savings,
    planId
}: PricingCardProps) {
    const isPopular = variant === 'popular';
    const isPremium = variant === 'premium';
    const { login, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        if (!planId) {
            if (onCtaClick) onCtaClick();
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                // Redirect to register with plan param if not authenticated
                window.location.href = `/register/student?plan=${planId}`;
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/upgrade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ plan: planId })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                // Update local auth state with new subscription details
                login(token, updatedUser);
                alert(`Successfully upgraded to ${title}!`);
                if (onCtaClick) onCtaClick();
            } else {
                alert('Upgrade failed. Please try again.');
            }
        } catch (error) {
            console.error('Upgrade error:', error);
            alert('An error occurred during upgrade.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay * 0.1 }}
            className={cn(
                "relative flex flex-col p-8 rounded-3xl transition-all duration-300 group h-full bg-white",
                (isPopular || isPremium) && "scale-105 z-10 shadow-2xl",
                isPopular && "border-2 border-indigo-600 shadow-indigo-100",
                isPremium && "border-2 border-purple-500 shadow-purple-200 bg-gradient-to-b from-white to-purple-50/30",
                variant === 'default' && "border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1"
            )}
        >
            {(isPopular || isPremium) && (
                <div className={cn(
                    "absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-1",
                    isPremium ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white ring-4 ring-white" : "bg-indigo-600 text-white"
                )}>
                    {isPremium ? <Sparkles size={12} className="fill-current" /> : <Crown size={12} className="fill-current" />}
                    {badgeText || (isPremium ? "Best Value" : "Most Popular")}
                </div>
            )}

            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                        "p-3 rounded-xl",
                        isPremium ? "bg-purple-100 text-purple-600" : (isPopular ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-600")
                    )}>
                        {icon || <Zap size={24} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                            {title.includes(':') ? (
                                <>
                                    <span className={cn(
                                        isPremium ? "text-purple-600" : "text-brand-orange",
                                        "font-black shadow-sm"
                                    )}>
                                        {title.split(':')[0]}
                                    </span>
                                    <span className="text-slate-400 font-bold text-sm block md:inline md:ml-1 md:text-lg">
                                        <span className="hidden md:inline">:</span> {title.split(':')[1]}
                                    </span>
                                </>
                            ) : title}
                        </h3>
                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed mt-1">{description}</p>
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">{price}</span>
                        <span className="text-slate-500 font-bold">/{period}</span>
                    </div>
                    {savings && (
                        <span className="text-xs font-bold text-emerald-600 mt-1 bg-emerald-50 px-2 py-1 rounded-md w-fit">
                            {savings}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-grow space-y-4 mb-8">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                        <div className={cn(
                            "mt-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full",
                            feature.included
                                ? (isPremium ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600")
                                : "bg-slate-100 text-slate-400"
                        )}>
                            {feature.included ? <Check size={12} strokeWidth={3} /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />}
                        </div>
                        <span className={cn("font-medium", feature.included ? "text-slate-700" : "text-slate-400 line-through decoration-slate-300")}>
                            {feature.text}
                        </span>
                    </div>
                ))}
            </div>

            <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className={cn(
                    "w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2",
                    isPremium
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02]"
                        : (isPopular
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5"
                            : "bg-white text-slate-700 border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-50"),
                    isLoading && "opacity-70 cursor-wait"
                )}
            >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : ctaText}
            </button>
        </motion.div>
    );
}
