'use client';


import { Target, Code2, Briefcase, Trophy, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const steps = [
    {
        icon: Target,
        title: "Master the Core Loop",
        desc: "Build a rock-solid algorithmic foundation. You'll master the exact DSA patterns, Graph traversal, and Complex SQL queries that MNCs use to filter 90% of candidates.",
        features: ["FAANG Pattern Mapping", "Complex SQL Optimization", "Time/Space Complexity Audit"],
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
        shadow: "shadow-blue-500/10",
        gradient: "from-blue-500 to-slate-600"
    },
    {
        icon: Code2,
        title: "Build Production Systems",
        desc: "Stop watching simple tutorials. You'll build and scale actual React/Node applications, manage cloud deployments, and collaborate using professional Git workflows.",
        features: ["Microservices Architecture", "Vercel/AWS Deployment", "API Rate Limiting"],
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-100",
        shadow: "shadow-orange-500/10",
        gradient: "from-orange-500 to-red-600"
    },
    {
        icon: Briefcase,
        title: "Survive the AI Grilling",
        desc: "Subject yourself to real pressure. Face our aggressive AI interviewers designed to probe your system design decisions and test your behavioral resilience.",
        features: ["System Design Pressure Tests", "Behavioral Logic Checks", "Immediate Feedback Loops"],
        color: "brand-orange-600",
        bg: "bg-slate-50",
        border: "border-slate-100",
        shadow: "shadow-slate-500/10",
        gradient: "from-slate-500 to-pink-600"
    },
    {
        icon: Trophy,
        title: "Secure the Offer",
        desc: "Walk in with undeniable proof of competence. We attach your verified Skill Scorecard directly to your applications, bypassing the standard resume black hole.",
        features: ["Verified Technical Score", "Cryptographic Proof of Work", "Direct Partner Referrals"],
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-100",
        shadow: "shadow-green-500/10",
        gradient: "from-green-500 to-emerald-600"
    },
];

export default function ProcessTimeline() {
    return (
        <section className="py-10 md:py-24 relative bg-gray-50 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none transform-gpu hidden md:block">
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-full max-w-full max-w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-100/10 via-slate-100/5 to-transparent opacity-30 transform-gpu"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
                    <span className="text-brand-orange font-bold text-[11px] uppercase tracking-[0.2em] bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-100 inline-block mb-4 md:mb-8 shadow-sm">
                        The Emble journey
                    </span>
                    <h2 className="text-5xl md:text-7xl font-[1000] text-brand-black tracking-tighter mb-8 leading-[0.95] drop-shadow-sm">
                        From Campus to <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-slate-600">Corporate in 4 Steps.</span>
                    </h2>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed">
                        Everything from preparation to industrial simulation, synchronized in one flow.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) - Static */}
                    <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-slate-200 z-0">
                        <div className="h-full bg-gradient-to-r from-blue-300 via-orange-300 to-slate-400 w-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                        {steps.map((step, i) => (
                            <div key={i}>
                                <div className="flex flex-col items-center group h-full">
                                    {/* Icon Container with Halo */}
                                    <div className="relative mb-4 md:mb-8 transform-gpu will-change-transform">
                                        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-500 transform-gpu will-change-opacity`} style={{ filter: 'blur(15px)' }}></div>
                                        <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 transform-gpu`}>
                                            <div className={`p-4 rounded-2xl ${step.bg}`}>
                                                <step.icon size={32} className={step.color} strokeWidth={2.5} />
                                            </div>
                                            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-brand-black border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white z-10">
                                                {i + 1}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Glass Card */}
                                    <div className={`
                                        flex-1 w-full bg-white/60 backdrop-blur-xl border border-white/60 p-6 md:p-8 rounded-[2rem]
                                        hover:bg-white/80 hover:border-white hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] 
                                        transition-all duration-500 flex flex-col items-start text-left relative overflow-hidden group/card
                                        md:min-h-[380px]
                                    `}>
                                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${step.gradient} opacity-0 group-hover/card:opacity-100 transition-opacity duration-500`}></div>

                                        <h3 className="text-2xl font-[900] text-gray-900 mb-3 tracking-tight leading-none group-hover/card:text-transparent group-hover/card:bg-clip-text group-hover/card:bg-gradient-to-r group-hover/card:from-gray-900 group-hover/card:to-gray-700 transition-all">
                                            {step.title}
                                        </h3>
                                        <p className="text-gray-500 font-medium leading-relaxed text-[15px] mb-8">
                                            {step.desc}
                                        </p>

                                        <div className="space-y-3 mt-auto w-full">
                                            {step.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-3 group/item">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${step.bg} ring-1 ring-inset ${step.border} group-hover/item:scale-125 transition-transform bg-current ${step.color}`}></div>
                                                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider group-hover/item:text-gray-900 transition-colors">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Connector */}
                                {i !== steps.length - 1 && (
                                    <div className="md:hidden flex flex-col items-center py-2">
                                        <div className="w-0.5 h-6 bg-gradient-to-b from-slate-200 to-transparent"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-10 md:mt-20 flex justify-center">
                    <Link href="/curriculum" className="group flex items-center gap-3 px-8 py-4 md:px-10 md:py-5 bg-brand-black text-white rounded-full font-bold text-base md:text-lg transition-all md:hover:pr-12 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] hover:-translate-y-1 active:scale-95">
                        Explore Full Curriculum
                        <ChevronRight className="transition-transform group-hover:translate-x-2" size={20} strokeWidth={3} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
