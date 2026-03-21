'use client';

import { useState, useEffect } from 'react';
import {
    MousePointer2,
    Clock,
    Target,
    Zap,
    CreditCard,
    Loader2
} from 'lucide-react';
import { AnalyticsData, fetchAdminAnalytics } from '@/app/lib/admin';
import { getStoredToken } from '@/app/lib/auth-storage';

export default function AnalyticsPage() {
    const [stats, setStats] = useState({
        visitors: 0,
        subscribers: 0,
        activeNow: 0
    });
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [timeRange, setTimeRange] = useState('7d');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data and simulate real-time activity
    useEffect(() => {
        const loadAnalytics = async () => {
            setIsLoading(true);
            try {
                const token = getStoredToken('admin') || '';
                const data = await fetchAdminAnalytics(token, timeRange);
                setStats({
                    visitors: data.visitors,
                    subscribers: data.subscribers,
                    activeNow: data.activeNow,
                });
                setAnalyticsData(data);
            } catch (error) {
                console.error("Error loading analytics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAnalytics();

        return () => {};
    }, [timeRange]);

    if (isLoading || !analyticsData) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-sm font-bold uppercase tracking-widest">Loading Analytics Engine...</p>
                </div>
            </div>
        );
    }

    const conversionRate = stats.visitors > 0 ? ((stats.subscribers / stats.visitors) * 100).toFixed(1) : '0.0';

    const overviewStats = [
        { label: 'Total Visitors', value: stats.visitors.toLocaleString(), icon: MousePointer2, color: 'text-blue-600' },
        { label: 'Total Subscribers', value: stats.subscribers.toLocaleString(), icon: CreditCard, color: 'text-emerald-600' },
        { label: 'Conversion Rate', value: `${conversionRate}%`, icon: Target, subtitle: 'Visitors to Subscribers', color: 'text-slate-800' },
        { label: 'Active Now', value: stats.activeNow.toLocaleString(), icon: Clock, color: 'text-slate-600' },
    ];

    const featureEngagement = analyticsData.featureEngagement;

    return (
        <div className="max-w-full max-w-[1400px] mx-auto space-y-10 pb-20 pt-4">
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
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                <h3 className="text-4xl font-black text-slate-900">{stat.value}</h3>
                                {stat.subtitle && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{stat.subtitle}</p>}
                            </div>
                ))}
            </div>

                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
                        {/* Feature Engagement - Simplified */}
                        <div>
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

                    </div>
                </div>
    );
}
