"use client";

import { motion } from "framer-motion";

interface DeptMetric {
    name: string;
    studentCount: number;
    avgReadiness: number;
    placementRate: number;
}

export function DepartmentPerformance({ stats }: { stats: DeptMetric[] }) {
    return (
        <div className="rounded-3xl bg-white border border-gray-100 p-8 h-full shadow-[0_2px_20px_rgb(0,0,0,0.04)] flex flex-col">
            <div className="mb-8">
                <h3 className="text-xl font-[900] text-gray-900 tracking-tight">Top Departments</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">Performance breakdown</p>
            </div>

            <div className="flex-1 overflow-auto space-y-4 pr-2 custom-scrollbar">
                {stats.map((dept, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ delay: i * 0.06 }}
                        className="group p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-brand-orange/20 hover:bg-white hover:shadow-md transition-all cursor-default relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg group-hover:text-brand-orange transition-colors">{dept.name}</h4>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{dept.studentCount} Students</p>
                            </div>
                            <span className="text-2xl font-[900] text-gray-900">{dept.placementRate}%</span>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                                    <span className="text-gray-400">Readiness</span>
                                    <span className="text-purple-600">{dept.avgReadiness}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${dept.avgReadiness}%` }}
                                        viewport={{ once: true, margin: '-40px' }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        className="h-full bg-purple-500 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
