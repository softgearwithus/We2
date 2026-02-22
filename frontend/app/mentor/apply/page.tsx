'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Upload, Plus, Info, ChevronRight, UserCircle2, ArrowRight } from 'lucide-react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import { cn } from '@/app/lib/utils';
import Link from 'next/link';
import { submitMentorApplication } from '@/app/lib/mentors';

export default function MentorApplicationPage() {
    const [formData, setFormData] = useState({
        name: '',
        countryCode: '+91',
        phone: '',
        email: '',
        headline: '',
        bio: '',
        feeINR: '',
        feeUSD: '',
        expertise: '',
        offerings: '',
        totalExpYears: '0',
        totalExpMonths: '0',
        linkedin: '',
        weekdaysTime: '12:00 PM',
        weekendsTime: '12:00 PM'
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitMentorApplication({
            name: formData.name,
            email: formData.email,
            phone: `${formData.countryCode}${formData.phone}`,
            headline: formData.headline,
            bio: formData.bio,
            feePerMinuteInr: Number(formData.feeINR.replace(/[^0-9]/g, '')) || 0,
            expertise: formData.expertise,
            offerings: formData.offerings,
            linkedin: formData.linkedin,
            totalExperience: `${formData.totalExpYears} Years ${formData.totalExpMonths} Months`,
        });
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-brand-black">
            <Navbar />

            {/* Hero Section */}
            <div className="pt-32 pb-12 px-6 bg-white border-b border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-50/50 to-transparent pointer-events-none"></div>
                <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-black text-white text-[11px] font-bold uppercase tracking-widest mb-6">
                        <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
                        EMBLE Connect Initiative
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-brand-black tracking-tight mb-4">
                        Become an <span className="text-brand-orange">EMBLE Mentor</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl text-balance">
                        Help the next generation of engineers crack top product companies while building your personal brand and earning for your time.
                    </p>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* Left Column - Guidelines (Sticky) */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-subtle">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Info className="text-brand-orange" size={20} />
                                Who Can Apply?
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                                Connect is a premium 1:1 mentorship program. We maintain a high bar to ensure quality guidance for our students.
                            </p>

                            <ul className="space-y-5">
                                {[
                                    'Proven track record with great scores (e.g., GATE AIR < 500, Codeforces Master).',
                                    'Strong technical foundation and passion to guide others.',
                                    'Strict LinkedIn verification required to maintain community authenticity.',
                                    'Earn well by monetizing your free time while helping the community.'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className="text-brand-orange shrink-0 mt-0.5" size={16} />
                                        <span className="text-sm font-medium text-slate-700 leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                <h4 className="text-sm font-bold text-slate-900 mb-2">Why Join EMBLE?</h4>
                                <ul className="text-xs text-slate-500 space-y-2">
                                    <li>• Set your own timings and rates.</li>
                                    <li>• Monetize your expertise and free time.</li>
                                    <li>• Give back to the engineering community.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Application Form */}
                    <div className="lg:col-span-8">
                        {isSubmitted ? (
                            <div className="bg-white rounded-3xl p-10 md:p-16 border border-emerald-100 shadow-xl shadow-emerald-200/40 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                        <CheckCircle2 size={24} />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Application Submitted!</h2>
                                <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg">
                                    Thank you for applying to be an EMBLE Mentor. Our team carefully reviews every profile to maintain platform quality.
                                </p>
                                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 text-left max-w-sm mx-auto mb-8">
                                    <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                                        <Info size={16} className="text-brand-orange" />
                                        What happens next?
                                    </h4>
                                    <p className="text-sm text-slate-600">Your profile will be verified against our standards. You can expect to hear back from us or see your profile activated within <span className="font-bold text-slate-900">48 hours</span>.</p>
                                </div>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-md"
                                >
                                    Return to Dashboard
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-xl shadow-slate-200/40">

                                <h2 className="text-2xl font-extrabold text-slate-900 mb-8 pb-4 border-b border-gray-100">
                                    Application Details
                                </h2>

                                {/* Avatar */}
                                <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 border-[3px] border-white shadow-md flex items-center justify-center relative overflow-hidden group cursor-pointer">
                                        <UserCircle2 size={48} className="text-slate-300" />
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Upload className="text-white mb-1" size={16} />
                                            <span className="text-[10px] text-white font-bold uppercase tracking-wider">Upload</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 mb-1">Profile Photo <span className="text-red-500">*</span></p>
                                        <p className="text-xs text-slate-500 mb-3">Clear, professional headshot. Max 2MB.</p>
                                        <button type="button" className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                                            Choose File
                                        </button>
                                    </div>
                                </div>

                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Full Name <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Ayush Kumar" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all" maxLength={50} required />
                                            <span className="absolute right-4 top-3.5 text-xs text-slate-400">{formData.name.length}/50</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Phone Number <span className="text-red-500">*</span></label>
                                        <div className="flex gap-2">
                                            <select name="countryCode" value={formData.countryCode} onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none w-24">
                                                <option value="+91">+91</option>
                                                <option value="+1">+1</option>
                                                <option value="+44">+44</option>
                                            </select>
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all" maxLength={10} required />
                                        </div>
                                        <span className="text-[10px] text-slate-400 block text-right">0/10</span>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Email Address <span className="text-red-500">*</span></label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="professional@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all" required />
                                    </div>
                                </div>

                                {/* Headline & Bio */}
                                <div className="space-y-6 mb-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Headline <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input type="text" name="headline" value={formData.headline} onChange={handleChange} placeholder="e.g. Software Engineer II at Google" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all" maxLength={50} required />
                                            <span className="absolute right-4 top-3.5 text-xs text-slate-400">{formData.headline.length}/50</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">About / Bio <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="I am a software engineer with 5 years of experience..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all min-h-[120px] resize-y" maxLength={300} required></textarea>
                                            <span className="absolute right-4 bottom-4 text-xs text-slate-400">{formData.bio.length}/300</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8 space-y-6">
                                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            Session Pricing
                                            <span className="font-normal text-xs normal-case text-slate-500">(1:1 Connects)</span>
                                        </div>
                                    </h3>

                                    <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex gap-3 items-start">
                                        <Info className="text-brand-orange shrink-0 mt-0.5" size={16} />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Platform Fee Notice</p>
                                            <p className="text-xs text-slate-600 mt-1">EMBLE applies a standard <span className="font-bold text-brand-orange">20% deduction</span> on your set session fees to cover gateway and platform maintenance costs. You will receive 80% directly to your registered account.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-700">Session Fee (per min in INR) <span className="text-red-500">*</span></label>
                                                <input type="text" name="feeINR" value={formData.feeINR} onChange={handleChange} placeholder="e.g. ₹10/min" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all" required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400">Display Fee (per min in INR)</label>
                                                <input type="text" disabled value="0" className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-700">Session Fee (per min in USD)</label>
                                                <input type="text" name="feeUSD" value={formData.feeUSD} onChange={handleChange} placeholder="e.g. $1/min" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400">Display Fee (per min in USD)</label>
                                                <input type="text" disabled value="0.000" className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expertise & Offerings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Expertise <span className="text-red-500">*</span></label>
                                        <input type="text" name="expertise" value={formData.expertise} onChange={handleChange} placeholder="e.g. React, Node.js, System Design" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Offerings <span className="text-red-500">*</span></label>
                                        <input type="text" name="offerings" value={formData.offerings} onChange={handleChange} placeholder="e.g. Resume Review, Mock Interviews" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all" required />
                                    </div>
                                </div>

                                {/* Experience & Qualifications */}
                                <div className="space-y-8 mb-8 pb-8 border-b border-gray-100">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 block">Total Experience <span className="text-red-500">*</span></label>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <select name="totalExpYears" value={formData.totalExpYears} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none flex-1">
                                                    {[...Array(21)].map((_, i) => <option key={i} value={i}>{i} Years</option>)}
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <select name="totalExpMonths" value={formData.totalExpMonths} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none flex-1">
                                                    {[...Array(12)].map((_, i) => <option key={i} value={i}>{i} Months</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border border-dashed border-slate-300 bg-slate-50 rounded-2xl p-5 hover:border-brand-orange/50 transition-colors cursor-pointer group">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-orange transition-colors">Experience <span className="text-red-500">*</span></h4>
                                            <p className="text-xs text-slate-500 mt-0.5">Add your professional work history</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-brand-orange transition-colors">
                                            <Plus size={16} strokeWidth={3} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border border-dashed border-slate-300 bg-slate-50 rounded-2xl p-5 hover:border-brand-orange/50 transition-colors cursor-pointer group">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-orange transition-colors">Qualifications <span className="text-red-500">*</span></h4>
                                            <p className="text-xs text-slate-500 mt-0.5">Add your educational background</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-brand-orange transition-colors">
                                            <Plus size={16} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>

                                {/* LinkedIn */}
                                <div className="space-y-2 mb-8 pb-8 border-b border-gray-100">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">LinkedIn Profile <span className="text-red-500">*</span></label>
                                    <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://www.linkedin.com/in/your-profile/" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all" required />
                                    <p className="text-[11px] text-brand-orange font-medium mt-1">Verification is strictly required before application approval.</p>
                                </div>

                                {/* Availability */}
                                <div className="mb-10">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 block">Usual Online Time</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-600">Weekdays</span>
                                            <input type="time" name="weekdaysTime" value={formData.weekdaysTime.replace(' PM', '')} onChange={handleChange} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-600">Weekends</span>
                                            <input type="time" name="weekendsTime" value={formData.weekendsTime.replace(' PM', '')} onChange={handleChange} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
                                    <button type="button" className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                        Save Draft
                                    </button>
                                    <button type="submit" className="w-full sm:w-auto flex-1 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-brand-orange hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2">
                                        Submit Application
                                        <ArrowRight size={16} />
                                    </button>
                                </div>

                            </form>
                        )}
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
