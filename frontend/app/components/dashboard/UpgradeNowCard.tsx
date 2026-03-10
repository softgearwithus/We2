import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function UpgradeNowCard() {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-premium border border-gray-200 mb-8 w-full group transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(249,115,22,0.15)] hover:-translate-y-1">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/80 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-all duration-700 group-hover:bg-orange-100/60"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-brand-orange text-xs font-bold uppercase tracking-widest border border-orange-100">
                        <Zap size={14} className="animate-pulse" />
                        Unlock Pro Access
                    </div>

                    <h2 className="text-3xl md:text-4xl font-extrabold text-brand-black tracking-tight leading-tight">
                        Plans that pay for <span className="text-brand-orange">themselves.</span>
                    </h2>

                    <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-xl font-medium">
                        You're currently on the free plan. Upgrade to EMBLE Pro for serious preparation. Track your skills, get priority MNC access, and practice with unlimited AI simulations.
                    </p>

                    <ul className="flex flex-wrap gap-4 pt-2">
                        {['15 AI Voice Interviews/mo', 'Verified Skill Scorecard', 'Direct MNC Hiring Network', '24/7 Priority Support'].map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <CheckCircle2 size={16} className="text-emerald-500" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex-shrink-0 w-full md:w-auto">
                    <Link
                        href="/pricing"
                        className="inline-flex justify-center items-center gap-3 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-brand-orange to-orange-500 hover:from-orange-500 hover:to-brand-orange text-white font-bold rounded-2xl shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 transition-all duration-300 relative group/btn overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                        <Sparkles size={18} className="relative z-10" />
                        <span className="relative z-10 text-lg">Upgrade to Pro</span>
                        <ArrowRight size={18} className="relative z-10 transform group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                    <p className="text-center text-xs text-gray-500 font-bold mt-3 uppercase tracking-wider">
                        Invest in your career today
                    </p>
                </div>
            </div>
        </div>
    );
}
