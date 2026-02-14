'use client';

import { motion } from 'framer-motion';
import { Target, Code2, Briefcase, Trophy } from 'lucide-react';

const steps = [
    {
        icon: Target,
        title: "Baseline Assessment",
        desc: "We analyze your current skill level in DSA, Dev, and Comm skills.",
        color: "bg-blue-50 text-blue-600",
        lineColor: "from-blue-200 to-orange-200"
    },
    {
        icon: Code2,
        title: "Prep0 Training",
        desc: "Master the fundamentals. 21-day intensive sprints on weak areas.",
        color: "bg-orange-50 text-brand-orange",
        lineColor: "from-orange-200 to-gray-200"
    },
    {
        icon: Briefcase,
        title: "We2Hub Simulation",
        desc: "Join a virtual company. Ship production code. Gain experience.",
        color: "bg-gray-100 text-gray-700",
        lineColor: "from-gray-200 to-green-200"
    },
    {
        icon: Trophy,
        title: "Placement",
        desc: "Sit for interviews with our partner companies with a verified portfolio.",
        color: "bg-green-50 text-green-600",
        lineColor: "transparent"
    }
];

export default function ProcessTimeline() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="text-brand-orange font-bold text-xs uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                        How It Works
                    </span>
                    <h2 className="text-4xl font-bold text-brand-black tracking-tight mt-6 mb-4">
                        From Campus to <br /> Corporate in 4 Steps.
                    </h2>
                </div>

                <div className="relative">
                    {/* Desktop Horizontal Line */}
                    <div className="hidden md:block absolute top-[28px] left-0 w-full h-1 bg-gray-100 -z-10"></div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.5 }}
                                className="relative flex flex-col items-center text-center group"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center border border-white shadow-[0_0_0_8px_rgba(255,255,255,1)] z-10 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                                    <step.icon size={24} />
                                </div>
                                <div className="mt-8">
                                    <h3 className="text-lg font-bold text-brand-black mb-2">{step.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                                        {step.desc}
                                    </p>
                                </div>

                                {/* Connector Line for Mobile */}
                                {i !== steps.length - 1 && (
                                    <div className="md:hidden absolute top-14 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gray-200"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
