'use client';

import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

interface SkillData {
    subject: string;
    A: number;
    fullMark: number;
}

const data: SkillData[] = [
    { subject: 'DSA', A: 85, fullMark: 100 },
    { subject: 'Fundamentals', A: 65, fullMark: 100 },
    { subject: 'Aptitude', A: 90, fullMark: 100 },
    { subject: 'Communication', A: 70, fullMark: 100 },
    { subject: 'Interview', A: 50, fullMark: 100 },
    { subject: 'Company Prep', A: 40, fullMark: 100 },
];

export default function RadarSkillChart() {
    return (
        <div className="w-full h-[380px] bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 transition-all duration-700 group-hover:bg-indigo-100/60"></div>

            <div className="flex items-center justify-between mb-2 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Skill Analysis</h3>
                    <p className="text-sm text-slate-500 font-medium">Real-time performance distribution</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="material-symbols-outlined text-slate-400 text-xl">radar</span>
                </div>
            </div>

            <div className="w-full h-[280px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                        <PolarGrid stroke="#E2E8F0" strokeDasharray="4 4" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700, fontFamily: 'sans-serif' }} // Slate-500
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="My Skills"
                            dataKey="A"
                            stroke="#4F46E5" // Indigo-600
                            strokeWidth={3}
                            fill="#4F46E5"
                            fillOpacity={0.2}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                color: '#0F172A',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                padding: '12px',
                                fontWeight: 'bold'
                            }}
                            itemStyle={{ color: '#4F46E5', fontWeight: '600' }}
                            cursor={{ stroke: '#94A3B8', strokeWidth: 1 }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
