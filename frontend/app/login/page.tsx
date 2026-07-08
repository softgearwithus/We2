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
    const safeNext = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : null;

    const portals = [
        {
            role: 'Student',
            icon: <GraduationCap size={24} className="text-indigo-600" />,
            description: 'Access simulations, track progress, and build your verified portfolio.',
            link: safeNext ? `/login/student?next=${encodeURIComponent(safeNext)}` : '/login/student',
            hoverColor: 'hover:border-indigo-500 hover:shadow-[0_8px_30px_rgb(99,102,241,0.12)]',
            iconBg: 'bg-indigo-50',
            cta: 'Student Login'
        },
        {
            role: 'Institute',
            icon: <Building2 size={24} className="text-emerald-600" />,
            description: 'Partner with us to transform your campus into a tech talent hub.',
            link: safeNext ? `/login/college?next=${encodeURIComponent(safeNext)}` : '/login/college',
            hoverColor: 'hover:border-emerald-500 hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)]',
            iconBg: 'bg-emerald-50',
            cta: 'Institute Login'
        },
        {
            role: 'Industry',
            icon: <Briefcase size={24} className="text-purple-600" />,
            description: 'Hire pre-vetted talent directly from our high-performance cohorts.',
            link: safeNext ? `/login/industry?next=${encodeURIComponent(safeNext)}` : '/login/industry',
            hoverColor: 'hover:border-purple-500 hover:shadow-[0_8px_30px_rgb(168,85,247,0.12)]',
            iconBg: 'bg-purple-50',
            cta: 'Company Login'
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-[100px] rounded-full pointer-events-none opacity-50" />

            {/* Header */}
            <header className="relative z-10 py-8 px-6 md:px-12 flex items-center justify-between">
                <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                    <span className="font-[800] text-2xl text-gray-900 tracking-tighter">emble</span>
                </Link>
            </header>

            {/* Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10">
                <div className="text-center max-w-2xl mb-12 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-[800] text-gray-900 mb-4 tracking-tight leading-[1.1]">
                        Welcome back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Emble</span>
                    </h1>
                    <p className="text-lg text-gray-500 font-[500] max-w-lg mx-auto leading-relaxed">
                        Select your portal to continue.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                    {portals.map((portal, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={portal.role}
                            className="h-full"
                        >
                            <Link href={portal.link} className="block h-full group">
                                <div className={`h-full flex flex-col bg-white border border-gray-200 rounded-2xl p-8 transition-all duration-300 ${portal.hoverColor}`}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${portal.iconBg}`}>
                                        {portal.icon}
                                    </div>
                                    <h2 className="text-xl font-[700] text-gray-900 mb-3">{portal.role}</h2>
                                    <p className="text-sm text-gray-500 font-[500] leading-relaxed flex-1 mb-8">
                                        {portal.description}
                                    </p>
                                    <div className="flex items-center gap-2 font-[600] text-sm text-gray-900 group-hover:text-indigo-600 transition-colors mt-auto">
                                        {portal.cta} <ArrowRight size={16} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16">
                    <div className="flex items-center justify-center gap-6 text-sm font-[500] text-gray-400">
                        <Link href="/secure/admin" className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                            <ShieldCheck size={14} />
                            Admin Access
                        </Link>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <Link href="/contact" className="hover:text-gray-900 transition-colors">
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
