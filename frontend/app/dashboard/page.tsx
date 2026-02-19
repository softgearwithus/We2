'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useDashboardMode } from '../context/DashboardModeContext';
import SimulationDashboard from '../components/dashboard/SimulationDashboard';
import ReadinessPanel from '../components/dashboard/prep0/ReadinessPanel';
import RadarSkillChart from '../components/dashboard/prep0/RadarSkillChart';
import QuickAccessGrid from '../components/dashboard/prep0/QuickAccessGrid';
import SynapseWidget from '../components/dashboard/prep0/SynapseWidget';
import { Sparkles, Target } from 'lucide-react';

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
                const token = localStorage.getItem('accessToken');
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/dashboard-stats`, {
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

    // New PREP0 Dashboard Layout (Premium Light Theme)
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            {/* Ambient Background Gradient (Subtle) */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-[50px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                            Welcome Back, {user?.email?.split('@')[0]} <span className="animate-wave origin-bottom-right">👋</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg font-medium flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse"></span>
                            Placement Season Live • <span className="text-slate-900 font-bold">78 Days</span> remaining
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
                        <ReadinessPanel />

                        {/* Quick Access Grid */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-brand-orange rounded-full"></span>
                                Start Learning
                            </h3>
                            <QuickAccessGrid />
                        </div>
                    </div>

                    {/* Right Column (4/12) */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Radar Chart */}
                        <RadarSkillChart />

                        {/* Synapse Intelligence Widget */}
                        <div className="h-64">
                            <SynapseWidget />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



