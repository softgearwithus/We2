'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Building2,
    TrendingUp,
    Activity,
    Server,
    Clock,
    ShieldCheck
} from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalColleges: 0,
        totalStudents: 0,
        partners: 48,
        totalDrives: 0,
        totalApplications: 0,
        uptime: '99.9%',
    });

    const [recentLogs, setRecentLogs] = useState<any[]>([]);

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
                    totalDrives: data.totalDrives || 0,
                    totalApplications: data.totalApplications || 0,
                    uptime: data.uptime || '99.9%',
                });
                setRecentLogs(data.recentLogs || []);
            } catch (error) {
                // fallback UI stays at defaults
            }
        };
        loadOverview();
    }, []);

    const dashboardStats = [
        { label: 'Registered Students', value: stats.totalStudents.toLocaleString(), icon: Users, color: 'text-indigo-600' },
        { label: 'Partner Brands', value: stats.partners.toString(), icon: Building2, color: 'text-emerald-600' },
        { label: 'Employer Campaigns', value: stats.totalDrives.toString(), icon: Activity, color: 'text-orange-600' },
        { label: 'Total Applications', value: stats.totalApplications.toString(), icon: TrendingUp, color: 'text-blue-600' },
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
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-8">
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
                                        <Clock size={20} />
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
            </div>
        </div>
    );
}
