"use client";

import { mockStudents } from "@/lib/institute/mockData";
import { Trophy, Medal, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function LeaderBoard() {
    const topStudents = [...mockStudents]
        .sort((a, b) => b.placementReadiness - a.placementReadiness)
        .slice(0, 5);

    const departments = ['Computer Science', 'Mechanical', 'Electronics', 'Civil'];
    const deptPerformance = departments.map(dept => {
        const studs = mockStudents.filter(s => s.department === dept);
        const avg = studs.reduce((acc, s) => acc + s.placementReadiness, 0) / studs.length;
        return { name: dept, score: avg };
    }).sort((a, b) => b.score - a.score);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Top Students */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <div>
                        <h3 className="text-lg font-bold text-white">Student Champions</h3>
                        <p className="text-sm text-slate-400">Top performers across all branches</p>
                    </div>
                </div>

                <div className="space-y-4 flex-1 overflow-auto pr-2">
                    {topStudents.map((student, i) => (
                        <motion.div
                            key={student.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-800 relative overflow-hidden group hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${i === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' :
                                        i === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/50' :
                                            i === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/50' :
                                                'bg-slate-800 text-slate-500'
                                    }`}>
                                    {i + 1}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">{student.name}</h4>
                                    <p className="text-xs text-slate-400">{student.department}</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="flex items-center gap-1 justify-end">
                                    <span className="text-lg font-bold text-emerald-400">{student.placementReadiness}</span>
                                    <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                                </div>
                                <p className="text-[10px] text-slate-500 uppercase">Readiness Score</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Top Departments */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <Medal className="w-6 h-6 text-indigo-400" />
                    <div>
                        <h3 className="text-lg font-bold text-white">Department Rankings</h3>
                        <p className="text-sm text-slate-400">Based on average readiness</p>
                    </div>
                </div>

                <div className="space-y-6 flex-1 overflow-auto pr-2 pt-2">
                    {deptPerformance.map((dept, i) => (
                        <div key={dept.name} className="relative">
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-2">
                                    {i === 0 && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                                    <span className={`font-medium ${i === 0 ? 'text-white' : 'text-slate-300'}`}>{dept.name}</span>
                                </div>
                                <span className="font-mono text-sm text-indigo-300">{dept.score.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${dept.score}%` }}
                                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                    className={`h-full rounded-full ${i === 0 ? 'bg-indigo-500' : 'bg-slate-600'}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
