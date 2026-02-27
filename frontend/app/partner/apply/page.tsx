'use client';

import { useState } from 'react';
import { Building2, Rocket, ShieldCheck, Zap, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

type LeadFormData = {
    name: string;
    companyName: string;
    email: string;
    phone: string;
};

export default function PartnerApplyPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<LeadFormData>();

    const onSubmit = async (data: LeadFormData) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/company-leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                setIsSubmitted(true);
            } else {
                const errData = await res.json();
                alert(errData.message || 'Failed to submit application.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('A network error occurred. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden">
            {/* Nav */}
            <nav className="absolute top-0 w-full p-6 z-20 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
                <Link href="/" className="text-2xl font-black tracking-tighter text-blue-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm">E</div>
                    EMBLE
                </Link>
                <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition">
                    Standard Login
                </Link>
            </nav>

            <div className="flex-1 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                    {/* Hero Left Content */}
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-6 border border-blue-200">
                                <Building2 size={12} /> B2B Employer Portal
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                                Hire Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Engineers</span> Natively.
                            </h1>
                            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
                                Skip the noisy resumes. EMBLE partners get exclusive access to our deterministic tech talent pipeline and built-in Kanban ATS.
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0 mt-1">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Pre-Vetted Talent Only</h3>
                                    <p className="text-sm text-slate-500 mt-1">Candidates are filtered by their actual dynamic DSA and SQL workspace execution scores.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0 mt-1">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Lightning Fast ATS Tracker</h3>
                                    <p className="text-sm text-slate-500 mt-1">Launch campaigns and track candidates seamlessly through our dedicated Kanban board.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Right Content */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-8 sm:p-10 relative overflow-hidden">

                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 z-0"></div>

                        <div className="relative z-10">
                            {isSubmitted ? (
                                <div className="text-center py-12 space-y-4">
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">Request Received</h2>
                                    <p className="text-slate-600">
                                        Thank you for your interest in EMBLE. Our partnership team will review your application and provision your Industry Credentials shortly.
                                    </p>
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="mt-8 text-blue-600 font-bold hover:underline"
                                    >
                                        Submit another request
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-slate-900">Partner Application</h2>
                                        <p className="text-sm text-slate-500 mt-2">Leave your details and we will set up your corporate dashboard manually to ensure maximum security.</p>
                                    </div>

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Full Name *</label>
                                            <input
                                                {...register('name', { required: 'Name is required' })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition bg-slate-50 focus:bg-white"
                                                placeholder="e.g. Jane Doe"
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Company Name *</label>
                                            <input
                                                {...register('companyName', { required: 'Company is required' })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition bg-slate-50 focus:bg-white"
                                                placeholder="e.g. Acme Corp"
                                            />
                                            {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Work Email *</label>
                                            <input
                                                type="email"
                                                {...register('email', { required: 'Work email is required' })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition bg-slate-50 focus:bg-white"
                                                placeholder="jane@acme.com"
                                            />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number (Optional)</label>
                                            <input
                                                {...register('phone')}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition bg-slate-50 focus:bg-white"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition flex justify-center items-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed group"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 size={20} className="animate-spin" />
                                            ) : (
                                                <>
                                                    Request Access <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                        <p className="text-center text-xs text-slate-500 mt-4">
                                            By submitting, you agree to EMBLE's B2B Terms of Service.
                                        </p>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
