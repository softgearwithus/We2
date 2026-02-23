'use client';

import Link from 'next/link';
import { Lock, Sparkles } from 'lucide-react';

type UsageUpgradeGateProps = {
    title?: string;
    message?: string;
    ctaLabel?: string;
};

export default function UsageUpgradeGate({
    title = 'Free plan limit reached',
    message = 'Upgrade to continue your practice and unlock all features.',
    ctaLabel = 'View Pricing',
}: UsageUpgradeGateProps) {
    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/90 backdrop-blur-sm">
            <div className="text-center max-w-md px-6">
                <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200">
                    <Lock size={26} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 mb-6">{message}</p>
                <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-orange text-white font-bold shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 hover:-translate-y-0.5 transition-all"
                >
                    <Sparkles size={16} /> {ctaLabel}
                </Link>
            </div>
        </div>
    );
}
