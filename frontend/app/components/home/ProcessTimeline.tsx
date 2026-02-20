'use client';

import { motion } from 'framer-motion';
import { Target, Code2, Briefcase, Trophy, ChevronRight, CheckCircle2 } from 'lucide-react';

const steps = [
    {
        icon: Target,
        title: "Skill Diagnostics",
        desc: "We analyze your baseline logic and technical proficiency through adaptive testing.",
        features: ["Logic Assessment", "Coding Baseline", "Comm Skills Analysis"],
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
        shadow: "shadow-blue-500/10",
        gradient: "from-blue-500 to-indigo-600"
    },
    {
        icon: Code2,
        title: "Bootcamp: Mastery",
        desc: "Comprehensive training suite to clear every screening round with precise focus.",
        features: [
            "DSA & SQL Training",
            "AI Video Interviews",
            "ATS Resume Builder",
            "200+ Company-Picked Ques"
        ],
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-100",
        shadow: "shadow-orange-500/10",
        gradient: "from-orange-500 to-red-600"
    },
    {
        icon: Briefcase,
        title: "Simulation: Industry",
        desc: "Step into industry-grade work modules. Ship production features on real tickets.",
        features: ["Virtual Experience", "Real JIRA Tickets", "Senior Dev AI Reviews", "Git Mastery"],
        color: "text-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-100",
        shadow: "shadow-purple-500/10",
        gradient: "from-purple-500 to-pink-600"
    },
    {
        icon: Trophy,
        title: "Career Launch",
        desc: "One engineering profile with verified proof of work for top tech recruiters.",
        features: ["Verified Work History", "Skill Scorecard", "Direct Interview Invites", "Alumni Network"],
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-100",
        shadow: "shadow-green-500/10",
        gradient: "from-green-500 to-emerald-600"
    },
];

export default function ProcessTimeline() {
    return (
        <section className="py-32 relative overflow-hidden bg-slate-50/50">
            {/* Ambient Halo Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-100/40 via-purple-100/20 to-transparent blur-[100px] opacity-70"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent blur-[80px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-24">
                    <span className="text-brand-orange font-bold text-[11px] uppercase tracking-[0.2em] bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-100 inline-block mb-8 shadow-sm">
                        The Emble Journey
                    </span>
                    <h2 className="text-5xl md:text-7xl font-[1000] text-brand-black tracking-tighter mb-8 leading-[0.95] drop-shadow-sm">
                        From Campus to <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-purple-600">Corporate in 4 Steps.</span>
                    </h2>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed">
                        Everything from preparation to industrial simulation, synchronized in one flow.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[3px] bg-gradient-to-r from-blue-200 via-orange-200 to-purple-200 rounded-full z-0"></div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{ delay: i * 0.08, duration: 0.5 }}
                            >
                                <div className="flex flex-col items-center group h-full">
                                    {/* Icon Container with Halo */}
                                    <div className="relative mb-8">
                                        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.gradient} blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                                        <div className={`relative w-24 h-24 rounded-3xl bg-white border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-1`}>
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
                                        flex-1 w-full bg-white/60 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem]
                                        hover:bg-white/80 hover:border-white hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] 
                                        transition-all duration-300 flex flex-col items-start text-left relative overflow-hidden group/card
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
                                    <div className="md:hidden flex flex-col items-center py-6">
                                        <div className="w-0.5 h-12 bg-gradient-to-b from-slate-200 to-transparent"></div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-20 flex justify-center">
                    <button className="group flex items-center gap-3 px-10 py-5 bg-brand-black text-white rounded-full font-bold text-lg transition-all hover:pr-12 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] hover:-translate-y-1 active:scale-95">
                        Explore Full Curriculum
                        <ChevronRight className="transition-transform group-hover:translate-x-2" size={20} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </section>
    );
}
