'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, HelpCircle, Code2, Building, School, ArrowRight, X, Check, ChevronDown, ChevronUp, Zap, Rocket } from 'lucide-react';
import { cn } from '@/app/lib/utils';

import PricingCard from '@/app/components/pricing/PricingCard';
import LeadForm from '@/app/components/pricing/LeadForm';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const TABS = [
    { id: 'students', label: 'For Students', icon: Code2 },
    { id: 'institutes', label: 'For Institutes', icon: School },
    { id: 'companies', label: 'For Companies', icon: Building },
];

const STANDARD_PLAN = {
    title: 'Emble Standard',
    price: '₹449',
    period: 'month',
    description: 'The essential full-stack career starter.',
    features: [
        { text: 'Full Stack Placement Bootcamp', included: true },
        { text: 'Job Simulation (Basic Access)', included: true },
        { text: '5 AI Voice Interviews / mo', included: true },
        { text: '1 Full AI Video Interview / mo', included: true },
        { text: '3 ATS Resume Scans / mo', included: true },
        { text: 'Basic Project Reviews', included: true },
    ],
    ctaText: 'Start Standard',
    variant: 'default' as const,
    planId: 'standard_tier',
    savings: 'Effective: ₹15/day'
};

const PRO_PLAN = {
    title: 'Emble Pro',
    price: '₹799',
    period: 'month',
    description: 'Maximum impact. Unlimited simulations & priority access.',
    features: [
        { text: 'Everything in Standard', included: true },
        { text: 'Unlimited Job Simulation Access', included: true },
        { text: '15 AI Voice Interviews / mo', included: true },
        { text: '3 Full AI Video Interviews / mo', included: true },
        { text: '10 ATS Resume Scans / mo', included: true },
        { text: 'Senior Dev Project Reviews', included: true },
        { text: 'Verified Experience Certificate', included: true },
    ],
    ctaText: 'Get Pro Access',
    variant: 'premium' as const,
    savings: 'Effective: ₹26/day',
    badgeText: 'Most Popular',
    planId: 'pro_tier',
};

const PLANS = [STANDARD_PLAN, PRO_PLAN];

const ALL_FEATURES = [
    { category: 'Core Curriculum', name: 'Placement Bootcamp', std: true, pro: true },
    { category: 'Experience', name: 'Job Simulation Access', std: 'Basic', pro: 'Unlimited' },
    { category: 'Experience', name: 'Verified Certificate', std: false, pro: true },
    { category: 'AI Practice', name: 'AI Voice Interviews', std: '5/mo', pro: '15/mo' },
    { category: 'AI Practice', name: 'AI Video Interviews', std: '1/mo', pro: '3/mo' },
    { category: 'Career Tools', name: 'ATS Resume Scans', std: '3/mo', pro: '10/mo' },
    { category: 'Mentorship', name: 'Project Reviews', std: 'Automated', pro: 'Senior Dev' },
    { category: 'Support', name: 'Priority Support', std: false, pro: true },
];

