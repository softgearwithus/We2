'use client';

import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { CheckCircle2, XCircle, Clock, Database, Calendar } from 'lucide-react';

const mockSubmissions = [
    { id: '1', status: 'Accepted', runtime: '45ms', memory: '34.2MB', date: 'Just now', lang: 'JavaScript' },
    { id: '2', status: 'Wrong Answer', runtime: 'N/A', memory: 'N/A', date: '2 hours ago', lang: 'JavaScript' },
    { id: '3', status: 'Accepted', runtime: '52ms', memory: '35.1MB', date: 'Yesterday', lang: 'Python' },
    { id: '4', status: 'Time Limit', runtime: 'N/A', memory: 'N/A', date: '2 days ago', lang: 'C++' },
    { id: '5', status: 'Accepted', runtime: '42ms', memory: '33.8MB', date: '3 days ago', lang: 'JavaScript' },
];

const runtimeDist = [
    { range: '0-10ms', count: 5 },
    { range: '10-20ms', count: 12 },
    { range: '20-30ms', count: 25 },
    { range: '30-40ms', count: 45 },
    { range: '40-50ms', count: 80 }, // My runtime
    { range: '50-60ms', count: 30 },
    { range: '60+ms', count: 10 },
];

const memoryDist = [
    { range: '30MB', count: 10 },
    { range: '32MB', count: 25 },
    { range: '34MB', count: 60 }, // My memory
    { range: '36MB', count: 40 },
    { range: '38MB', count: 15 },
    { range: '40MB', count: 5 },
];

export default function SubmissionsTab() {
    return (
        <div className="p-6 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Clock size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Best Runtime</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">42 ms</div>
                    <div className="text-xs text-emerald-600 font-medium">Beats 84.5%</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Database size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Best Memory</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">33.8 MB</div>
                    <div className="text-xs text-emerald-600 font-medium">Beats 92.1%</div>
                </div>
            </div>

            {/* Charts */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Runtime Distribution</h3>
                    <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={runtimeDist}>
                                <XAxis dataKey="range" hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {runtimeDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 4 ? '#4f46e5' : '#e2e8f0'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Memory Distribution</h3>
                    <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={memoryDist}>
                                <XAxis dataKey="range" hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {memoryDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 2 ? '#4f46e5' : '#e2e8f0'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* History List */}
            <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">Submission History</h3>
                <div className="space-y-2">
                    {mockSubmissions.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm hover:border-indigo-100 transition-colors">
                            <div className="flex items-center gap-3">
                                {sub.status === 'Accepted' ? (
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                ) : (
                                    <XCircle size={18} className="text-rose-500" />
                                )}
                                <div>
                                    <div className={`text-sm font-bold ${sub.status === 'Accepted' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {sub.status}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">{sub.date} • {sub.lang}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-mono text-slate-600">{sub.runtime}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{sub.memory}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
