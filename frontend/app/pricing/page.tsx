'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, HelpCircle, Code2, Building, School, ArrowRight, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/app/lib/utils';

import PricingCard from '@/app/components/pricing/PricingCard';
import LeadForm from '@/app/components/pricing/LeadForm';
import DotBackground from '@/app/components/ui/DotBackground';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const TABS = [
    { id: 'students', label: 'For Students', icon: Code2 },
    { id: 'institutes', label: 'For Institutes', icon: School },
    { id: 'companies', label: 'For Companies', icon: Building },
];

const PLACEMENT_PLUS = {
    title: 'Prep0: Placement Readiness',
    price: '₹799',
    period: 'month',
    description: 'Master Data Structures & Algorithms and crack technical interviews.',
    features: [
        { text: 'Full DSA Prep Dashboard', included: true },
        { text: '100+ Top Company Problems', included: true },
        { text: 'AI Hints & Optimization', included: true },
        { text: 'Unlimited IDE Submissions', included: true },
        { text: 'Mock Technical Interviews', included: true },
        { text: 'Resume Analytics', included: true },
        { text: 'Progress Tracking', included: true },
        { text: 'Placement Readiness Score', included: true },
    ],
    ctaText: 'Start Prep',
    variant: 'default' as const,
    planId: 'placement_plus',
};

const INDUSTRY_PLUS = {
    title: 'We2Hub: Industrial Simulation',
    price: '₹999',
    period: 'month',
    description: 'Experience real-world software development in a simulated corporate environment.',
    features: [
        { text: '21-Day Industry Simulation', included: true },
        { text: 'Agile Workflow Training', included: true },
        { text: 'Real-world Feature Dev', included: true },
        { text: 'Bug Fixing & Production Issues', included: true },
        { text: 'Code Review Experience', included: true },
        { text: 'Team Collaboration Sims', included: true },
        { text: 'Project Presentation Grading', included: true },
        { text: 'Verified Experience Cert', included: true },
    ],
    ctaText: 'Start Simulation',
    variant: 'default' as const,
    planId: 'industry_plus',
};

const ULTIMATE_PACK = {
    title: 'We2 Max: Ultimate Career',
    price: '₹1499',
    period: 'month',
    description: 'The complete package. Master coding and gain industry experience together.',
    features: [
        { text: 'Everything in Placement Plus', included: true },
        { text: 'Everything in Industry Plus', included: true },
        { text: 'Recruiter Visibility Badge', included: true },
        { text: 'Advanced AI Mentor', included: true },
        { text: 'Combined Analytics Dashboard', included: true },
        { text: 'Priority Support', included: true },
        { text: 'Exclusive Hiring Challenges', included: true },
        { text: 'Early Access to Features', included: true },
    ],
    ctaText: 'Get Ultimate Access',
    variant: 'premium' as const,
    savings: 'Save ₹300/mo',
    badgeText: 'Highest Success Rate',
    planId: 'we2_max',
};

const ALL_FEATURES = [
    { category: 'Preparation', name: 'DSA Dashboard', p: true, i: false, u: true },
    { category: 'Preparation', name: 'Company Problems', p: true, i: false, u: true },
    { category: 'Preparation', name: 'AI Hints', p: true, i: false, u: true },
    { category: 'Simulation', name: 'Industry Simulation', p: false, i: true, u: true },
    { category: 'Simulation', name: 'Agile Workflow', p: false, i: true, u: true },
    { category: 'Simulation', name: 'Code Reviews', p: false, i: true, u: true },
    { category: 'Career', name: 'Resume Analytics', p: true, i: false, u: true },
    { category: 'Career', name: 'Recruiter Badge', p: false, i: false, u: true },
    { category: 'Career', name: 'Verified Certificate', p: true, i: true, u: true },
    { category: 'Support', name: 'Priority Support', p: false, i: false, u: true },
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
                            Invest In Your Career
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-brand-black tracking-tight mb-6 leading-tight">
                            Plans that pay for <br />
                            <span className="text-brand-orange">themselves.</span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            Choose the path that fits your goals. From cracking interviews to mastering industrial workflows.
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
                                            💡 <span className="text-brand-orange font-bold">ROI Fact:</span> Less than the cost of a weekend outing, but builds a career that pays for a lifetime.
                                        </p>
                                    </div>

                                    {/* Pricing Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4">
                                        {[PLACEMENT_PLUS, INDUSTRY_PLUS, ULTIMATE_PACK].map((plan, idx) => (
                                            <PricingCard
                                                key={plan.title}
                                                {...plan}
                                                price={billingCycle === 'yearly' ? `₹${Math.round(parseInt(plan.price.replace('₹', '')) * 12 * 0.8)}` : plan.price}
                                                period={billingCycle === 'yearly' ? 'year' : 'month'}
                                                delay={idx}
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
                                                                    <th className="py-3 font-bold text-brand-black text-center">Prep0</th>
                                                                    <th className="py-3 font-bold text-brand-black text-center">We2Hub</th>
                                                                    <th className="py-3 font-bold text-brand-orange text-center">We2 Max</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {ALL_FEATURES.map((feat, i) => (
                                                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                                        <td className="py-3 font-medium text-gray-700">{feat.name}</td>
                                                                        <td className="py-3 text-center text-gray-500">{feat.p ? <Check size={16} className="mx-auto text-emerald-500" /> : <MinusIcon />}</td>
                                                                        <td className="py-3 text-center text-gray-500">{feat.i ? <Check size={16} className="mx-auto text-emerald-500" /> : <MinusIcon />}</td>
                                                                        <td className="py-3 text-center text-gray-500">{feat.u ? <Check size={16} className="mx-auto text-brand-orange" /> : <MinusIcon />}</td>
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
                                            Transform your Campus into a <br />
                                            <span className="text-brand-orange bg-orange-50 px-2 rounded-lg -ml-2">Tech Talent Hub</span>
                                        </h2>
                                        <p className="text-lg text-gray-500 leading-relaxed">
                                            Give your students the edge they need. Integrate our industry-grade simulations directly into your curriculum.
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
                                            Hire Vetted Developers <br />
                                            <span className="text-brand-orange bg-orange-50 px-2 rounded-lg -ml-2">Zero Friction</span>
                                        </h2>
                                        <p className="text-lg text-gray-500 leading-relaxed">
                                            Skip the resume screening. Access a pool of candidates who have already proven their skills in realistic industry simulations.
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
