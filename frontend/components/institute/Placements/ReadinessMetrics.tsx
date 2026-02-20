"use client";

import { Brain, Code, MessageSquare, Zap } from "lucide-react";

import type { PlacementMetrics } from "@/lib/institute/types";

export function ReadinessMetrics({ metrics, isLoading }: { metrics: PlacementMetrics; isLoading?: boolean }) {
    const avgCoding = metrics.coding;
    const avgAptitude = metrics.aptitude;
    const avgComm = metrics.communication;
    const avgCore = metrics.core;

    const items = [
        { label: "Coding Proficiency", value: avgCoding.toFixed(1), icon: Code, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
        { label: "Aptitude Score", value: avgAptitude.toFixed(1), icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        { label: "Communication", value: avgComm.toFixed(1), icon: MessageSquare, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
        { label: "Core Subjects", value: avgCore.toFixed(1), icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((m, i) => (
                <div key={i} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${m.bg} ${m.border} border`}>
                            <m.icon className={`w-5 h-5 ${m.color}`} />
                        </div>
                        <h4 className="text-sm font-medium text-slate-400">{m.label}</h4>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-white">{isLoading ? '--' : m.value}</span>
                        <span className="text-xs text-slate-500 mb-1">/ 100</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${m.color.replace('text-', 'bg-')}`}
                            style={{ width: `${isLoading ? 0 : m.value}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
