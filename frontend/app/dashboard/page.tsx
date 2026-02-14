'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useDashboardMode } from '../context/DashboardModeContext';
import SimulationDashboard from '../components/dashboard/SimulationDashboard';
import ReadinessPanel from '../components/dashboard/prep0/ReadinessPanel';
import RadarSkillChart from '../components/dashboard/prep0/RadarSkillChart';
import QuickAccessGrid from '../components/dashboard/prep0/QuickAccessGrid';
import PlacementRoadmap from '../components/dashboard/prep0/PlacementRoadmap';
import { Sparkles, Trophy, Target, TrendingUp } from 'lucide-react';

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
                    const response = await fetch('http://localhost:3001/users/dashboard-stats', {
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
        return <div className="min-h-screen bg-prep-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prep-primary"></div></div>;
    }

    // New PREP0 Dashboard Layout (Premium Light Theme)
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            {/* Ambient Background Gradient (Subtle) */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

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

                    {/* Gamification Stats (Glass) */}
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Trophy size={20} className="fill-current" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Rank</p>
                                <p className="text-sm font-bold text-slate-900">Top 5%</p>
                            </div>
                        </div>
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

                        {/* Placement Roadmap */}
                        <PlacementRoadmap />

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

                        {/* Recent Activity (Premium Card) */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-900 text-lg">Recent Activity</h3>
                                <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">View All</button>
                            </div>
                            <div className="space-y-4">
                                {stats.recentActivity.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all duration-300 cursor-pointer group border border-transparent hover:border-slate-100">
                                        <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-colors shadow-sm`}>
                                            <span className={`material-symbols-outlined text-slate-400 group-hover:text-indigo-600 transition-colors`}>{item.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{item.title}</p>
                                            <p className="text-xs font-medium text-slate-400">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Banner Footer (Premium Gradient) */}
                <div className="w-full bg-white border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Sparkles size={24} className="text-white animate-pulse-slow" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-1">AI Recommendation</p>
                            <p className="text-lg font-medium text-slate-800">Based on your weakness in Graphs, try <span className="font-bold text-slate-900 border-b-2 border-indigo-200 cursor-pointer hover:border-indigo-500 transition-colors">Dijkstra's Algorithm</span>.</p>
                        </div>
                    </div>
                    <button className="bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200 relative z-10 flex items-center gap-2 group-hover:scale-105 active:scale-95">
                        Start Practice <TrendingUp size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
