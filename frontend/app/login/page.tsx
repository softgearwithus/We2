'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { User, Building2, Briefcase, ShieldCheck, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';

function LoginSelectionPageContent() {
    const searchParams = useSearchParams();
    const nextParam = searchParams.get('next');
    const safeNext =
        nextParam &&
            nextParam.startsWith('/') &&
            !nextParam.startsWith('//')
            ? nextParam
            : null;

    const portals = [
        {
            role: 'Student',
            icon: <GraduationCap size={32} className="text-white" />,
            description: 'Access simulations, track progress, and build your verified portfolio.',
            link: safeNext ? `/login/student?next=${encodeURIComponent(safeNext)}` : '/login/student',
            gradient: 'from-slate-600 to-violet-600',
            border: 'hover:border-slate-300',
            shadow: 'hover:shadow-slate-200',
            badge: 'Login Portal',
            badgeColor: 'bg-slate-800',
            cta: 'Student Login'
        },
        {
            role: 'Institute',
            icon: <Building2 size={32} className="text-white" />,
            description: 'Partner with us to transform your campus into a tech talent hub.',
            link: safeNext ? `/login/college?next=${encodeURIComponent(safeNext)}` : '/login/college',
            gradient: 'from-emerald-600 to-teal-600',
            border: 'hover:border-emerald-300',
            shadow: 'hover:shadow-emerald-500/20',
            badge: 'Partner Program',
            badgeColor: 'bg-emerald-600',
            cta: 'Institute Login'
        },
        {
            role: 'Industry',
            icon: <Briefcase size={32} className="text-white" />,
            description: 'Hire pre-vetted talent directly from our high-performance cohorts.',
            link: safeNext ? `/login/industry?next=${encodeURIComponent(safeNext)}` : '/login/industry',
            gradient: 'from-slate-800 to-black',
            border: 'hover:border-slate-400',
            shadow: 'hover:shadow-slate-500/20',
            badge: 'Hiring Solutions',
            badgeColor: 'bg-slate-900',
            cta: 'Company Login'
        },
    ];

    return (
        <div className="min-h-screen bg-white selection:bg-brand-orange selection:text-white relative overflow-hidden flex flex-col">
            {/* Background Decoration - Static for Performance */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-full max-w-full max-w-[800px] h-[800px] bg-brand-orange/5 rounded-full blur-3xl -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-full max-w-full max-w-[800px] h-[800px] bg-slate-500/5 rounded-full blur-3xl -ml-64 -mb-64" />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }} />
            </div>

            {/* Header */}
            <header className="relative z-10 py-8 px-6 md:px-12 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <span className="font-black text-2xl text-brand-black tracking-tight">EMBLE</span>
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
                <div className="text-center max-w-3xl mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-black text-white text-[10px] font-bold uppercase tracking-widest mb-6 shadow-lg shadow-brand-orange/20">
                        <Sparkles size={12} className="text-brand-orange" />
                        Secure Access Portal
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-brand-black mb-6 tracking-tight leading-[1.1]">
                        Choose Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-red-500">Gateway.</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                        Whether you're a student building a career or an organization building the future, start here.
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

                                    <div className="relative h-full bg-slate-50/30 backdrop-blur-sm rounded-[28px] p-8 overflow-hidden z-10 flex flex-col">
                                        <div className={`absolute top-6 right-6 ${portal.badgeColor} text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg`}>
                                            {portal.badge}
                                        </div>

                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center mb-8 shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500`}>
                                            {portal.icon}
                                        </div>

                                        <h2 className="text-2xl font-black text-brand-black mb-3">{portal.role}</h2>

                                        <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-1">
                                            {portal.description}
                                        </p>

                                        <div className="flex items-center gap-2 font-bold text-sm text-brand-black group-hover:gap-4 transition-all">
                                            {portal.cta} <ArrowRight size={16} className="text-brand-orange" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20">
                    <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
                        <Link href="/secure/admin" className="flex items-center gap-2 hover:text-brand-orange transition-colors">
                            <ShieldCheck size={14} />
                            Admin Access
                        </Link>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <Link href="/contact" className="hover:text-brand-orange transition-colors">
                            Need Help?
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function LoginSelectionPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-semibold">Loading...</div>}>
            <LoginSelectionPageContent />
        </Suspense>
    );
}
