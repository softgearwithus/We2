import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function UpgradeNowCard() {
    return (
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-white to-orange-50/30 p-8 lg:p-10 border border-orange-100 shadow-[0_8px_30px_-12px_rgba(249,115,22,0.15)] mb-8 w-full group transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(249,115,22,0.2)] hover:-translate-y-1">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-orange/20 to-orange-400/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-all duration-700 group-hover:bg-brand-orange/25"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col xl:flex-row items-center gap-10 justify-between">
                
                {/* Left Text Content */}
                <div className="flex-1 space-y-5">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-brand-orange text-[10px] font-extrabold uppercase tracking-[0.2em] border border-orange-200/60 shadow-sm backdrop-blur-md">
                        <Zap size={14} className="animate-pulse" />
                        Unlock Pro Access
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                        Plans that pay for <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-orange-500">themselves.</span>
                    </h2>

                    <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-2xl font-medium">
                        You're currently on the free plan. Upgrade to EMBLE Pro for serious preparation. Track your skills, get priority MNC access, and practice with unlimited AI simulations.
                    </p>

                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            'Full-Stack Web Projects',
                            'Company-Specific DSA & SQL',
                            '15 AI Interactive Interviews',
                            'Automated ATS Resume Scans',
                            'Verified Skill Scorecard',
                            'Direct MNC Hiring Network'
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Call to Action */}
                <div className="flex-shrink-0 w-full xl:w-72 flex flex-col items-center xl:items-end xl:pl-8 border-t xl:border-t-0 xl:border-l border-slate-200/50 pt-8 xl:pt-0">
                    <Link
                        href="/pricing"
                        className="w-full flex justify-center items-center gap-3 px-8 py-4 bg-brand-orange hover:bg-orange-600 text-white font-extrabold rounded-2xl shadow-[0_10px_30px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(249,115,22,0.6)] transition-all duration-300 relative group/btn overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                        <Sparkles size={18} className="relative z-10" />
                        <span className="relative z-10 text-lg">Upgrade Now</span>
                        <ArrowRight size={18} className="relative z-10 transform group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                    <p className="text-center xl:text-right text-[11px] text-slate-400 font-extrabold mt-4 uppercase tracking-[0.15em]">
                        Invest in your career today
                    </p>
                </div>

            </div>
        </div>
    );
}
