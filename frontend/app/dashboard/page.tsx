'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboardMode } from '../context/DashboardModeContext';
import SimulationDashboard from '../components/dashboard/SimulationDashboard';
import ReadinessPanel from '../components/dashboard/prep0/ReadinessPanel';
import RadarSkillChart from '../components/dashboard/prep0/RadarSkillChart';
import QuickAccessGrid from '../components/dashboard/prep0/QuickAccessGrid';
import UpgradeNowCard from '../components/dashboard/UpgradeNowCard';
import { Sparkles, Target, ArrowRight, Zap } from 'lucide-react';
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
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/dashboard-stats`, {
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
        <div className="min-h-screen bg-[#FAFAFC] relative overflow-hidden font-sans text-slate-900 selection:bg-slate-100 selection:text-slate-900">
            {/* Global Ambient Background */}
            <div className="absolute top-[-10%] right-[-5%] w-full max-w-full max-w-[800px] h-[800px] bg-gradient-to-br from-slate-700/5 via-slate-500/5 to-transparent rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-full max-w-full max-w-[600px] h-[600px] bg-gradient-to-tr from-brand-orange/5 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-8 space-y-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-slate-200/50">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-[11px] font-bold uppercase tracking-widest text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                            Live Workspace
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3 leading-[1.1]">
                            Welcome Back, {user?.email?.split('@')[0]} <span className="animate-wave origin-bottom-right">👋</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-medium max-w-2xl">
                            Placement season is your stage. Build daily, perform boldly.
                        </p>
                    </div>

                    {/* Progress Snapshot (Glass) */}
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-brand-orange">
                                <Target size={20} className="fill-current" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Streak</p>
                                <p className="text-sm font-bold text-slate-900">{stats.streakDays} Days</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Structurally Balanced Layout */}
                <div className="flex flex-col gap-10">
                    
                    {/* Top Row (Hero CTA) */}
                    {isFreeUser && (
                        <div className="w-full">
                            <UpgradeNowCard />
                        </div>
                    )}

                    {/* Middle Row (Analytics Grid 50/50 Split) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <ReadinessPanel readinessScore={stats.readinessScore / 10} />
                        </div>
                        <div>
                            <RadarSkillChart
                                data={[
                                    { subject: 'DSA', A: stats.skillProficiency?.[0] ?? 0, fullMark: 100 },
                                    { subject: 'Fundamentals', A: stats.skillProficiency?.[1] ?? 0, fullMark: 100 },
                                    { subject: 'Aptitude', A: stats.skillProficiency?.[2] ?? 0, fullMark: 100 },
                                    { subject: 'Communication', A: stats.skillProficiency?.[3] ?? 0, fullMark: 100 },
                                    { subject: 'Interview', A: stats.skillProficiency?.[4] ?? 0, fullMark: 100 },
                                    { subject: 'Company Prep', A: stats.skillProficiency?.[5] ?? 0, fullMark: 100 },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Bottom Row (Action Hub breakout) */}
                    <div className="w-full relative z-10 pt-4">
                        <h3 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
                            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center shadow-inner border border-orange-200">
                                <Zap size={16} className="text-brand-orange fill-brand-orange" />
                            </div>
                            Start Your Momentum
                        </h3>
                        <QuickAccessGrid />
                    </div>

                    {/* Footer Banner Row */}
                    <div className="w-full pt-4">
                        <Link href="/mentor/apply" className="block w-full group outline-none">
                            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-black p-8 md:p-12 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.4)] border border-slate-400/20 hover:border-slate-400/40 hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] transition-all duration-500 transform group-hover:-translate-y-1 flex flex-col md:flex-row items-center justify-between gap-8">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-96 h-96 bg-slate-500/10 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-slate-400/20 transition-colors duration-700"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-[60px] -translate-x-1/2 translate-y-1/2 pointer-events-none group-hover:bg-brand-orange/20 transition-colors duration-700"></div>

                                <div className="relative z-10 flex-1">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-slate-100 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-4 backdrop-blur-md shadow-sm">
                                        <Sparkles size={14} className="text-brand-orange" />
                                        Earn With EMBLE
                                    </div>

                                    <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3 leading-tight">
                                        Join as a <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-slate-300">Mentor</span>
                                    </h3>

                                    <p className="text-[15px] md:text-base text-slate-100/70 max-w-2xl leading-relaxed font-medium">
                                        Got a great GATE/Codeforces score? Monetize your free time, guide the community, and earn well by taking 1:1 sessions today.
                                    </p>
                                </div>

                                {/* Action Button */}
                                <div className="relative z-10 flex-shrink-0 w-full md:w-auto">
                                    <div className="flex justify-center items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white font-extrabold rounded-2xl transition-all duration-300">
                                        Apply Now
                                        <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
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