export default function PricingPage() {
    const [activeTab, setActiveTab] = useState('students');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [showComparison, setShowComparison] = useState(false);

    return (
        <div className="min-h-screen bg-white font-sans text-brand-black relative selection:bg-brand-orange-hover selection:text-white">
            <Navbar />

            <main className="relative z-10 pt-32 pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-6">
                            Invest In Your Future
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-brand-black tracking-tight mb-6 leading-tight">
                            One Subscription. <br />
                            <span className="text-brand-orange">Complete Career Acceleration.</span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            From learning the basics to shipping production code in our job simulation. Everything you need to get hired.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-center mb-16">
                        <div className="bg-white p-1.5 rounded-2xl inline-flex gap-1 shadow-subtle border border-gray-200">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                                            isActive
                                                ? "bg-brand-black text-white shadow-md"
                                                : "text-gray-500 hover:text-brand-black hover:bg-gray-50"
                                        )}
                                    >
                                        <Icon size={18} className={isActive ? "text-brand-orange" : "text-gray-400"} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'students' && (
                                <div className="space-y-16">
                                    {/* Billing Toggle */}
                                    <div className="flex justify-center items-center gap-4 mb-8">
                                        <span className={cn("text-sm font-bold", billingCycle === 'monthly' ? "text-brand-black" : "text-gray-400")}>Monthly</span>
                                        <button
                                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                            className="w-14 h-8 bg-gray-200 rounded-full relative transition-colors focus:outline-none hover:bg-gray-300"
                                        >
                                            <div className={cn(
                                                "w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-md",
                                                billingCycle === 'monthly' ? "left-1" : "left-7 bg-brand-orange"
                                            )}></div>
                                        </button>
                                        <span className={cn("text-sm font-bold flex items-center gap-2", billingCycle === 'yearly' ? "text-brand-black" : "text-gray-400")}>
                                            Yearly
                                            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-bold">Save 20%</span>
                                        </span>
                                    </div>

                                    {/* ROI Message */}
                                    <div className="text-center mb-10">
                                        <p className="text-sm font-medium text-gray-500 bg-white inline-block px-4 py-2 rounded-full shadow-subtle border border-gray-100">
                                            💡 <span className="text-brand-orange font-bold">Emble Promise:</span> Master the stack, get the experience, land the job.
                                        </p>
                                    </div>

                                    {/* Pricing Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch pt-4 max-w-5xl mx-auto">
                                        {PLANS.map((plan, idx) => (
                                            <PricingCard
                                                key={plan.title}
                                                {...plan}
                                                price={billingCycle === 'yearly' ? `₹${Math.round(parseInt(plan.price.replace('₹', '')) * 12 * 0.8)}` : plan.price}
                                                period={billingCycle === 'yearly' ? 'year' : 'month'}
                                                delay={idx}
                                                billingCycle={billingCycle}
                                                onCtaClick={() => console.log('Clicked', plan.title)}
                                            />
                                        ))}
                                    </div>

                                    {/* Comparison Table Toggle */}
                                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-subtle border border-gray-200 overflow-hidden">
                                        <button
                                            onClick={() => setShowComparison(!showComparison)}
                                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="font-bold text-brand-black">Compare Plans in Detail</span>
                                            {showComparison ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                        </button>

                                        <AnimatePresence>
                                            {showComparison && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: 'auto' }}
                                                    exit={{ height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="border-t border-gray-100 p-6 overflow-x-auto">
                                                        <table className="w-full text-sm text-left">
                                                            <thead>
                                                                <tr className="border-b border-gray-100">
                                                                    <th className="py-3 font-medium text-gray-500">Feature</th>
                                                                    <th className="py-3 font-bold text-brand-black text-center">Standard</th>
                                                                    <th className="py-3 font-bold text-brand-orange text-center">Pro</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {ALL_FEATURES.map((feat, i) => (
                                                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                                        <td className="py-3 font-medium text-gray-700">{feat.name}</td>
                                                                        <td className="py-3 text-center text-gray-500">
                                                                            {typeof feat.std === 'string' ? (
                                                                                <span className="font-semibold text-slate-700">{feat.std}</span>
                                                                            ) : (feat.std ? <Check size={16} className="mx-auto text-emerald-500" /> : <MinusIcon />)}
                                                                        </td>
                                                                        <td className="py-3 text-center text-gray-500">
                                                                            {typeof feat.pro === 'string' ? (
                                                                                <span className="font-bold text-brand-orange">{feat.pro}</span>
                                                                            ) : (feat.pro ? <Check size={16} className="mx-auto text-brand-orange" /> : <MinusIcon />)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Trust Badges */}
                                    <div className="mt-20 pt-10 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-sm font-medium">
                                        <div className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-2 rounded-full shadow-sm">
                                            <ShieldCheck size={18} className="text-emerald-500" />
                                            <span>Secure SSL Payment</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-2 rounded-full shadow-sm">
                                            <CheckCircle2 size={18} className="text-emerald-500" />
                                            <span>14-Day Money Back Guarantee</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-2 rounded-full shadow-sm">
                                            <HelpCircle size={18} className="text-emerald-500" />
                                            <span>24/7 Priority Support</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'institutes' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                    <div className="space-y-8">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-brand-orange text-[11px] font-bold uppercase tracking-widest border border-orange-100">
                                            Institutional Partner Program
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-bold text-brand-black leading-tight">
                                            Empower Your Campus with <br />
                                            <span className="text-brand-orange bg-orange-50 px-2 rounded-lg -ml-2">Emble</span>
                                        </h2>
                                        <p className="text-lg text-gray-500 leading-relaxed">
                                            Integrate our job simulation and placement prep directly into your curriculum.
                                        </p>
                                        <ul className="space-y-4 pt-4">
                                            {[
                                                'Real-time Student Progress Analytics',
                                                'Customizable Coding Curriculums',
                                                'Automated Assessment & Grading',
                                                'Placement Readiness Reports',
                                                'White-labelled LMS Integration'
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-lg text-gray-700 font-medium">
                                                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                                        <CheckCircle2 size={14} strokeWidth={3} />
                                                    </div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <LeadForm type="Institute" />
                                </div>
                            )}

                            {activeTab === 'companies' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                    <div className="space-y-8 order-2 lg:order-1">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-black text-white text-[11px] font-bold uppercase tracking-widest">
                                            Corporate Hiring Solutions
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-bold text-brand-black leading-tight">
                                            Hire Emble Vetted Developers <br />
                                            <span className="text-brand-orange bg-orange-50 px-2 rounded-lg -ml-2">Zero Friction</span>
                                        </h2>
                                        <p className="text-lg text-gray-500 leading-relaxed">
                                            Access candidates who have proven themselves in our realistic job simulations.
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-premium group hover:-translate-y-1 transition-transform cursor-default">
                                                <div className="text-3xl font-bold text-brand-black mb-1 group-hover:text-brand-orange transition-colors">70%</div>
                                                <div className="text-xs text-gray-500 uppercase tracking-bold font-bold">Faster Hiring</div>
                                                <p className="text-xs text-gray-400 mt-2">Compared to traditional campus drives.</p>
                                            </div>
                                            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-premium group hover:-translate-y-1 transition-transform cursor-default">
                                                <div className="text-3xl font-bold text-brand-black mb-1 group-hover:text-brand-orange transition-colors">10k+</div>
                                                <div className="text-xs text-gray-500 uppercase tracking-bold font-bold">Vetted Devs</div>
                                                <p className="text-xs text-gray-400 mt-2">Ready to contribute from Day 1.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="order-1 lg:order-2">
                                        <LeadForm type="Company" />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function MinusIcon() {
    return <div className="w-4 h-0.5 bg-slate-200 mx-auto rounded-full" />;
}
