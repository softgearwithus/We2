'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Sparkles } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

interface SubscriptionGuardProps {
    children: React.ReactNode;
    requiredPlan: 'standard' | 'pro';
    featureName?: string;
}

const PLAN_HIERARCHY = {
    'free': 0,
    'standard': 1,
    'pro': 2,
};

const PLAN_NAMES: Record<string, string> = {
    'standard': 'Standard',
    'pro': 'Pro',
};

export default function SubscriptionGuard({ children, requiredPlan, featureName = 'Premium Feature' }: SubscriptionGuardProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="animate-pulse bg-slate-100 h-96 rounded-xl w-full"></div>;
    }

    let userPlan = user?.subscriptionPlan || 'free';
    if (userPlan === 'placement_plus' || userPlan.includes('standard')) userPlan = 'standard';
    if (userPlan === 'we2_max' || userPlan.includes('pro')) userPlan = 'pro';

    const userLevel = PLAN_HIERARCHY[userPlan as keyof typeof PLAN_HIERARCHY] || 0;
    const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 0;

    if (userLevel >= requiredLevel) {
        return <>{children}</>;
    }

    return (
        <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-slate-200">
            {/* Blurred Background Content (Simulated) */}
            <div className="absolute inset-0 filter blur-md opacity-50 bg-slate-50 pointer-events-none select-none overflow-hidden">
                {children}
            </div>

            {/* Glassmorphism Lock Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-slate-200">
                    <Lock size={32} />
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-2">
                    {featureName} is Locked
                </h3>

                <p className="text-slate-600 max-w-md mb-8 font-medium leading-relaxed">
                    This feature requires the <span className="text-slate-800 font-bold">{PLAN_NAMES[requiredPlan]}</span> plan or higher. Upgrade now to unlock full access.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <Link
                        href="/pricing"
                        className="flex-1 bg-gradient-to-r from-brand-orange to-red-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        <Sparkles size={18} />
                        Upgrade Now
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex-1 bg-white text-slate-700 font-bold py-3.5 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center"
                    >
                        Maybe Later
                    </Link>
                </div>

                <p className="mt-6 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Join 10,000+ Students Fast-Tracking Their Careers
                </p>
            </div>
        </div>
    );
}
