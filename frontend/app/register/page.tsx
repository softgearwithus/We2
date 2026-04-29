'use client';

import { fetchApi } from '../lib/apiClient';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, GraduationCap, Building2, Code2, CheckCircle2, Loader2 } from 'lucide-react';

function RegisterPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);
    const [selection, setSelection] = useState<'student' | 'partner' | null>(null);
    const [registrationsAllowed, setRegistrationsAllowed] = useState(true);

    const nextParam = searchParams.get('next');
    const safeNext =
        nextParam &&
            nextParam.startsWith('/') &&
            !nextParam.startsWith('//')
            ? nextParam
            : null;

    useEffect(() => {
        fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/admin/public/settings`)
            .then((res) => res.json())
            .then((data) => setRegistrationsAllowed(Boolean(data.allowRegistrations)))
            .catch(() => null);
    }, []);

    const handleNavigation = async (path: string, type: 'student' | 'partner') => {
        if (isNavigating) return;
        setIsNavigating(true);
        setSelection(type);

        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 800));
        router.push(path);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-inter">
            {/* Left Side - Brand & Motivation (Brutalist Dark Mode) */}
            <motion.div
                className="relative bg-[#202b20] text-white flex flex-col justify-between p-12 lg:p-20 overflow-hidden border-r-2 border-[#202b20]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.5 }}
            >
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.05]" style={{
                        backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                {/* Logo */}
                <div className="relative z-10 w-fit">
                    <Link href="/" className="flex items-center gap-3 group px-6 py-2 border-2 border-white bg-[#202b20] shadow-[2px_2px_0px_0px_white] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_white] transition-all">
                        <span className="font-[800] text-2xl tracking-tighter">emble</span>
                    </Link>
                </div>

                {/* Main Content */}
                <div className="relative z-10 my-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl lg:text-7xl font-[800] tracking-tight leading-[1.1] mb-8 uppercase">
                            Join the <br />
                            <span className="text-[#ffa116]">Top 1%.</span>
                        </h1>
                        <p className="text-xl text-white/70 font-[500] max-w-lg leading-relaxed mb-12">
                            Master your interviews with dynamic Speech-to-Speech AI, JD matching, and real-time market scoring.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: Code2, text: "Company-Specific Mock Interviews" },
                                { icon: Sparkles, text: "Hyper-realistic Conversational AI" },
                                { icon: CheckCircle2, text: "Data-Driven Market Radar Scoring" }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="flex items-center gap-4 text-lg text-white font-[600]"
                                >
                                    <div className="w-10 h-10 border-2 border-white shadow-[2px_2px_0px_0px_white] flex items-center justify-center text-[#ffa116]">
                                        <feature.icon size={20} />
                                    </div>
                                    {feature.text}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Footer Quote */}
                <div className="relative z-10 text-[10px] uppercase font-bold tracking-widest text-[#ffa116] border-2 border-[#ffa116] w-fit px-4 py-2 shadow-[2px_2px_0px_0px_#ffa116]">
                    "Practice like it's the real thing."
                </div>
            </motion.div>

            {/* Right Side - Action / Selection */}
            <div className="bg-[#f8f9fa] selection:bg-[#ffa116] selection:text-[#202b20] flex flex-col justify-center items-center p-8 lg:p-20 relative">
                {/* Minimal Grid Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `linear-gradient(to right, #202b20 1px, transparent 1px), linear-gradient(to bottom, #202b20 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <AnimatePresence mode="wait">
                    {/* Standard Content */}
                    <motion.div
                        className="max-w-md w-full relative z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-[800] text-[#202b20] mb-3 uppercase">Get Started</h2>
                            <p className="text-[#202b20]/70 font-[500]">Choose your role to continue.</p>
                        </div>

                        {!registrationsAllowed && (
                            <div className="mb-6 border-2 border-[#202b20] bg-rose-50 px-4 py-3 text-sm font-[700] text-rose-700 text-center shadow-[2px_2px_0px_0px_#202b20] uppercase tracking-wide">
                                Registrations are currently closed. Please check back soon.
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Student Option */}
                            <motion.div
                                onClick={() => registrationsAllowed && handleNavigation(safeNext ? `/register/student?next=${encodeURIComponent(safeNext)}` : '/register/student', 'student')}
                                animate={isNavigating && selection !== 'student' ? { opacity: 0.5 } : {}}
                                className={`p-6 border-2 transition-all cursor-pointer flex items-center gap-6 relative overflow-visible ${selection === 'student'
                                    ? 'border-[#202b20] bg-white shadow-[3px_3px_0px_0px_#ffa116] -translate-y-1'
                                    : 'border-[#202b20] bg-white hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_#202b20]'
                                    } ${registrationsAllowed ? '' : 'opacity-60 cursor-not-allowed'}`}
                            >
                                <div className={`w-14 h-14 border-2 border-[#202b20] shadow-[2px_2px_0px_0px_#202b20] flex items-center justify-center shrink-0 transition-transform ${selection === 'student' ? 'bg-[#ffa116] text-[#202b20]' : 'bg-white text-[#202b20] group-hover:scale-110'
                                    }`}>
                                    {selection === 'student' && isNavigating ? (
                                        <Loader2 size={28} className="animate-spin text-[#202b20]" />
                                    ) : (
                                        <GraduationCap size={28} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-[800] transition-colors text-lg uppercase tracking-tight text-[#202b20]`}>I am a Student</h3>
                                    <p className="text-sm text-[#202b20]/70 font-[500] mt-1">
                                        Prepare for interviews & build projects.
                                    </p>
                                </div>
                                {selection === 'student' ? (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#202b20]">
                                        <ArrowRight size={24} strokeWidth={3} />
                                    </motion.div>
                                ) : (
                                    <ArrowRight className="text-[#202b20]/40 group-hover:text-[#202b20] transition-colors" strokeWidth={3} />
                                )}
                            </motion.div>

                            {/* Partner Option */}
                            <motion.div
                                onClick={() => registrationsAllowed && handleNavigation('/contact', 'partner')}
                                animate={isNavigating && selection !== 'partner' ? { opacity: 0.5 } : {}}
                                className={`p-6 border-2 transition-all cursor-pointer flex items-center gap-6 relative overflow-visible ${selection === 'partner'
                                    ? 'border-[#202b20] bg-white shadow-[3px_3px_0px_0px_#34d399] -translate-y-1'
                                    : 'border-[#202b20] bg-white hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_#202b20]'
                                    } ${registrationsAllowed ? '' : 'opacity-60 cursor-not-allowed'}`}
                            >
                                <div className={`w-14 h-14 border-2 border-[#202b20] shadow-[2px_2px_0px_0px_#202b20] flex items-center justify-center shrink-0 transition-transform ${selection === 'partner' ? 'bg-[#34d399] text-[#202b20]' : 'bg-white text-[#202b20] group-hover:scale-110'
                                    }`}>
                                    {selection === 'partner' && isNavigating ? (
                                        <Loader2 size={28} className="animate-spin text-[#202b20]" />
                                    ) : (
                                        <Building2 size={28} />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className={`font-[800] transition-colors text-lg uppercase tracking-tight text-[#202b20]`}>Institute / Company</h3>
                                    <p className="text-sm text-[#202b20]/70 font-[500] mt-1">
                                        Partner with us for hiring & training.
                                    </p>
                                </div>
                                {selection === 'partner' ? (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#202b20]">
                                        <ArrowRight size={24} strokeWidth={3} />
                                    </motion.div>
                                ) : (
                                    <ArrowRight className="text-[#202b20]/40 group-hover:text-[#202b20] transition-colors" strokeWidth={3} />
                                )}
                            </motion.div>
                        </div>

                        {/* Clarification Line for Partners */}
                        <motion.div
                            animate={isNavigating ? { opacity: 0 } : { opacity: 1 }}
                            className="mt-8 p-4 border-2 border-[#202b20] bg-white shadow-[2px_2px_0px_0px_#202b20] text-center"
                        >
                            <p className="text-[11px] text-[#202b20] font-[600] leading-relaxed tracking-wider uppercase">
                                <span className="font-[800] text-[#ffa116] bg-[#202b20] px-1 mr-1">NOTE:</span> Institutes and Companies looking to collaborate or hire generally require a partnership discussion. Please proceed to our contact page.
                            </p>
                        </motion.div>

                        <motion.div
                            animate={isNavigating ? { opacity: 0 } : { opacity: 1 }}
                            className="mt-10 text-center"
                        >
                            <p className="text-sm text-[#202b20]/70 font-[600]">
                                Already have an account?{' '}
                                <Link href={safeNext ? `/login?next=${encodeURIComponent(safeNext)}` : '/login'} className="font-[800] text-[#202b20] uppercase underline decoration-2 underline-offset-4 hover:text-[#ffa116] transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-semibold">Loading...</div>}>
            <RegisterPageContent />
        </Suspense>
    );
}
