"use client";

import { AlertTriangle, BookOpen, ChevronRight } from "lucide-react";

export function WeakAreaList() {
    const weakAreas = [
        { topic: "Dynamic Programming", domain: "Coding", severity: "High", impacted: "CS, ECE", action: "Schedule Workshop" },
        { topic: "Verbal Reasoning", domain: "Aptitude", severity: "Medium", impacted: "All Depts", action: "Assign Practice Test" },
        { topic: "Thermodynamics", domain: "Core", severity: "High", impacted: "Mech", action: "Remedial Classes" },
        { topic: "System Design", domain: "Coding", severity: "Medium", impacted: "CS", action: "Guest Lecture" },
    ];

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl h-full flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Identify Weak Areas</h3>
                <p className="text-sm text-slate-400">Topics requiring immediate attention</p>
            </div>

            <div className="space-y-3 flex-1 overflow-auto pr-2">
                {weakAreas.map((area, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className={`w-4 h-4 ${area.severity === 'High' ? 'text-red-500' : 'text-amber-500'}`} />
                                <h4 className="font-semibold text-slate-200 text-sm">{area.topic}</h4>
                            </div>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${area.severity === 'High'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                {area.severity} Priority
                            </span>
                        </div>

                        <p className="text-xs text-slate-400 mb-3">
                            Impacted: <span className="text-slate-300">{area.impacted}</span> • Domain: <span className="text-slate-300">{area.domain}</span>
                        </p>

                        <button className="w-full py-2 flex items-center justify-center gap-2 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-400 text-xs font-medium rounded-lg transition-all group-hover:bg-indigo-600 group-hover:text-white">
                            <BookOpen className="w-3 h-3" />
                            {area.action}
                            <ChevronRight className="w-3 h-3 opacity-50" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
