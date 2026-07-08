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
    const safeNext = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : null;

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
        await new Promise(resolve => setTimeout(resolve, 800));
        router.push(path);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-slate-50">
            {/* Left Side - Brand & Motivation (Premium Gradient Theme) */}
            <motion.div
                className="relative bg-gray-900 text-white flex flex-col justify-between p-12 lg:p-20 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.5 }}
            >
                {/* Premium Background Effects */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute -inset-[100%] translate-x-1/3 -translate-y-1/3 w-[200%] h-[200%] bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/30 blur-3xl opacity-50" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }} />
                </div>

                {/* Logo */}
                <div className="relative z-10 w-fit">
                    <Link href="/" className="flex items-center gap-3 group px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/15 transition-colors border border-white/10">
                        <span className="font-[800] text-2xl tracking-tighter text-white">emble</span>
                    </Link>
                </div>

                {/* Main Content */}
                <div className="relative z-10 my-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl lg:text-7xl font-[800] tracking-tight leading-[1.05] mb-6">
                            Join the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Top 1%.</span>
                        </h1>
                        <p className="text-lg text-white/70 font-[500] max-w-lg leading-relaxed mb-12">
                            Evaluate candidates fairly and efficiently with highly-predictive, work-sample based assessments. Stop guessing and start evaluating true technical knowledge.
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
                                    className="flex items-center gap-4 text-[17px] text-white/90 font-[500]"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 backdrop-blur-sm">
                                        <feature.icon size={20} />
                                    </div>
                                    {feature.text}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Footer Quote */}
                <div className="relative z-10">
                    <p className="text-sm font-serif italic text-white/50">
                        "The standard for identifying engineering talent."
                    </p>
                </div>
            </motion.div>

            {/* Right Side - Action / Selection */}
            <div className="flex flex-col justify-center items-center p-8 lg:p-20 relative bg-slate-50">
                <AnimatePresence mode="wait">
                    <motion.div
                        className="max-w-md w-full relative z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-[800] text-gray-900 mb-3 tracking-tight">Create an account</h2>
                            <p className="text-gray-500 font-[500]">Choose your role to continue.</p>
                        </div>

                        {!registrationsAllowed && (
                            <div className="mb-6 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-[600] text-rose-600 text-center shadow-sm">
                                Registrations are currently closed. Please check back soon.
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Student Option */}
                            <motion.div
                                onClick={() => registrationsAllowed && handleNavigation(safeNext ? `/register/student?next=${encodeURIComponent(safeNext)}` : '/register/student', 'student')}
                                animate={isNavigating && selection !== 'student' ? { opacity: 0.5 } : {}}
                                className={`p-6 rounded-2xl transition-all cursor-pointer flex items-center gap-6 border border-gray-200 bg-white hover:border-indigo-500 hover:shadow-[0_8px_30px_rgb(99,102,241,0.12)] group ${
                                    selection === 'student' ? 'border-indigo-500 shadow-[0_8px_30px_rgb(99,102,241,0.12)]' : ''
                                } ${registrationsAllowed ? '' : 'opacity-60 cursor-not-allowed'}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                    selection === 'student' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                                }`}>
                                    {selection === 'student' && isNavigating ? (
                                        <Loader2 size={24} className="animate-spin" />
                                    ) : (
                                        <GraduationCap size={24} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-[700] text-lg text-gray-900">I am a Student</h3>
                                    <p className="text-sm text-gray-500 font-[500] mt-1">
                                        Prepare for interviews & build projects.
                                    </p>
                                </div>
                                <ArrowRight className={`transition-colors ${selection === 'student' ? 'text-indigo-600' : 'text-gray-300 group-hover:text-indigo-600'}`} size={20} />
                            </motion.div>

                            {/* Partner Option */}
                            <motion.div
                                onClick={() => registrationsAllowed && handleNavigation('/contact', 'partner')}
                                animate={isNavigating && selection !== 'partner' ? { opacity: 0.5 } : {}}
                                className={`p-6 rounded-2xl transition-all cursor-pointer flex items-center gap-6 border border-gray-200 bg-white hover:border-emerald-500 hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)] group ${
                                    selection === 'partner' ? 'border-emerald-500 shadow-[0_8px_30px_rgb(16,185,129,0.12)]' : ''
                                } ${registrationsAllowed ? '' : 'opacity-60 cursor-not-allowed'}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                    selection === 'partner' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'
                                }`}>
                                    {selection === 'partner' && isNavigating ? (
                                        <Loader2 size={24} className="animate-spin" />
                                    ) : (
                                        <Building2 size={24} />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-[700] text-lg text-gray-900">Institute / Company</h3>
                                    <p className="text-sm text-gray-500 font-[500] mt-1">
                                        Partner with us for hiring & training.
                                    </p>
                                </div>
                                <ArrowRight className={`transition-colors ${selection === 'partner' ? 'text-emerald-600' : 'text-gray-300 group-hover:text-emerald-600'}`} size={20} />
                            </motion.div>
                        </div>

                        {/* Clarification Line for Partners */}
                        <motion.div
                            animate={isNavigating ? { opacity: 0 } : { opacity: 1 }}
                            className="mt-6 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-center"
                        >
                            <p className="text-xs text-indigo-900/70 font-[500] leading-relaxed">
                                <strong className="font-[700] text-indigo-700">Note:</strong> Institutes and Companies looking to collaborate or hire require a partnership discussion. Please proceed to our contact page.
                            </p>
                        </motion.div>

                        <motion.div
                            animate={isNavigating ? { opacity: 0 } : { opacity: 1 }}
                            className="mt-10 text-center"
                        >
                            <p className="text-sm text-gray-500 font-[500]">
                                Already have an account?{' '}
                                <Link href={safeNext ? `/login?next=${encodeURIComponent(safeNext)}` : '/login'} className="font-[600] text-indigo-600 hover:text-indigo-700 transition-colors">
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
