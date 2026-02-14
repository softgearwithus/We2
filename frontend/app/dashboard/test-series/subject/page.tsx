'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Code2, Database, Globe, Layers, Lock, Sparkles, ChevronRight, TrendingUp } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const SUBJECTS = [
    { title: 'Data Structures & Algorithms', icon: Code2, count: '15 Tests', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    { title: 'Operating Systems', icon: Layers, count: '8 Tests', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'Database Management Systems', icon: Database, count: '10 Tests', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Computer Networks', icon: Globe, count: '6 Tests', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { title: 'Object Oriented Programming', icon: BookOpen, count: '12 Tests', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
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
            animate={{ scale: [1, 1.1, 1], y: [0, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity }}
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]"
        />
        <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }}
            transition={{ duration: 22, repeat: Infinity }}
            className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay pointer-events-none" />
    </div>
);

export default function SubjectTestsPage() {
    return (
        <div className="min-h-screen font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 overflow-x-hidden pb-20">
            <BackgroundDecor />

            <div className="max-w-7xl mx-auto p-6 lg:p-12 relative z-10">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <Link href="/dashboard/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-8 transition-all group px-5 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md active:scale-95">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Test Series
                    </Link>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 animate-pulse">
                            <Sparkles size={24} />
                        </div>
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Technical Foundation</span>
                    </div>

                    <h1 className="text-6xl lg:text-8xl font-black tracking-tight text-slate-900 mb-6 leading-none">
                        Subject <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Mastery.</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl leading-relaxed font-medium italic">
                        Deep dive into computer science fundamentals. Rigorous evaluations for serious engineers.
                    </p>
                </motion.header>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                >
                    {SUBJECTS.map((subject, idx) => (
                        <TiltCard key={idx}>
                            <motion.div
                                variants={item}
                                className="relative bg-white rounded-[40px] p-10 h-full border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.15)] transition-all duration-500 flex flex-col justify-between overflow-hidden group"
                            >
                                <SpotlightInside color="#4f46e5" />
                                <div>
                                    <div className={`w-20 h-20 ${subject.bg} ${subject.color} rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-inner border ${subject.border}`}>
                                        <subject.icon size={40} />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors tracking-tight leading-none">{subject.title}</h3>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">{subject.count}</div>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                                            <TrendingUp size={10} /> Core Subject
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full py-5 rounded-[22px] bg-slate-900 text-white font-black text-base hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-3 active:scale-95">
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
