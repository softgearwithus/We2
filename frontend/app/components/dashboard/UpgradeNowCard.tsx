import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function UpgradeNowCard() {
    return (
        <div className="relative bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] p-8 lg:p-10 mb-8 w-full group transition-all duration-200 hover:-translate-y-1 hover:shadow-[3px_3px_0_0_#202b20]">
            <div className="relative z-10 flex flex-col xl:flex-row items-center gap-10 justify-between">
                
                {/* Left Text Content */}
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ffa116] text-[#202b20] text-xs font-[800] uppercase tracking-widest border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20]">
                        <Zap size={14} className="animate-pulse" />
                        Unlock Pro Access
                    </div>

                    <h2 className="text-3xl lg:text-4xl font-[800] text-[#202b20] tracking-tight leading-[1.2]">
                        Plans that pay for <br className="hidden md:block" />
                        <span className="text-[#ffa116] underline decoration-4 decoration-[#ffa116]/30 underline-offset-4 inline-block mt-1">themselves.</span>
                    </h2>

                    <p className="text-[#202b20]/70 text-base md:text-lg leading-relaxed max-w-2xl font-medium">
                        You're currently on the free plan. Upgrade to EMBLE Pro for serious preparation. Track your skills, get priority MNC access, and practice with unlimited AI simulations.
                    </p>

                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            'Full-Stack Web Projects',
                            'Company-Specific DSA & SQL',
                            '15 AI Interactive Interviews',
                            'Automated ATS Resume Scans',
                            'Verified Skill Scorecard',
                            'Direct MNC Hiring Network'
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <CheckCircle2 size={18} className="text-[#202b20] shrink-0" />
                                <span className="text-sm font-[700] text-[#202b20]">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Call to Action */}
                <div className="flex-shrink-0 w-full xl:w-72 flex flex-col items-center xl:items-end xl:pl-8 border-t-2 xl:border-t-0 xl:border-l-2 border-[#202b20]/10 pt-8 xl:pt-0">
                    <Link
                        href="/pricing"
                        className="w-full flex justify-center items-center gap-3 px-8 py-4 bg-[#ffa116] text-[#202b20] font-[800] border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] hover:bg-[#ff9100] transition-all duration-200 active:translate-y-[2px] active:shadow-none hover:-translate-y-1 group/btn"
                    >
                        <Sparkles size={18} />
                        <span className="text-lg uppercase tracking-wide">Upgrade Now</span>
                        <ArrowRight size={18} className="transform group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                    <p className="text-center xl:text-right text-xs text-[#202b20]/60 font-[800] mt-4 uppercase tracking-widest">
                        Invest in your career today
                    </p>
                </div>

            </div>
        </div>
    );
}
