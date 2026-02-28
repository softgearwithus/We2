'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PricingFeature {
    text: string;
    included: boolean;
}

interface PricingCardProps {
    title: string;
    price: string;
    originalPrice?: string;
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
    isUpgradeLocked?: boolean;
}

export default function PricingCard({
    title,
    price,
    originalPrice,
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
    planId,
    isUpgradeLocked = false
}: PricingCardProps) {
    const isPopular = variant === 'popular';
    const isPremium = variant === 'premium';
    const { login, updateUser, user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    let computedCtaText = isUpgradeLocked ? 'Upgrades Paused' : ctaText;
    let computedIsLocked = isUpgradeLocked;

    if (user && user.subscriptionPlan && user.subscriptionPlan !== 'free' && user.subscriptionEndDate && planId && !isUpgradeLocked) {
        const remainingMs = new Date(user.subscriptionEndDate).getTime() - Date.now();
        const remainingDays = remainingMs / (1000 * 60 * 60 * 24);

        let planDurationDays = 0;
        if (planId.includes('1m')) planDurationDays = 30;
        else if (planId.includes('3m')) planDurationDays = 90;
        else if (planId.includes('6m')) planDurationDays = 180;
        else if (planId.includes('12m')) planDurationDays = 365;

        // Infer their current plan tier based on remaining days plus a small renewal grace window (5 days)
        let activeDurationTierDays = 0;
        if (remainingDays > 185) activeDurationTierDays = 365;
        else if (remainingDays > 95) activeDurationTierDays = 180;
        else if (remainingDays > 35) activeDurationTierDays = 90;
        else if (remainingDays > 5) activeDurationTierDays = 30;

        const isUserPro = user.subscriptionPlan === 'we2_max' || user.subscriptionPlan.includes('pro');
        const isCardPro = planId.includes('pro');
        const isUserStandard = user.subscriptionPlan === 'placement_plus' || user.subscriptionPlan.includes('standard');
        const isCardStandard = planId.includes('standard');

        if (isUserPro && isCardStandard) {
            computedIsLocked = true;
            computedCtaText = 'Higher Tier Active';
        } else if ((isUserPro && isCardPro) || (isUserStandard && isCardStandard)) {
            if (planDurationDays <= activeDurationTierDays) {
                computedIsLocked = true;
                computedCtaText = planDurationDays === activeDurationTierDays ? 'Current Plan Active' : 'Downgrade Unavailable';
            } else if (activeDurationTierDays > 0) {
                computedCtaText = 'Upgrade Duration';
            }
        } else if (isUserStandard && isCardPro) {
            computedCtaText = 'Upgrade to Pro';
        }
    }

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (typeof window !== 'undefined' && window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async () => {
        if (computedIsLocked) {
            return;
        }
        if (!planId) {
            if (onCtaClick) onCtaClick();
            return;
        }

        setIsLoading(true);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            if (!token) {
                // Redirect to register with plan param if not authenticated
                window.location.href = `/register/student?plan=${planId}`;
                return;
            }

            const res = await loadRazorpayScript();
            if (!res) {
                alert('Razorpay SDK failed to load. Are you online?');
                setIsLoading(false);
                return;
            }

            const amountInPaise = parseInt(price.replace(/[^0-9]/g, '')) * 100; // in paise

            const options: any = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SI6zIPLAXQkeMw', // Using provided test key
                amount: amountInPaise,
                currency: 'INR',
                name: 'EMBLE',
                description: `Upgrade to ${title}`,
                // Note: In a production app, order_id must be generated on the backend and passed here.
                handler: async function (response: any) {
                    try {
                        const upgradeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/upgrade`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ plan: planId, paymentId: response.razorpay_payment_id })
                        });

                        if (upgradeResponse.ok) {
                            const updatedUser = await upgradeResponse.json();
                            // Update local auth state with new subscription details
                            updateUser(updatedUser);
                            alert(`Successfully upgraded to ${title}!`);
                            if (onCtaClick) onCtaClick();
                            router.push('/dashboard');
                        } else {
                            const errorText = await upgradeResponse.text();
                            console.error('Upgrade failed:', upgradeResponse.status, errorText);
                            alert(`Payment successful, but upgrade failed: ${upgradeResponse.status} ${upgradeResponse.statusText}. Please contact support.`);
                        }
                    } catch (err) {
                        console.error('Upgrade error after payment:', err);
                        alert('Upgrade error after payment. Please contact support.');
                    } finally {
                        setIsLoading(false);
                    }
                },
                prefill: {
                    name: user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : 'Student',
                    email: user?.email || '',
                },
                theme: {
                    color: '#059669', // Emerald color for EMBLE
                },
                modal: {
                    ondismiss: function () {
                        setIsLoading(false);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Upgrade error:', error);
            alert('An error occurred during upgrade. Please check console for details.');
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
                (isPopular || isPremium) && "scale-105 z-10 shadow-2xl ring-1 ring-black/5",
                isPopular && "border-2 border-indigo-600 shadow-indigo-100",
                isPremium && "border-2 border-brand-orange shadow-orange-100 bg-gradient-to-b from-white to-orange-50/20",
                variant === 'default' && "border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1"
            )}
        >
            {(isPopular || isPremium) && (
                <div className={cn(
                    "absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-1",
                    isPremium ? "bg-gradient-to-r from-brand-orange to-amber-500 text-white ring-4 ring-white" : "bg-indigo-600 text-white"
                )}>
                    {isPremium ? <Crown size={12} className="fill-current" /> : <Sparkles size={12} className="fill-current" />}
                    {badgeText || (isPremium ? "Best Choice" : "Most Popular")}
                </div>
            )}

            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                        "p-3 rounded-xl",
                        isPremium ? "bg-orange-100 text-brand-orange" : (isPopular ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-600")
                    )}>
                        {icon || <Zap size={24} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                            {title}
                        </h3>
                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed mt-1">{description}</p>
                    </div>
                </div>

                <div className="flex flex-col mt-4">
                    {originalPrice && (
                        <span className="text-slate-400 font-bold line-through text-lg decoration-slate-300 decoration-2 -mb-1">{originalPrice}</span>
                    )}
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">{price}</span>
                        <span className={cn("font-bold", period === 'month' || period === 'year' ? "text-slate-500" : "text-slate-600 tracking-tight")}>
                            /{period}
                        </span>
                    </div>
                    {savings && (
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit">
                                {savings}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-grow space-y-4 mb-8">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                        <div className={cn(
                            "mt-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full shrink-0",
                            feature.included
                                ? (isPremium ? "bg-orange-100 text-brand-orange" : "bg-indigo-50 text-indigo-600")
                                : "bg-slate-100 text-slate-400"
                        )}>
                            {feature.included ? <Check size={12} strokeWidth={3} /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />}
                        </div>
                        <span className={cn(
                            "font-medium flex-1",
                            feature.included ? "text-slate-700" : "text-slate-400 line-through decoration-slate-300"
                        )}>
                            {feature.text}
                        </span>
                    </div>
                ))}
            </div>

            <button
                onClick={handleUpgrade}
                disabled={isLoading || computedIsLocked}
                className={cn(
                    "w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2",
                    isPremium
                        ? "bg-gradient-to-r from-brand-orange to-amber-600 text-white shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.02]"
                        : (isPopular
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5"
                            : "bg-white text-slate-700 border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-50"),
                    isLoading && "opacity-70 cursor-wait",
                    computedIsLocked && "opacity-60 cursor-not-allowed"
                )}
            >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : computedCtaText}
            </button>
        </motion.div>
    );
}
