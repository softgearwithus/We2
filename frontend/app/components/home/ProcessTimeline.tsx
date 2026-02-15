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
        glow: "shadow-blue-200/50"
    },
    {
        icon: Code2,
        title: "Prep0: Mastery",
        desc: "Comprehensive training suite to clear every screening round with precise focus.",
        features: ["200+ Company-Picked Ques", "CS Core (OS, DBMS, CN)", "ATS Resume Builder", "AI Mock Interviews"],
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-100",
        glow: "shadow-orange-200/50"
    },
    {
        icon: Briefcase,
        title: "We2Hub: Simulation",
        desc: "Step into industry-grade work modules. Ship production features on real tickets.",
        features: ["Virtual Experience", "Real JIRA Tickets", "Senior Dev AI Reviews", "Git Mastery"],
        color: "text-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-100",
        glow: "shadow-purple-200/50"
    },
    {
        icon: Trophy,
        title: "Career Launch",
        desc: "One engineering profile with verified proof of work for top tech recruiters.",
        features: ["Verified Work History", "Skill Scorecard", "Direct Interview Invites", "Alumni Network"],
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-100",
        glow: "shadow-green-200/50"
    }
];

export default function ProcessTimeline() {
    return (
        <section className="py-32 bg-slate-50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-100/20 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3"></div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-24">
                    <span className="text-brand-orange font-black text-[11px] uppercase tracking-[0.2em] bg-orange-50 px-4 py-2 rounded-full border border-orange-100 inline-block mb-8">
                        The we2 journey
                    </span>
                    <h2 className="text-5xl md:text-7xl font-[1000] text-brand-black tracking-tighter mb-8 leading-[0.95]">
                        From Campus to <br /> <span className="text-gradient">Corporate in 4 Steps.</span>
                    </h2>
                    <p className="text-xl text-gray-400 font-medium">
                        Everything from preparation to industrial simulation, synchronized in one flow.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-0.5 bg-slate-200/50 -z-0">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: '100%' }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="h-full bg-gradient-to-r from-blue-400 via-orange-400 to-green-400"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.6 }}
                            >
                                <div className="flex flex-col items-center">
                                    {/* Icon Container */}
                                    <div className={`w-20 h-20 rounded-3xl ${step.bg} ${step.color} ${step.border} border flex items-center justify-center mb-8 transition-all duration-500 hover:scale-110 hover:shadow-[0_20px_40px_-10px] ${step.glow} cursor-pointer relative`}>
                                        <step.icon size={32} strokeWidth={2.5} />
                                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-slate-100 shadow-md flex items-center justify-center text-xs font-black text-slate-900">
                                            {i + 1}
                                        </div>
                                    </div>

                                    <div className="glass p-8 rounded-[2.5rem] border border-white hover:border-slate-200 transition-all duration-300 hover:shadow-xl w-full flex flex-col group min-h-[380px]">
                                        <h3 className="text-2xl font-[1000] text-brand-black mb-3 tracking-tighter leading-none group-hover:text-brand-orange transition-colors">{step.title}</h3>
                                        <p className="text-gray-500 font-medium leading-relaxed text-[14px] mb-8">
                                            {step.desc}
                                        </p>

                                        <div className="space-y-3 mt-auto pt-6 border-t border-slate-100">
                                            {step.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full ${step.bg} ${step.color} flex items-center justify-center border ${step.border}`}>
                                                        <CheckCircle2 size={10} strokeWidth={3} />
                                                    </div>
                                                    <span className="text-[11px] font-[900] text-slate-800 uppercase tracking-wider">{feature}</span>
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
                    <button className="group flex items-center gap-3 px-10 py-5 bg-brand-black text-white rounded-2xl font-black text-lg transition-all hover:pr-12 shadow-2xl hover:shadow-brand-orange/20 active:scale-95">
                        Explore Full Curriculum
                        <ChevronRight className="transition-transform group-hover:translate-x-2" size={20} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </section>
    );
}
