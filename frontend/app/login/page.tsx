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
        <div className="min-h-screen bg-slate-50 selection:bg-brand-orange selection:text-white relative overflow-hidden flex flex-col">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-full max-w-[800px] h-[800px] bg-brand-orange/5 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-full max-w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] -ml-64 -mb-64" />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
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
                    <Badge variant="outline" className="mb-6 py-1.5 px-4 rounded-full border-brand-orange/20 shadow-sm gap-2">
                        <Sparkles size={12} className="text-brand-orange" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-orange">Secure Access Portal</span>
                    </Badge>
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
                            className="h-full"
                        >
                            <Link href={portal.link} className="block h-full group">
                                <Card className="h-full flex flex-col border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-brand-orange/30 transition-all duration-500 hover:-translate-y-2 rounded-[32px] overflow-hidden bg-white/60 backdrop-blur-xl relative">
                                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${portal.gradient}`} />
                                    <CardHeader className="p-8 pb-4 relative">
                                        <div className="absolute top-8 right-8">
                                            <Badge variant={portal.badgeVar} className="text-[10px] uppercase font-bold tracking-wider">{portal.badge}</Badge>
                                        </div>
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-500`}>
                                            {portal.icon}
                                        </div>
                                        <CardTitle className="text-2xl font-black text-brand-black">{portal.role}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-8 pb-6 flex-1">
                                        <CardDescription className="text-base text-slate-500 font-medium leading-relaxed">
                                            {portal.description}
                                        </CardDescription>
                                    </CardContent>
                                    <CardFooter className="px-8 pb-8 pt-0">
                                        <div className="flex items-center gap-2 font-bold text-sm text-brand-black group-hover:gap-4 transition-all">
                                            {portal.cta} <ArrowRight size={16} className="text-brand-orange" />
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20">
                    <div className="flex items-center justify-center gap-6 text-sm font-medium text-slate-400">
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
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-semibold">Loading...</div>}>
            <LoginSelectionPageContent />
        </Suspense>
    );
}
