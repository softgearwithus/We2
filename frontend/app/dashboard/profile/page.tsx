'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Trophy, Medal, Star, Zap, Target, User, MapPin,
    Calendar, TrendingUp, Award, Code, Briefcase,
    CheckCircle2, Flame, Crown, ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

const PLAN_LABELS: Record<string, string> = {
    standard_tier: 'Standard',
    pro_tier: 'Pro',
    placement_plus: 'Placement Plus',
    industry_plus: 'Industry Plus',
    we2_max: 'We2 Max',
};

export default function ProfilePage() {
    const { user: authUser } = useAuth();
    const subscriptionPlan = authUser?.subscriptionPlan || 'free';
    const subscriptionStatus = authUser?.subscriptionStatus || 'inactive';

    const planLabel = PLAN_LABELS[subscriptionPlan] || subscriptionPlan;
    const isActive = subscriptionStatus === 'active' && !!authUser?.subscriptionEndDate;
    const isPremium = isActive && subscriptionPlan !== 'free';

    const expiresAt = useMemo(() => {
        if (!authUser?.subscriptionEndDate) return null;
        const date = new Date(authUser.subscriptionEndDate);
        return Number.isNaN(date.getTime()) ? null : date;
    }, [authUser?.subscriptionEndDate]);

    const daysLeft = useMemo(() => {
        if (!expiresAt) return null;
        const diffMs = expiresAt.getTime() - Date.now();
        return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }, [expiresAt]);

    const isExpired = expiresAt ? expiresAt.getTime() <= Date.now() : false;

    const displayName = authUser?.firstName || authUser?.lastName
        ? `${authUser?.firstName || ''} ${authUser?.lastName || ''}`.trim()
        : (authUser?.email?.split('@')[0] || 'Learner');

    const user = {
        name: displayName,
        role: 'Full Stack Aspirant',
        level: 42,
        xp: 12500,
        nextLevelXp: 15000,
        rank: 'Diamond I',
        streak: 15,
        location: 'Mumbai, India',
        joined: 'Sept 2024'
    };

    const stats = [
        { label: 'Problems Solved', value: '1,240', icon: Code, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Interviews Aced', value: '12', icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Projects Built', value: '8', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Skill Score', value: 'Top 5%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    ];

    const badges = [
        { id: 1, name: 'Code Warrior', icon: '⚔️', desc: 'Solved 100+ Problems', earned: true },
        { id: 2, name: 'Bug Hunter', icon: '🐛', desc: 'Fixed 50+ Issues', earned: true },
        { id: 3, name: 'Night Owl', icon: '🦉', desc: 'Coded after 2 AM', earned: true },
        { id: 4, name: 'Team Player', icon: '🤝', desc: '5 Group Projects', earned: false },
        { id: 5, name: 'Algo Master', icon: '🧠', desc: 'Solved 50 Hard Problems', earned: false },
        { id: 6, name: 'Streak God', icon: '🔥', desc: '30 Day Streak', earned: false },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-10 space-y-8">
            {/* Header / Banner */}
            <div className={`relative rounded-3xl overflow-hidden text-white shadow-xl shadow-slate-200 ${isPremium ? 'bg-gradient-to-br from-[#1f1a0a] via-[#2a2008] to-[#1b1b1b]' : 'bg-slate-900'}`}>
                {/* Background Pattern */}
                <div className={`absolute inset-0 opacity-20 ${isPremium ? 'mix-blend-screen' : ''}`}>
                    <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl ${isPremium ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
                    <div className={`absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl ${isPremium ? 'bg-orange-400' : 'bg-purple-500'}`}></div>
                </div>

                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className={`w-32 h-32 rounded-full overflow-hidden shadow-2xl relative bg-slate-800 ${isPremium ? 'border-4 border-amber-300/50 shadow-amber-200/30' : 'border-4 border-white/20'}`}>
                            <Image
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                                alt="Avatar"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className={`absolute -bottom-2 -right-2 p-2 rounded-full border-4 shadow-lg ${isPremium ? 'bg-gradient-to-r from-amber-400 to-orange-500 border-[#1f1a0a]' : 'bg-gradient-to-r from-amber-400 to-orange-500 border-slate-900'}`} title="Current Rank">
                            {isPremium ? <Crown size={20} className="text-white fill-white" /> : <Trophy size={20} className="text-white fill-white" />}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-extrabold tracking-tight">{user.name}</h1>
                                {isPremium ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-200 border border-amber-300/30">
                                        <Crown size={12} /> Premium
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-slate-800/60 text-slate-300 border border-white/10">
                                        Free Plan
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
                                {user.role} •
                                <span className="flex items-center gap-1 text-emerald-400"><MapPin size={14} /> {user.location}</span>
                            </p>
                        </div>

                        {/* Level Progress */}
                        <div className="w-full max-w-md bg-slate-800/50 rounded-full h-4 relative overflow-hidden backdrop-blur-sm border border-white/5 mx-auto md:mx-0">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(user.xp / user.nextLevelXp) * 100}%` }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            />
                        </div>
                        <div className="flex justify-between max-w-md text-xs font-bold text-slate-400 uppercase tracking-widest mx-auto md:mx-0">
                            <span>Lvl {user.level}</span>
                            <span>{user.xp} / {user.nextLevelXp} XP</span>
                        </div>
                    </div>

                    {/* Quick Stats (Streak) */}
                    <div className="flex flex-col items-center gap-2 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                        <Flame size={32} className="text-orange-500 animate-pulse" fill="currentColor" />
                        <div>
                            <div className="text-2xl font-black text-white">{user.streak} Days</div>
                            <div className="text-xs font-bold text-slate-400 uppercase">Current Streak</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`rounded-2xl border p-5 shadow-sm ${isPremium ? 'bg-gradient-to-r from-amber-50 via-white to-white border-amber-100' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPremium ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Subscription</div>
                            <div className="text-lg font-extrabold text-slate-900">{planLabel}</div>
                            <div className="text-xs text-slate-500 font-medium">
                                {isActive && expiresAt
                                    ? `Active • ${daysLeft ?? 0} days left`
                                    : isExpired
                                        ? 'Expired'
                                        : 'Inactive'}
                            </div>
                        </div>
                        <div className="ml-auto">
                            {isPremium && isActive ? (
                                <Link
                                    href="/pricing"
                                    className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-2 rounded-lg border border-amber-200 hover:bg-amber-200"
                                >
                                    Manage Plan
                                </Link>
                            ) : (
                                <Link
                                    href="/pricing"
                                    className="inline-flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-brand-orange to-red-500 px-3 py-2 rounded-lg shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40"
                                >
                                    Upgrade
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Renewal</div>
                            <div className="text-lg font-extrabold text-slate-900">
                                {expiresAt ? expiresAt.toLocaleDateString() : '—'}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                                {expiresAt ? 'Next billing date' : 'No active plan'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900">{stat.value}</h3>
                        <p className="text-sm font-bold text-slate-400">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Badges Section */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                            <Medal className="text-indigo-500" /> Achievements
                        </h2>
                        <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {badges.map((badge) => (
                            <div
                                key={badge.id}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center gap-3 transition-all cursor-default
                                    ${badge.earned
                                        ? 'border-indigo-100 bg-indigo-50/50'
                                        : 'border-slate-100 bg-slate-50 opacity-60 grayscale'}
                                `}
                            >
                                <div className="text-4xl filter drop-shadow-sm">{badge.icon}</div>
                                <div>
                                    <h3 className={`font-bold text-sm ${badge.earned ? 'text-slate-900' : 'text-slate-500'}`}>{badge.name}</h3>
                                    <p className="text-xs text-slate-400 mt-1">{badge.desc}</p>
                                </div>
                                {badge.earned && (
                                    <div className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mt-1">
                                        Earned
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity (Mini) */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                            <Calendar className="text-indigo-500" /> History
                        </h2>
                    </div>

                    <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
                        {[
                            { title: 'Solved Two Sum', type: 'DSA', time: '2 hours ago', color: 'bg-blue-500' },
                            { title: 'Mock Interview (AI)', type: 'Interview', time: 'Yesterday', color: 'bg-purple-500' },
                            { title: 'Resume Update', type: 'Profile', time: '2 days ago', color: 'bg-emerald-500' },
                            { title: 'Project: Resume Parser', type: 'Dev', time: '3 days ago', color: 'bg-amber-500' },
                        ].map((act, i) => (
                            <div key={i} className="relative pl-6">
                                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${act.color}`}></div>
                                <h4 className="font-bold text-slate-900 text-sm">{act.title}</h4>
                                <div className="flex gap-2 items-center mt-1">
                                    <span className="text-xs font-bold text-slate-400">{act.type}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="text-xs text-slate-400">{act.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
