'use client';

import React from 'react';
import { Sparkles, BrainCircuit, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SynapseWidget({ recentActivity = [] as Array<{ title: string; time: string }> }: { recentActivity?: Array<{ title: string; time: string }> }) {
    const items = recentActivity.length
        ? recentActivity
        : [{ title: 'No recent activity yet. Complete your next task to see updates here.', time: 'Just now' }];
    return (
        <div className="h-full w-full bg-slate-900 rounded-2xl p-6 relative overflow-hidden text-white flex flex-col justify-between">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <BrainCircuit size={20} className="text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-lg">Synapse Intelligence</h3>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-white/10 rounded-full text-indigo-300 border border-white/5 flex items-center gap-1">
                        <Activity size={12} /> Live
                    </span>
                </div>

                <div className="space-y-3">
                    {items.map((activity, index) => (
                        <div
                            key={`${activity.title}-${index}`}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <Sparkles size={16} className="text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                                        {activity.title}
                                    </p>
                                    <span className="text-xs text-slate-500 mt-1 block">{activity.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 mt-auto pt-4">
                <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                    <Zap size={16} /> View Full Analysis
                </button>
            </div>
        </div>
    );
}
