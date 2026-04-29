'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Building2, Briefcase, ShieldCheck, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

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
            icon: <GraduationCap size={28} className="text-white" />,
            description: 'Access simulations, track progress, and build your verified portfolio.',
            link: safeNext ? `/login/student?next=${encodeURIComponent(safeNext)}` : '/login/student',
            gradient: 'from-violet-500 to-indigo-600',
            badge: 'Login Portal',
            badgeVar: 'default' as const,
            cta: 'Student Login'
        },
        {
            role: 'Institute',
            icon: <Building2 size={28} className="text-white" />,
            description: 'Partner with us to transform your campus into a tech talent hub.',
            link: safeNext ? `/login/college?next=${encodeURIComponent(safeNext)}` : '/login/college',
            gradient: 'from-emerald-500 to-teal-600',
            badge: 'Partner Program',
            badgeVar: 'secondary' as const,
            cta: 'Institute Login'
        },
        {
            role: 'Industry',
            icon: <Briefcase size={28} className="text-white" />,
            description: 'Hire pre-vetted talent directly from our high-performance cohorts.',
            link: safeNext ? `/login/industry?next=${encodeURIComponent(safeNext)}` : '/login/industry',
            gradient: 'from-slate-800 to-black',
            badge: 'Hiring Solutions',
            badgeVar: 'outline' as const,
            cta: 'Company Login'
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fa] selection:bg-[#ffa116] selection:text-[#202b20] relative overflow-hidden flex flex-col font-inter">
            {/* Minimal Grid Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(to right, #202b20 1px, transparent 1px), linear-gradient(to bottom, #202b20 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Header */}
            <header className="relative z-10 py-8 px-6 md:px-12 flex items-center justify-between">
                <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                    <span className="font-[800] text-3xl text-[#202b20] tracking-tighter">emble</span>
                </Link>
            </header>

            {/* Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10">
                <div className="text-center max-w-3xl mb-16 animate-fade-in-up">

                    <h1 className="text-5xl md:text-7xl font-[800] text-[#202b20] mb-6 tracking-tight leading-[1.1] uppercase">
                        Choose Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffa116] to-[#ff9100]">Gateway.</span>
                    </h1>
                    <p className="text-xl text-[#202b20]/70 font-[500] max-w-lg mx-auto leading-relaxed">
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
                            className="h-full"
                        >
                            <Link href={portal.link} className="block h-full group">
                                <div className="h-full flex flex-col border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] hover:shadow-[4px_4px_0_0_#ffa116] hover:-translate-y-1 transition-all duration-300 bg-white relative">
                                    <div className="absolute top-0 left-0 w-full h-2 border-b-2 border-[#202b20]" style={{
                                        backgroundColor: portal.role === 'Student' ? '#ffa116' : portal.role === 'Institute' ? '#34d399' : '#202b20'
                                    }} />
                                    <div className="p-8 pb-4 relative mt-2">
                                        <div className="absolute top-8 right-8 text-[10px] uppercase font-[800] tracking-wider px-2 py-1 border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] bg-white">
                                            {portal.badge}
                                        </div>
                                        <div className={`w-14 h-14 border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`} style={{
                                            backgroundColor: portal.role === 'Student' ? '#ffa116' : portal.role === 'Institute' ? '#34d399' : '#202b20'
                                        }}>
                                            {portal.icon}
                                        </div>
                                        <h2 className="text-2xl font-[800] uppercase text-[#202b20]">{portal.role}</h2>
                                    </div>
                                    <div className="px-8 pb-6 flex-1">
                                        <p className="text-base text-[#202b20]/80 font-[600] leading-relaxed">
                                            {portal.description}
                                        </p>
                                    </div>
                                    <div className="px-8 pb-8 pt-0 mt-auto">
                                        <div className="flex items-center gap-2 font-[800] uppercase text-sm text-[#202b20] group-hover:gap-4 transition-all">
                                            {portal.cta} <ArrowRight size={16} className="text-[#ffa116]" strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20">
                    <div className="flex items-center justify-center gap-6 text-sm font-[600] text-[#202b20]/60 uppercase tracking-widest">
                        <Link href="/secure/admin" className="flex items-center gap-2 hover:text-[#ffa116] transition-colors">
                            <ShieldCheck size={14} />
                            Admin Access
                        </Link>
                        <span className="w-1.5 h-1.5 bg-[#202b20]" />
                        <Link href="/contact" className="hover:text-[#ffa116] transition-colors">
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
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-semibold">Loading...</div>}>
            <LoginSelectionPageContent />
        </Suspense>
    );
}
