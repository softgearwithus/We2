'use client';

import { Users, Building2, TrendingUp, Award } from 'lucide-react';

export default function AdminDashboard() {
    const stats = [
        { label: 'Total Students', value: '12,450', change: '+12% this month', icon: Users, color: 'bg-blue-600' },
        { label: 'Colleges Onboarded', value: '45', change: '+3 new', icon: Building2, color: 'bg-purple-600' },
        { label: 'Placement Rate', value: '68%', change: '+5% vs last year', icon: TrendingUp, color: 'bg-green-600' },
        { label: 'Certifications Issued', value: '8,902', change: '+450 this week', icon: Award, color: 'bg-orange-600' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Platform Overview</h1>
                <div className="flex gap-2">
                    <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Quarter</option>
                        <option>Year to Date</option>
                    </select>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all">
                        Generate Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color} text-white shadow-lg shadow-blue-500/10`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            {stat.change}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">donut_large</span>
                        Student Engagement
                    </h3>
                    <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                        <p className="text-slate-400 text-sm font-medium">Chart Visualization Placeholder</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600">insights</span>
                        Top Performing Colleges
                    </h3>
                    <div className="space-y-4">
                        {[
                            { name: 'IIT Bombay', score: 98, students: 1200 },
                            { name: 'BITS Pilani', score: 95, students: 850 },
                            { name: 'IIIT Hyderabad', score: 92, students: 600 },
                            { name: 'NIT Trichy', score: 89, students: 920 },
                            { name: 'Delhi Technological University', score: 88, students: 1100 },
                        ].map((college, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>#{i + 1}</span>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{college.name}</p>
                                        <p className="text-xs text-slate-500">{college.students} active students</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">{college.score}</p>
                                    <p className="text-xs text-slate-400">Avg. Readiness</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
