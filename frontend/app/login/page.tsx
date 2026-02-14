'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Building2, Briefcase, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginSelectionPage() {
    const portals = [
        {
            role: 'Student',
            icon: <User size={32} className="text-white" />,
            description: 'Access simulations, track progress, and build your verified portfolio.',
            link: '/login/student',
            gradient: 'from-indigo-600 to-violet-600',
            border: 'hover:border-indigo-300',
            shadow: 'hover:shadow-indigo-500/20',
            bg: 'bg-indigo-50',
            badge: 'Most Popular'
        },
        {
            role: 'Institute',
            icon: <Building2 size={32} className="text-white" />,
            description: 'Manage student cohorts, monitor performance, and access analytics.',
            link: '/login/college',
            gradient: 'from-emerald-600 to-teal-600',
            border: 'hover:border-emerald-300',
            shadow: 'hover:shadow-emerald-500/20',
            bg: 'bg-emerald-50',
        },
        {
            role: 'Industry',
            icon: <Briefcase size={32} className="text-white" />,
            description: 'Hire pre-vetted talent and view verified project submissions.',
            link: '/login/industry',
            gradient: 'from-slate-800 to-black',
            border: 'hover:border-slate-400',
            shadow: 'hover:shadow-slate-500/20',
            bg: 'bg-slate-50',
        },
    ];

    return (
        <div className="min-h-screen bg-white selection:bg-brand-orange selection:text-white relative overflow-hidden flex flex-col">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-3xl -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -ml-64 -mb-64" />
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }} />
            </div>

            {/* Header */}
            <header className="relative z-10 py-8 px-6 md:px-12 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-brand-black rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-orange/20 group-hover:scale-105 transition-transform">
                        W2
                    </div>
                    <span className="font-bold text-xl text-brand-black tracking-tight">We2<span className="text-brand-orange">.Target</span></span>
                </Link>
                <Link
                    href="/"
                    className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:text-brand-black hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
                >
                    Back to Home
                </Link>
            </header>

            {/* Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10">
                <div className="text-center max-w-2xl mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-black text-white text-[10px] font-bold uppercase tracking-widest mb-6 shadow-lg shadow-brand-orange/20">
                        <Sparkles size={12} className="text-brand-orange" />
                        Secure Access Portal
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-brand-black mb-6 tracking-tight leading-[1.1]">
                        Choose Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-red-500">Gateway.</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                        Select the login dashboard relevant to your role to access your personalized high-performance environment.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
                    {portals.map((portal, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={portal.role}
                        >
                            <Link href={portal.link} className="block h-full group">
                                <div className={`relative h-full bg-white rounded-[32px] p-1 border-2 border-transparent ${portal.border} transition-all duration-500 ${portal.shadow} hover:-translate-y-2`}>
                                    <div className="absolute inset-0 bg-white rounded-[32px] shadow-xl shadow-slate-200/50" />

                                    <div className="relative h-full bg-slate-50/50 rounded-[28px] p-8 overflow-hidden z-10 flex flex-col">
                                        {portal.badge && (
                                            <div className="absolute top-6 right-6 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                                                {portal.badge}
                                            </div>
                                        )}

                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center mb-8 shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500`}>
                                            {portal.icon}
                                        </div>

                                        <h2 className="text-2xl font-black text-brand-black mb-3">{portal.role} Login</h2>

                                        <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-1">
                                            {portal.description}
                                        </p>

                                        <div className="flex items-center gap-2 font-bold text-sm text-brand-black group-hover:gap-4 transition-all">
                                            Access Portal <ArrowRight size={16} className="text-brand-orange" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20">
                    <Link href="/secure/admin" className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-brand-orange transition-colors opacity-50 hover:opacity-100">
                        <ShieldCheck size={14} />
                        Authorized Personnel Only
                    </Link>
                </div>
            </main>
        </div>
    );
}
