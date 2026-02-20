"use client";

import { useEffect, useState } from "react";
import type { PlacementMetrics } from "@/lib/institute/types";
import { fetchPlacementMetrics } from "@/lib/institute/client";

const departments = ['Comp Sci', 'Mech', 'Electronics', 'Civil'];
const skills = ['Coding', 'Aptitude', 'Comm', 'Projects', 'Core'];

const getColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500 hover:bg-emerald-400";
    if (score >= 60) return "bg-indigo-500 hover:bg-indigo-400";
    if (score >= 40) return "bg-amber-500 hover:bg-amber-400";
    return "bg-red-500 hover:bg-red-400";
};

export function SkillHeatmap() {
    const [metrics, setMetrics] = useState<PlacementMetrics>({
        coding: 0,
        aptitude: 0,
        communication: 0,
        core: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMetrics = async () => {
            setLoading(true);
            const data = await fetchPlacementMetrics();
            setMetrics(data);
            setLoading(false);
        };
        loadMetrics();
    }, []);

    const data = [
        [metrics.coding, metrics.aptitude, metrics.communication, metrics.coding, metrics.core],
        [metrics.coding * 0.7, metrics.aptitude * 0.8, metrics.communication * 0.9, metrics.coding * 0.75, metrics.core * 1.05],
        [metrics.coding * 0.85, metrics.aptitude * 0.9, metrics.communication * 0.8, metrics.coding * 0.9, metrics.core * 0.95],
        [metrics.coding * 0.6, metrics.aptitude * 0.7, metrics.communication * 0.75, metrics.coding * 0.65, metrics.core * 1.1],
    ].map((row) => row.map((value) => Math.max(0, Math.min(100, Math.round(value)))));

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl h-full flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Skill Matrix</h3>
                <p className="text-sm text-slate-400">Department vs Skill Proficiency Heatmap</p>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="min-w-[500px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-6 mb-2">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dept</div>
                        {skills.map((skill, i) => (
                            <div key={i} className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{skill}</div>
                        ))}
                    </div>

                    {/* Data Rows */}
                    <div className="space-y-2">
                        {departments.map((dept, rowIdx) => (
                            <div key={dept} className="grid grid-cols-6 items-center">
                                <div className="text-sm font-medium text-slate-300">{dept}</div>
                                {data[rowIdx].map((score, colIdx) => (
                                    <div key={`${rowIdx}-${colIdx}`} className="flex justify-center p-1">
                                        <div
                                            className={`w-full aspect-video rounded-md flex items-center justify-center text-xs font-bold text-white shadow-lg transition-colors cursor-pointer group relative ${getColor(score)}`}
                                        >
                                            {loading ? '--' : score}
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-10">
                                                {dept} • {skills[colIdx]}: {score}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500"></div>Excellent (&gt;80)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-indigo-500"></div>Good (60-79)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500"></div>Average (40-59)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500"></div>Poor (&lt;40)</div>
            </div>
        </div>
    );
}
