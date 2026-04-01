'use client';

import { fetchApi } from '../lib/apiClient';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboardMode } from '../context/DashboardModeContext';
import EngagementFilterHub from '../components/dashboard/prep0/EngagementFilterHub';
import AIActionHub from '../components/dashboard/prep0/AIActionHub';
import SimulationDashboard from '../components/dashboard/SimulationDashboard';
import UpgradeNowCard from '../components/dashboard/UpgradeNowCard';
import { Sparkles, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
    readinessScore: number;
    problemsSolved: number;
    interviewsCompleted: number;
    streakDays: number;
    skillProficiency: number[];
    recentActivity: Array<{ title: string; time: string; icon: string; color: string }>;
}

export default function DashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const dashboardContext = useDashboardMode();
    const mode = dashboardContext?.mode;
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const normalizedPlan = (user?.subscriptionPlan || '').toLowerCase();
    const isProUser =
        normalizedPlan === 'pro';
    const isFreeUser = !isProUser;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            // Only fetch placement stats if in prep mode, or fetch both if needed.
            const fetchStats = async () => {
                const { getActiveToken } = await import('@/app/lib/auth-storage');
                const token = getActiveToken();
                try {
                    const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/users/dashboard-stats`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setStats(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch stats', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchStats();
        }
    }, [authLoading, user]);

    // Work / Simulation Mode
    if (mode === 'work') {
        return <SimulationDashboard />;
    }

    if (loading || !stats) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div></div>;
    }

    // New Amber Dashboard Layout (Premium Light Theme)
    return (
        <div className="min-h-screen bg-background relative overflow-hidden font-sans text-foreground pb-20">
            {/* Ambient Background */}
            <div className="absolute -top-32 right-0 w-full max-w-full max-w-[520px] h-[520px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full max-w-full max-w-[480px] h-[480px] bg-secondary/30 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-8 space-y-10">
                <header className="pb-4">
                    <p className="text-foreground/80 text-xl font-semibold max-w-2xl leading-relaxed">
                        Maintain focus on what matters most: preparing for the technical and behavioral rounds of your dream companies.
                    </p>
                </header>
                {/* Structurally Balanced Layout */}
                <div className="flex flex-col gap-10">

                    {/* Top Row (Hero CTA) */}
                    {isFreeUser && (
                        <div className="w-full">
                            <UpgradeNowCard />
                        </div>
                    )}

                    {/* Primary Engagement Core */}
                    <div className="w-full relative z-10 space-y-12">
                        {/* Interview Flagship Module */}
                        <div>
                            <AIActionHub />
                        </div>

                        {/* Filtered Engagement Hub */}
                        <div className="bg-card border border-border shadow-sm rounded-3xl p-6 md:p-8">
                            <div className="mb-6">
                                <h3 className="text-2xl font-extrabold text-card-foreground flex items-center gap-3 tracking-tight">
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner border border-primary/20">
                                        <Target size={16} className="text-primary" />
                                    </div>
                                    Targeted Preparation
                                </h3>
                                <p className="text-sm font-medium text-foreground/60 mt-2">
                                    Filter and access specific company test series, project labs, and resume builder.
                                </p>
                            </div>
                            <EngagementFilterHub />
                        </div>
                    </div>
                    {/* Footer Banner Row */}
                    <div className="w-full pt-4">
                        <Link href="/mentor/apply" className="block w-full group outline-none">
                            <div className="relative overflow-hidden rounded-[32px] bg-card p-8 md:p-12 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-border hover:border-border hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 transform group-hover:-translate-y-1 flex flex-col md:flex-row items-center justify-between gap-8">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-primary/10 transition-colors duration-700"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-[60px] -translate-x-1/2 translate-y-1/2 pointer-events-none group-hover:bg-secondary/30 transition-colors duration-700"></div>

                                <div className="relative z-10 flex-1">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 border border-primary/20 text-foreground/80 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-4 shadow-sm">
                                        <Sparkles size={14} className="text-primary" />
                                        Earn With EMBLE
                                    </div>

                                    <h3 className="text-3xl md:text-4xl font-extrabold text-card-foreground tracking-tight mb-3 leading-tight">
                                        Join as a <span className="text-primary">Mentor</span>
                                    </h3>

                                    <p className="text-[15px] md:text-base text-foreground/70 max-w-2xl leading-relaxed font-medium">
                                        Got a great GATE/Codeforces score? Monetize your free time, guide the community, and earn well by taking 1:1 sessions today.
                                    </p>
                                </div>

                                {/* Action Button */}
                                <div className="relative z-10 flex-shrink-0 w-full md:w-auto">
                                    <div className="relative h-14 px-8 sm:px-10 flex justify-center items-center rounded-full font-bold text-base transition-all duration-300 group-hover:scale-[1.02] active:scale-95 group/btn bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                                        <span className="relative z-10 flex items-center gap-2">
                                            Apply Now
                                            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}



