'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Briefcase, BookOpen, Zap, Sparkles, Code2, Target, Rocket } from 'lucide-react';

const funnelSteps = [
    {
        title: "Phase 1: The Bootcamp",
        subtitle: "Master the Fundamentals",
        description: "Build a rock-solid foundation with curated DSA, aptitude drills, and AI-powered mock interviews.",
        icon: BookOpen,
        color: "emerald",
        features: [
            "Resume ATS Scanner & Builder",
            "DSA & SQL Training",
            "200+ Company-Picked Questions",
            "AI Video Interviews"
        ]
    },
    {
        title: "Phase 2: The Simulation",
        subtitle: "Experience the Real World",
        description: "Step into the shoes of a software engineer. Solve JIRA tickets, manage Git pipelines, and get code reviews.",
        icon: Briefcase,
        color: "orange",
        features: [
            "Real-world JIRA Tickets",
            "Git & CI/CD Pipelines",
            "Code Reviews by Senior AI Devs",
            "Industrial Work Experience Cert"
        ]
    }
];

export default function DualModeSection() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <section className="py-32 relative overflow-hidden bg-white">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-[900] uppercase tracking-[0.25em] mb-8">
                        The Emble Journey
                    </div>
                    <h2 className="text-5xl md:text-7xl font-[1000] text-brand-black tracking-tighter mb-8 leading-[0.95]">
                        From Learning <br /> to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-brand-orange">Leading.</span>
                    </h2>
                    <p className="text-xl text-gray-500 font-medium max-w-xl mx-auto">
                        A seamless path from mastering concepts to applying them in a production environment.
                    </p>
                </motion.div>

                {/* Journey Container */}
                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative z-10">
                        {funnelSteps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className="group"
                            >
                                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                    {/* Decorative Gradient Blob */}
                                    <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 transition-opacity duration-500 group-hover:opacity-40 ${step.color === 'emerald' ? 'bg-emerald-400' : 'bg-brand-orange'}`}></div>

                                    {/* Icon & Badge */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${step.color === 'emerald' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-brand-orange shadow-orange-200'}`}>
                                            <step.icon size={32} strokeWidth={2} />
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${step.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-brand-orange'}`}>
                                            {step.title}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-3xl font-[900] text-brand-black mb-3">{step.subtitle}</h3>
                                    <p className="text-gray-500 font-medium leading-relaxed mb-8">{step.description}</p>

                                    {/* Features List */}
                                    <ul className="space-y-4 mb-10">
                                        {step.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${step.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-brand-orange'}`}>
                                                    <CheckCircle2 size={14} strokeWidth={3} />
                                                </div>
                                                <span className="text-brand-black font-bold text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Central Connector / CTA */}
                    <div className="flex justify-center mt-12 lg:mt-0 lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-20">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, type: "spring" }}
                            className="bg-white p-2 rounded-full shadow-2xl shadow-blue-200/50"
                        >
                            <Link href="/register" className="w-16 h-16 lg:w-20 lg:h-20 bg-brand-black rounded-full flex items-center justify-center text-white hover:bg-brand-orange transition-colors duration-300 group">
                                <ArrowRight size={32} className="group-hover:scale-110 transition-transform" />
                            </Link>
                        </motion.div>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-brand-black text-white font-[900] text-lg hover:bg-brand-orange transition-all duration-300 shadow-xl hover:shadow-brand-orange/20 hover:-translate-y-1 active:scale-95"
                    >
                        Start Your Emble Journey <Rocket size={20} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
