'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Database, Globe, Lock, Rocket, Server, Terminal } from 'lucide-react';

const roadmapNodes = [
    { title: "Basics of DSA", icon: Terminal, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Advanced Arrays", icon: Database, color: "text-purple-500", bg: "bg-purple-50" },
    { title: "System Design", icon: Server, color: "text-orange-500", bg: "bg-orange-50" },
    { title: "Ind. Experience", icon: Rocket, color: "text-green-500", bg: "bg-green-50" }
];

export default function RoadmapPreview() {
    return (
        <section className="py-24 bg-gray-50 relative overflow-hidden">
            {/* Decorative grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Left text */}
                    <div className="lg:w-1/2 space-y-8">
                        <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold uppercase tracking-widest text-brand-black">Curriculum</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-brand-black tracking-tight leading-[1.1]">
                            Proven path to <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-purple-600">SDE Readiness.</span>
                        </h2>
                        <p className="text-xl text-gray-500 leading-relaxed font-medium">
                            Don't guess what to learn. Our adaptive engine tracks your progress and gives you the exact tasks needed to level up.
                        </p>
                        <div className="flex flex-col gap-4">
                            {[
                                "500+ Hand-picked DSA Questions",
                                "200+ Company-specific Question Banks",
                                "15+ Production-grade Simulations",
                                "Verified Industrial Work History"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-brand-black font-bold">
                                    <div className="w-6 h-6 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                                        <ChevronRight size={14} strokeWidth={3} />
                                    </div>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Visual roadmap preview */}
                    <div className="lg:w-1/2 w-full">
                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[39px] top-10 bottom-10 w-1 bg-gray-200 -z-10"></div>

                            <div className="space-y-10">
                                {roadmapNodes.map((node, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1, duration: 0.5 }}
                                        className="flex items-center gap-8 group"
                                    >
                                        <div className={`w-20 h-20 rounded-2xl ${node.bg} ${node.color} flex items-center justify-center border border-white shadow-xl group-hover:scale-110 transition-transform duration-300 relative`}>
                                            <node.icon size={32} />
                                            {/* Pulse effect for first node or 'active' node */}
                                            {i === 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
                                            </span>}
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1 group-hover:shadow-md transition-shadow">
                                            <h4 className="text-lg font-extrabold text-brand-black mb-1">{node.title}</h4>
                                            <p className="text-sm text-gray-500 font-medium">Stage {i + 1} Assessment Completed</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Floating CTA */}
                            <div className="absolute -bottom-10 right-0 p-4 bg-brand-black text-white rounded-2xl shadow-xl flex items-center gap-4 animate-bounce-slow">
                                <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center">
                                    <Rocket size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Unlock Stage 5</p>
                                    <p className="font-bold">Next: System Design</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
