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
import { fetchPublicPlatformSettings } from '@/app/lib/admin-settings';

const TABS = [
    { id: 'students', label: 'For Students', icon: Code2 },
    { id: 'institutes', label: 'For Institutes', icon: School },
    { id: 'companies', label: 'For Companies', icon: Building },
];

type DurationType = '1m' | '3m' | '6m' | '12m';

const DURATION_OPTIONS = [
    { id: '1m', label: '1 Month' },
    { id: '3m', label: '3 Months' },
    { id: '6m', label: '6 Months' },
    { id: '12m', label: '12 Months' }
];

type PlanFeature = { text: string; included: boolean };
type PlanPricing = { price: string; period: string; id: string; savings?: string };

type PlanType = {
    title: string;
    internalName: string;
    description: string;
    features: PlanFeature[];
    ctaText: string;
    variant: 'default' | 'premium' | 'popular';
    badgeText?: string;
    pricing: Record<DurationType, PlanPricing>;
};

const STANDARD_PLAN: PlanType = {
    title: 'EMBLE Standard',
    internalName: 'standard',
    description: 'Perfect for maintaining skills & light practice.',
    features: [
        { text: 'Full-Stack Web Projects', included: true },
        { text: 'Company-Specific DSA & SQL', included: true },
        { text: 'GitHub & Cloud Deployments', included: true },
        { text: 'Industry Intelligence Hub', included: true },
        { text: '5 Interactive AI Voice Interviews/mo', included: true },
        { text: '1 Full AI Video Interview/mo', included: true },
        { text: 'AI Resume Builder & ATS Scans', included: true },
    ],
    ctaText: 'Get Standard Access',
    variant: 'default' as const,
    pricing: {
        '1m': { price: '₹449', period: 'month', id: 'standard_1m', savings: 'Effective: ₹15/day' },
        '3m': { price: '₹1,199', period: '3 months', id: 'standard_3m', savings: 'Effective: ₹13/day' },
        '6m': { price: '₹2,199', period: '6 months', id: 'standard_6m', savings: 'Effective: ₹12/day' },
        '12m': { price: '₹3,999', period: 'year', id: 'standard_12m', savings: 'Effective: ₹11/day' },
    }
};

const PRO_PLAN = {
    title: 'EMBLE Pro',
    internalName: 'pro',
    description: 'For serious job seekers who need intense practice.',
    features: [
        { text: 'Everything in Standard', included: true },
        { text: '15 Interactive AI Voice Interviews/mo', included: true },
        { text: '3 Full AI Video Interviews/mo', included: true },
        { text: 'Verified Skill Scorecard', included: true },
        { text: 'Direct MNC Hiring Network', included: true },
        { text: '24/7 Priority AI Support', included: true },
    ],
    ctaText: 'Get Pro Access',
    variant: 'premium' as const,
    badgeText: 'Best Value',
    pricing: {
        '1m': { price: '₹799', period: 'month', id: 'pro_1m', savings: 'Effective: ₹26/day' },
        '3m': { price: '₹2,199', period: '3 months', id: 'pro_3m', savings: 'Effective: ₹24/day' },
        '6m': { price: '₹3,999', period: '6 months', id: 'pro_6m', savings: 'Effective: ₹22/day' },
        '12m': { price: '₹7,470', period: 'year', id: 'pro_12m', savings: 'Effective: ₹20/day' },
    }
};

const PLANS: PlanType[] = [STANDARD_PLAN, PRO_PLAN];

const ALL_FEATURES = [
    { category: 'Foundation', name: 'Company-Specific DSA & SQL', std: true, pro: true },
    { category: 'Real-World Experience', name: 'Full-Stack Web Projects', std: true, pro: true },
    { category: 'Real-World Experience', name: 'GitHub & Cloud Deployments', std: true, pro: true },
    { category: 'Interview Practice', name: 'AI Voice Interviews', std: '5/mo', pro: '15/mo' },
    { category: 'Interview Practice', name: 'AI Video Interviews', std: '1/mo', pro: '3/mo' },
    { category: 'Career Growth', name: 'AI Resume Builder & ATS Scans', std: true, pro: true },
    { category: 'Career Growth', name: 'Verified Skill Scorecard', std: false, pro: true },
    { category: 'Career Growth', name: 'Direct MNC Hiring Network', std: false, pro: true },
    { category: 'Support', name: '24/7 Priority AI Support', std: false, pro: true },
];

