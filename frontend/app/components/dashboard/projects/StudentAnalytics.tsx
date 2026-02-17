'use client';

import { motion } from 'framer-motion';
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';
import { Trophy, Zap, Target, Award, TrendingUp } from 'lucide-react';

const SKILL_DATA = [
    { subject: 'Frontend', A: 120, fullMark: 150 },
    { subject: 'Backend', A: 98, fullMark: 150 },
    { subject: 'System Design', A: 86, fullMark: 150 },
    { subject: 'Database', A: 99, fullMark: 150 },
    { subject: 'DevOps', A: 65, fullMark: 150 },
    { subject: 'Mobile', A: 45, fullMark: 150 },
];

const ACTIVITY_DATA = [
    { name: 'Mon', hours: 2 },
    { name: 'Tue', hours: 4 },
    { name: 'Wed', hours: 1 },
    { name: 'Thu', hours: 5 },
    { name: 'Fri', hours: 3 },
    { name: 'Sat', hours: 8 },
    { name: 'Sun', hours: 6 },
];

export default function StudentAnalytics() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full space-y-6 pb-20"
        >
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { icon: Trophy, label: 'Total XP', value: '1,250', color: 'text-yellow-500', bg: 'bg-yellow-50' },
                    { icon: Zap, label: 'Current Streak', value: '12 Days', color: 'text-orange-500', bg: 'bg-orange-50' },
                    { icon: Target, label: 'Projects Done', value: '4/12', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { icon: Award, label: 'Class Rank', value: 'Top 5%', color: 'text-purple-500', bg: 'bg-purple-50' }
                ].map((stat, idx) => (
                    <div key={idx} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skill Radar */}
                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-600" />
                        Skill Proficiency
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILL_DATA}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar
                                    name="Skills"
                                    dataKey="A"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fill="#6366f1"
                                    fillOpacity={0.2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Graph */}
                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Zap size={18} className="text-orange-500" />
                        Weekly Coding Activity
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ACTIVITY_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                />
                                <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
