'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, Clock, Settings, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CompleteProfileModal() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check local storage to see if profile has been completed or delayed
        const profileStatus = localStorage.getItem('profile_completed');

        // If not 'true' and not 'later', we show the modal.
        if (!profileStatus) {
            // Small delay so it doesn't pop up instantly on first paint
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleRemindLater = () => {
        localStorage.setItem('profile_completed', 'later');
        setIsOpen(false);
        // Dispatch an event so Navbar can update its notification badge instantly
        window.dispatchEvent(new Event('profile_status_changed'));
    };

    const handleCompleteNow = () => {
        setIsOpen(false);
        router.push('/settings');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={handleRemindLater}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
                    >
                        {/* Decorative Header Background */}
                        <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full mix-blend-overlay blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-overlay blur-2xl translate-x-1/2 translate-y-1/2"></div>
                            </div>
                            <button
                                onClick={handleRemindLater}
                                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-black/10 hover:bg-black/20 rounded-full p-2"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Icon Badge overlapping header */}
                        <div className="absolute top-32 left-8 -translate-y-1/2 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                            <div className="w-full h-full bg-orange-50 rounded-xl flex items-center justify-center text-brand-orange">
                                <GraduationCap size={28} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 pt-12">
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Complete Your Profile</h2>
                            <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                                You're almost ready! Complete your profile to unlock personalized problems, match with peers, and get better visibility from recruiters.
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={handleCompleteNow}
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-indigo-600/20 group hover:-translate-y-0.5"
                                >
                                    <Settings size={18} className="group-hover:rotate-90 transition-transform" />
                                    Complete Profile Now
                                </button>

                                <button
                                    onClick={handleRemindLater}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3.5 px-6 rounded-xl transition-colors"
                                >
                                    <Clock size={18} />
                                    I'll do it later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