export default function PricingPage() {
    const [activeTab, setActiveTab] = useState('students');
    const [duration, setDuration] = useState<DurationType>('3m');
    const [showComparison, setShowComparison] = useState(false);
    const [upgradesLocked, setUpgradesLocked] = useState(true); // Default to locked
    const [dynamicPlans, setDynamicPlans] = useState<PlanType[]>(PLANS);

    React.useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await fetchPublicPlatformSettings();
                setUpgradesLocked(!settings.upgradesEnabled);

                if (settings.subscriptionPrices) {
                    const clonedPlans = JSON.parse(JSON.stringify(PLANS)) as PlanType[];

                    const stdPlan = clonedPlans.find(p => p.internalName === 'standard');
                    const proPlan = clonedPlans.find(p => p.internalName === 'pro');

                    if (stdPlan && settings.subscriptionPrices.standard) {
                        Object.keys(settings.subscriptionPrices.standard).forEach((key) => {
                            const val = settings.subscriptionPrices?.standard[key];
                            if (stdPlan.pricing[key as DurationType] && val !== undefined) {
                                stdPlan.pricing[key as DurationType].price = `₹${val.toLocaleString()}`;
                            }
                        });
                    }

                    if (proPlan && settings.subscriptionPrices.pro) {
                        Object.keys(settings.subscriptionPrices.pro).forEach((key) => {
                            const val = settings.subscriptionPrices?.pro[key];
                            if (proPlan.pricing[key as DurationType] && val !== undefined) {
                                proPlan.pricing[key as DurationType].price = `₹${val.toLocaleString()}`;
                            }
                        });
                    }

                    setDynamicPlans(clonedPlans);
                }
            } catch (err) {
                console.error("Failed to fetch public pricing settings", err);
            }
        };
        loadSettings();
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-brand-black relative selection:bg-brand-orange-hover selection:text-white">
            <Navbar />

            <main className="relative z-10 pt-20 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-10 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-4">
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
                    <div className="flex justify-center mb-10">
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
                                <div className="space-y-6">
                                    {/* Duration Selector */}
                                    <div className="flex justify-center mb-8">
                                        <div className="bg-gray-50 p-1.5 rounded-[20px] inline-flex items-center gap-1 border border-gray-200">
                                            {DURATION_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setDuration(opt.id as DurationType)}
                                                    className={cn(
                                                        "px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 relative",
                                                        duration === opt.id
                                                            ? "bg-white text-brand-orange shadow-md ring-1 ring-gray-200"
                                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                                    )}
                                                >
                                                    {opt.label}
                                                    {opt.id === '3m' && (
                                                        <span className="absolute -top-3 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm rotate-3">
                                                            Popular
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ROI Message */}
                                    <div className="text-center mb-4">
                                        <p className="text-sm font-medium text-gray-500 bg-white inline-block px-4 py-2 rounded-full shadow-subtle border border-gray-100">
                                            💡 <span className="text-brand-orange font-bold">ROI Fact:</span> Less than the cost of a weekend outing, but builds a career that pays for a lifetime.
                                        </p>
                                    </div>

                                    {/* Pricing Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch pt-2 max-w-5xl mx-auto">
                                        {dynamicPlans.map((plan, idx) => {
                                            const activePricing = plan.pricing[duration];

                                            // Provide pseudo-original prices purely for cross-card anchoring psychology if desired
                                            let displayOriginalPrice = undefined;
                                            if (duration === '3m' && plan.title.includes('Standard')) displayOriginalPrice = '₹1,347';
                                            if (duration === '6m' && plan.title.includes('Standard')) displayOriginalPrice = '₹2,694';
                                            if (duration === '12m' && plan.title.includes('Standard')) displayOriginalPrice = '₹5,388';

                                            if (duration === '3m' && plan.title.includes('Pro')) displayOriginalPrice = '₹2,397';
                                            if (duration === '6m' && plan.title.includes('Pro')) displayOriginalPrice = '₹4,794';
                                            if (duration === '12m' && plan.title.includes('Pro')) displayOriginalPrice = '₹9,588';

                                            return (
                                                <PricingCard
                                                    key={plan.title}
                                                    title={plan.title}
                                                    description={plan.description}
                                                    features={plan.features}
                                                    variant={plan.variant}
                                                    badgeText={plan.badgeText}
                                                    ctaText={plan.ctaText}
                                                    price={activePricing.price}
                                                    period={activePricing.period}
                                                    originalPrice={displayOriginalPrice}
                                                    savings={activePricing.savings}
                                                    planId={activePricing.id}
                                                    delay={idx}
                                                    onCtaClick={() => console.log('Clicked', plan.title)}
                                                    isUpgradeLocked={upgradesLocked}
                                                />
                                            );
                                        })}
                                    </div>

                                    {upgradesLocked && (
                                        <div className="text-center">
                                            <p className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full">
                                                Upgrades are temporarily paused. Please check back soon.
                                            </p>
                                        </div>
                                    )}

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
                                                                    <th className="py-2 font-medium text-gray-500">Feature</th>
                                                                    <th className="py-2 font-bold text-brand-black text-center">Standard</th>
                                                                    <th className="py-2 font-bold text-brand-orange text-center">Pro</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {ALL_FEATURES.map((feat, i) => (
                                                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                                        <td className="py-2 font-medium text-gray-700">{feat.name}</td>
                                                                        <td className="py-2 text-center text-gray-500">
                                                                            {typeof feat.std === 'string' ? (
                                                                                <span className="font-semibold text-slate-700">{feat.std}</span>
                                                                            ) : (feat.std ? <Check size={16} className="mx-auto text-emerald-500" /> : <MinusIcon />)}
                                                                        </td>
                                                                        <td className="py-2 text-center text-gray-500">
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
                                        <div className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all">
                                            <ShieldCheck size={18} className="text-emerald-500" />
                                            <span>Secure SSL Payment</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white border border-brand-orange/20 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all">
                                            <Building size={18} className="text-brand-orange animate-pulse" />
                                            <span className="text-brand-black font-bold">Priority Placement Connect</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all">
                                            <HelpCircle size={18} className="text-indigo-500" />
                                            <span>Cancel Anytime Control</span>
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
