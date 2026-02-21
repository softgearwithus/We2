'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Building2,
    TrendingUp,
    Activity,
    Server,
    Lock,
    Clock,
    UserPlus,
    AlertCircle,
    Fingerprint,
    ShieldCheck
} from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalColleges: 0,
        totalStudents: 0,
        partners: 48,
        uptime: '99.9%',
    });

    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [recentSignups, setRecentSignups] = useState<any[]>([]);

    useEffect(() => {
        const loadOverview = async () => {
            try {
                const token = localStorage.getItem('accessToken') || '';
                const { fetchAdminOverview } = await import('@/app/lib/admin');
                const data = await fetchAdminOverview(token);
                setStats({
                    totalColleges: data.totalColleges || 0,
                    totalStudents: data.totalStudents || 0,
                    partners: data.partners || 0,
                    uptime: data.uptime || '99.9%',
                });
                setRecentLogs(data.recentLogs || []);
                setRecentSignups(data.recentSignups || []);
            } catch (error) {
                // fallback UI stays at defaults
            }
        };
        loadOverview();
    }, []);

    const dashboardStats = [
        { label: 'Total Institutions', value: stats.totalColleges.toString(), icon: Building2, color: 'text-blue-600', trend: '+2 this month' },
        { label: 'Registered Students', value: stats.totalStudents.toLocaleString(), icon: Users, color: 'text-indigo-600', trend: '+420 new' },
        { label: 'Partner Brands', value: stats.partners.toString(), icon: TrendingUp, color: 'text-emerald-600', trend: 'Stable' },
        { label: 'Platform Reliability', value: stats.uptime, icon: Server, color: 'text-slate-600', trend: 'Nominal' },
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 pt-4">
            {/* Enhanced Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 pb-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <ShieldCheck size={12} />
                        Super Admin Console
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Ecosystem Overview
                    </h1>
                    <p className="text-base text-slate-500 mt-2 font-medium">Real-time health and institutional engagement metrics.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                        <span className="text-sm font-bold text-slate-700">Services: Operational</span>
                    </div>
                </div>
            </div>

            {/* Scaled Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {dashboardStats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden">
                        <div className="flex flex-col gap-6">
                            <div className={`w-14 h-14 rounded-2xl bg-slate-50 ${stat.color} border border-slate-100 flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                                <stat.icon size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-3">{stat.label}</p>
                                <div className="flex items-baseline gap-3">
                                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.trend}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Enhanced Activity Feed */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                        <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                    <Activity size={24} className="text-blue-500" />
                                    Live User Events
                                </h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time platform access logs</p>
                            </div>
                            <button className="px-5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200 shadow-sm">
                                View Full Audit
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {recentLogs.map((log) => (
                                <div key={log.id} className="px-10 py-6 flex items-center justify-between hover:bg-slate-50/40 transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                                            {log.icon ? <log.icon size={20} /> : <Clock size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-slate-700">
                                                <span className="text-slate-900 font-black">{log.actorName || log.user}</span> • {log.action}
                                            </p>
                                            <p className="text-sm text-slate-400 font-medium">Institution: {log.target}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        {log.time || (log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Just now')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* System Status Table */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Regional Status</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {[
                                    { name: 'Identity Engine', status: 'Healthy' },
                                    { name: 'Notification API', status: 'Healthy' },
                                    { name: 'Core Database', status: 'Optimized' }
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center justify-between px-2 py-2">
                                        <span className="text-sm font-bold text-slate-600">{s.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">{s.status}</span>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Staff Simple */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Latest Onboarding</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {recentSignups.length > 0 ? recentSignups.map((s) => (
                                    <div key={s.id} className="flex items-center gap-4 px-2">
                                        <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-800 truncate">{s.name || s.email}</p>
                                            <p className="text-[10px] text-slate-400 font-black truncate uppercase tracking-widest">{s.role || 'Staff'}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-xs text-slate-400 font-medium italic p-2">Waiting for new sign-ups...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Governance */}
                <div className="space-y-10">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
                        <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-3">
                            <AlertCircle size={20} className="text-rose-500" />
                            Policy Alerts
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Techno Univ.', issue: 'Pending Verification' },
                                { name: 'City College', issue: 'Inactive 30d+' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:bg-rose-50/50 hover:border-rose-100 transition-all duration-300">
                                    <span className="text-sm font-bold text-slate-700">{item.name}</span>
                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{item.issue}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
                            <Lock size={120} />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                                Security Protocol
                            </h4>
                            <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed">
                                Institutional credential creation is restricted to validated Super Admin sessions.
                            </p>
                            <button className="w-full bg-white text-slate-900 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all active:scale-[0.98]">
                                Access Audit Logs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
