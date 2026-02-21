"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fallbackData = [
    { week: 'W1', interviews: 24, avgScore: 65 },
    { week: 'W2', interviews: 35, avgScore: 68 },
    { week: 'W3', interviews: 42, avgScore: 72 },
    { week: 'W4', interviews: 38, avgScore: 70 },
    { week: 'W5', interviews: 55, avgScore: 75 },
    { week: 'W6', interviews: 62, avgScore: 78 },
];

export function MockInterviewTrends({ data = fallbackData }: { data?: Array<{ week: string; interviews: number; avgScore: number }> }) {
    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl h-full flex flex-col">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h3 className="text-lg font-bold text-white">Mock Interview Activity</h3>
                    <p className="text-sm text-slate-400">Weekly participation & scores</p>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="week"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#1e293b' }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
                        />
                        <Bar
                            dataKey="interviews"
                            fill="#8b5cf6"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                            name="Interviews Conducted"
                        />
                        <Bar
                            dataKey="avgScore"
                            fill="#ec4899"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                            name="Avg. Score"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
