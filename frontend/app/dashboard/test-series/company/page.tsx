'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Globe, Laptop, Lock, Rocket, Target, Layout, Star, Sparkles, TrendingUp } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const COMPANIES = [
    { title: 'Google', icon: Globe, count: '10 Mock Tests', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    { title: 'Amazon', icon: Target, count: '12 Mock Tests', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    { title: 'Microsoft', icon: Layout, count: '8 Mock Tests', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'TCS NQT', icon: Building2, count: '20 Mock Tests', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { title: 'Infosys', icon: Laptop, count: '15 Mock Tests', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100' },
    { title: 'Startup Kit', icon: Rocket, count: '5 Mock Tests', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 20 });
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

    function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left / rect.width - 0.5);
        y.set(event.clientY - rect.top / rect.height - 0.5);
    }

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={onMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            className={`perspective-1000 ${className}`}
        >
            {children}
        </motion.div>
    );
};

const SpotlightInside = ({ color }: { color: string }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);
    return (
        <div
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            className="absolute inset-0 z-10 transition-opacity duration-300 pointer-events-none overflow-hidden rounded-[40px]"
            style={{
                opacity,
                background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${color}15, transparent 40%)`,
            }}
        />
    );
};

const BackgroundDecor = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#F8FAFC]">
        <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px]"
        />
        <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay pointer-events-none" />
    </div>
);

export default function CompanyTestsPage() {
    return (
        <div className="min-h-screen font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-700 overflow-x-hidden pb-20">
            <BackgroundDecor />

            <div className="max-w-7xl mx-auto p-6 lg:p-12 relative z-10">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <Link href="/dashboard/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 font-medium mb-8 transition-all group px-5 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md active:scale-95">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Test Series
                    </Link>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg border border-orange-100 animate-pulse">
                            <Star size={24} />
                        </div>
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Industry Patterns</span>
                    </div>

                    <h1 className="text-6xl lg:text-8xl font-black tracking-tight text-slate-900 mb-6 leading-none">
                        Company <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Benchmarks.</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl leading-relaxed font-medium italic">
                        Targeted simulations designed to mirror the exact interview patterns of top-tier technology firms.
                    </p>
                </motion.header>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                >
                    {COMPANIES.map((company, idx) => (
                        <TiltCard key={idx}>
                            <motion.div
                                variants={item}
                                className="relative bg-white rounded-[40px] p-10 h-full border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(249,115,22,0.15)] transition-all duration-500 flex flex-col justify-between overflow-hidden group"
                            >
                                <SpotlightInside color="#f97316" />
                                <div>
                                    <div className={`w-20 h-20 ${company.bg} ${company.color} rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500 shadow-inner border ${company.border}`}>
                                        <company.icon size={40} />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-orange-600 transition-colors tracking-tight leading-none">{company.title}</h3>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">{company.count}</div>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1">
                                            <TrendingUp size={10} /> Active Now
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full py-5 rounded-[22px] bg-slate-900 text-white font-black text-base hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-3 active:scale-95">
                                    <Lock size={18} /> Unlock Tests
                                </button>
                            </motion.div>
                        </TiltCard>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
