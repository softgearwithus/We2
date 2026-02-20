'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    MousePointer2,
    Clock,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Target,
    Zap,
    CreditCard,
    ChevronRight,
    BarChart3
} from 'lucide-react';

export default function AnalyticsPage() {
    const [stats, setStats] = useState({
        visitors: 12402,
        subscribers: 848,
        activeNow: 124
    });
    const [timeRange, setTimeRange] = useState('7d');

    // Simulate real-time activity
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                activeNow: Math.max(110, prev.activeNow + (Math.floor(Math.random() * 5) - 2))
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const conversionRate = ((stats.subscribers / stats.visitors) * 100).toFixed(1);

    const overviewStats = [
        { label: 'Total Visitors', value: stats.visitors.toLocaleString(), change: '+14%', trend: 'up', icon: MousePointer2, color: 'text-blue-600' },
        { label: 'Total Subscribers', value: stats.subscribers.toLocaleString(), change: '+22%', trend: 'up', icon: CreditCard, color: 'text-emerald-600' },
        { label: 'Conversion Rate', value: `${conversionRate}%`, change: '+5%', trend: 'up', icon: Target, subtitle: 'Visitors to Subscribers', color: 'text-indigo-600' },
        { label: 'Avg. Session Time', value: '24m 12s', change: '-2%', trend: 'down', icon: Clock, color: 'text-slate-600' },
    ];

    const featureEngagement = [
        { name: 'DSA Training', time: '840h users', percentage: 90, color: 'bg-blue-500' },
        { name: 'VS School (Prep)', time: '620h users', percentage: 75, color: 'bg-indigo-500' },
        { name: 'Mock Interviews', time: '410h users', percentage: 60, color: 'bg-rose-500' },
        { name: 'Placement Mode Dashboard', time: '580h users', percentage: 70, color: 'bg-emerald-500' },
        { name: 'Synapse Intelligence', time: '340h users', percentage: 45, color: 'bg-amber-500' },
    ];

    const engagementFunnels = [
        { stage: 'Platform Landing', count: '12.4k', percentage: 100 },
        { stage: 'Entered Placement Mode', count: '8.2k', percentage: 66 },
        { stage: 'Started Training', count: '4.1k', percentage: 33 },
        { stage: 'Subscribed to Pro', count: '848', percentage: 7 },
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 pt-4">
            {/* Simple Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 pb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Platform Analytics</h1>
                    <p className="text-base text-slate-500 mt-2 font-medium">Simplified monitoring of visitors, subscribers, and feature usage.</p>
                </div>
                <div className="flex gap-3">
                    {['24h', '7d', '30d'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${timeRange === range
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {overviewStats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm transition-transform hover:scale-[1.02] duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div className={`w-12 h-12 rounded-2xl bg-slate-50 ${stat.color} border border-slate-100 flex items-center justify-center`}>
                                <stat.icon size={24} />
                            </div>
                            <div className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                        <h3 className="text-4xl font-black text-slate-900">{stat.value}</h3>
                        {stat.subtitle && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{stat.subtitle}</p>}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Feature Engagement - Simplified */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden p-10 h-full">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                    <Zap size={24} className="text-amber-500" />
                                    Feature Usage
                                </h3>
                                <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Engagement levels in Placement Mode</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 text-xs font-bold">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {stats.activeNow} Users Online
                            </div>
                        </div>

                        <div className="space-y-10">
                            {featureEngagement.map((feature, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-base font-bold text-slate-700">{feature.name}</span>
                                        <span className="text-sm font-bold text-slate-400">{feature.time}</span>
                                    </div>
                                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${feature.color} rounded-full transition-all duration-1000 ease-out`}
                                            style={{ width: `${feature.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Conversion Funnel - Simple */}
                <div className="space-y-10">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
                            <BarChart3 size={22} className="text-indigo-500" />
                            User Journey
                        </h3>
                        <div className="space-y-6">
                            {engagementFunnels.map((step, i) => (
                                <div key={i} className="relative">
                                    <div className="flex items-center justify-between mb-2 px-1">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{step.stage}</span>
                                        <span className="text-xs font-black text-slate-900">{step.count}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${step.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 pt-8 border-t border-slate-100">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Strategy Note</p>
                                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                    Current data shows <span className="text-indigo-600 font-bold">{conversionRate}%</span> of visitors become paid subscribers. Focus on bridging the gap between "Started Training" and "Subscribed".
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Growth Target</p>
                            <h4 className="text-2xl font-black mb-2">1,000 Subscribers</h4>
                            <p className="text-sm font-medium text-slate-400 mb-8">Increase your subscriber base by 15% to hit the next milestone.</p>
                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                <div className="w-[84.8%] h-full bg-emerald-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
