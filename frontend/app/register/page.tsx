'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, GraduationCap, Building2, Code2, CheckCircle2, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);
    const [selection, setSelection] = useState<'student' | 'partner' | null>(null);
    const [registrationsAllowed, setRegistrationsAllowed] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/public/settings`)
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
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans overflow-hidden">
            {/* Left Side - Brand & Motivation (LeetCode Style Dark Mode) */}
            <motion.div
                className="relative bg-slate-950 text-white flex flex-col justify-between p-12 lg:p-20 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.5 }}
            >
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -ml-20 -mb-20" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                {/* Logo */}
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 group w-max">
                        <span className="font-bold text-2xl tracking-tight">EMBLE</span>
                    </Link>
                </div>

                {/* Main Content */}
                <div className="relative z-10 my-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
                            Join the <br />
                            <span className="text-brand-orange">Top 1%.</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed mb-12">
                            Master Data Structures, System Design, and Real-world Development with our industry-grade simulations.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: Code2, text: "Solve 500+ Premium Questions" },
                                { icon: Sparkles, text: "AI-Powered Mentorship" },
                                { icon: CheckCircle2, text: "Verified Experience Certificates" }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="flex items-center gap-4 text-lg text-slate-300 font-medium"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-brand-orange">
                                        <feature.icon size={20} />
                                    </div>
                                    {feature.text}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Footer Quote */}
                <div className="relative z-10 text-sm text-slate-500 font-mono">
                    "Talk is cheap. Show me the code."
                </div>
            </motion.div>

            {/* Right Side - Action / Selection */}
            <div className="bg-white flex flex-col justify-center items-center p-8 lg:p-20 relative">
                <AnimatePresence mode="wait">
                    {/* Standard Content */}
                    <motion.div
                        className="max-w-md w-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-slate-900 mb-3">Get Started</h2>
                            <p className="text-slate-500">Choose your role to continue.</p>
                        </div>

                        {!registrationsAllowed && (
                            <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 text-center">
                                Registrations are currently closed. Please check back soon.
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Student Option */}
                            <motion.div
                                onClick={() => registrationsAllowed && handleNavigation('/register/student', 'student')}
                                whileHover={!isNavigating ? { scale: 1.02 } : {}}
                                whileTap={!isNavigating ? { scale: 0.98 } : {}}
                                animate={isNavigating && selection !== 'student' ? { opacity: 0.5, scale: 0.95 } : {}}
                                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-6 relative overflow-hidden ${selection === 'student'
                                    ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-105'
                                    : 'border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/50'
                                    } ${registrationsAllowed ? '' : 'opacity-60 cursor-not-allowed'}`}
                            >
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform ${selection === 'student' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600 group-hover:scale-110'
                                    }`}>
                                    {selection === 'student' && isNavigating ? (
                                        <Loader2 size={28} className="animate-spin" />
                                    ) : (
                                        <GraduationCap size={28} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold transition-colors text-lg ${selection === 'student' ? 'text-indigo-700' : 'text-slate-900'}`}>I am a Student</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Prepare for interviews & build projects.
                                    </p>
                                </div>
                                {selection === 'student' ? (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-indigo-600">
                                        <ArrowRight size={24} />
                                    </motion.div>
                                ) : (
                                    <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                )}
                            </motion.div>

                            {/* Partner Option */}
                            <motion.div
                                onClick={() => registrationsAllowed && handleNavigation('/contact', 'partner')}
                                whileHover={!isNavigating ? { scale: 1.02 } : {}}
                                whileTap={!isNavigating ? { scale: 0.98 } : {}}
                                animate={isNavigating && selection !== 'partner' ? { opacity: 0.5, scale: 0.95 } : {}}
                                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-6 relative overflow-hidden ${selection === 'partner'
                                    ? 'border-brand-orange bg-orange-50 shadow-lg scale-105'
                                    : 'border-slate-100 hover:border-brand-orange hover:bg-orange-50/50'
                                    } ${registrationsAllowed ? '' : 'opacity-60 cursor-not-allowed'}`}
                            >
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform ${selection === 'partner' ? 'bg-brand-orange text-white' : 'bg-orange-100 text-brand-orange group-hover:scale-110'
                                    }`}>
                                    {selection === 'partner' && isNavigating ? (
                                        <Loader2 size={28} className="animate-spin" />
                                    ) : (
                                        <Building2 size={28} />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className={`font-bold transition-colors text-lg ${selection === 'partner' ? 'text-brand-orange' : 'text-slate-900'}`}>Institute / Company</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Partner with us for hiring & training.
                                    </p>
                                </div>
                                {selection === 'partner' ? (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-brand-orange">
                                        <ArrowRight size={24} />
                                    </motion.div>
                                ) : (
                                    <ArrowRight className="text-slate-300 group-hover:text-brand-orange transition-colors" />
                                )}
                            </motion.div>
                        </div>

                        {/* Clarification Line for Partners */}
                        <motion.div
                            animate={isNavigating ? { opacity: 0 } : { opacity: 1 }}
                            className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center"
                        >
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                <span className="font-bold text-slate-700">Note for Organizations:</span> Institutes and Companies looking to collaborate or hire generally require a partnership discussion. Please proceed to our contact page.
                            </p>
                        </motion.div>

                        <motion.div
                            animate={isNavigating ? { opacity: 0 } : { opacity: 1 }}
                            className="mt-10 text-center"
                        >
                            <p className="text-sm text-slate-500">
                                Already have an account?{' '}
                                <Link href="/login" className="font-bold text-brand-black hover:underline hover:text-brand-orange transition-colors">
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
