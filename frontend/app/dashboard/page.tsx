'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useDashboardMode } from '../context/DashboardModeContext';
import SimulationDashboard from '../components/dashboard/SimulationDashboard';
import ReadinessPanel from '../components/dashboard/prep0/ReadinessPanel';
import RadarSkillChart from '../components/dashboard/prep0/RadarSkillChart';
import QuickAccessGrid from '../components/dashboard/prep0/QuickAccessGrid';
import { Sparkles, Target, GraduationCap, ArrowRight } from 'lucide-react';
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
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
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
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    // New Amber Dashboard Layout (Premium Light Theme)
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                            Welcome Back, {user?.email?.split('@')[0]} <span className="animate-wave origin-bottom-right">👋</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg font-medium flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse"></span>
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

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column (8/12) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Readiness Panel */}
                        <ReadinessPanel readinessScore={stats.readinessScore / 10} />

                        {/* Quick Access Grid */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-brand-orange rounded-full"></span>
                                Start Your Momentum
                            </h3>
                            <QuickAccessGrid />
                        </div>
                    </div>

                    {/* Right Column (4/12) */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Radar Chart */}
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

                        {/* Become a Mentor Earn CTA */}
                        <Link href="/mentor/apply" className="block mt-12 md:mt-16 group">
                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-6 md:p-8 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.4)] border border-indigo-500/20 hover:border-indigo-400/40 hover:shadow-[0_15px_50px_-10px_rgba(79,70,229,0.5)] transition-all duration-300 transform group-hover:-translate-y-1">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px] translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-indigo-400/30 transition-colors"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-orange/10 rounded-full blur-[40px] -translate-x-1/2 translate-y-1/2 pointer-events-none group-hover:bg-brand-orange/20 transition-colors"></div>

                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
                                        <Sparkles size={12} className="text-brand-orange" />
                                        Earn With EMBLE
                                    </div>

                                    <h3 className="text-2xl font-extrabold text-white tracking-tight mb-2 leading-tight">
                                        Join as a <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-indigo-400">Mentor</span>
                                    </h3>

                                    <p className="text-sm text-indigo-100/80 mb-6 leading-relaxed">
                                        Got a great GATE/Codeforces score? Monetize your free time, guide the community, and earn well by taking 1:1 sessions.
                                    </p>

                                    <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:text-brand-orange transition-colors">
                                        Apply Now
                                        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
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



