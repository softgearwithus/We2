"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
    { name: 'High Impact', value: 35, color: '#10b981' },
    { name: 'Good', value: 45, color: '#6366f1' },
    { name: 'Average', value: 15, color: '#f59e0b' },
    { name: 'Needs Work', value: 5, color: '#ef4444' },
];

export function ResumeQualityChart() {
    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-white">Resume Quality</h3>
                <p className="text-sm text-slate-400">ATS Readiness Distribution</p>
            </div>

            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
                            itemStyle={{ color: '#f8fafc' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value) => <span className="text-slate-400 text-xs ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <p className="text-xs text-indigo-300 text-center">
                    <span className="font-bold">80%</span> of resumes are ATS compliant.
                </p>
            </div>
        </div>
    );
}
