"use client";

import { useEffect, useMemo, useState } from "react";
import type { DepartmentStats, Student } from "@/lib/institute/types";
import { fetchInstituteDashboard } from "@/lib/institute/client";
import { StatsCards } from "@/components/institute/Dashboard/StatsCards";
import { DepartmentPerformance } from "@/components/institute/Dashboard/DepartmentPerformance";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';

const PlacementChart = dynamic(() => import('@/components/institute/Dashboard/PlacementChart').then(mod => mod.PlacementChart), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center text-gray-400">Loading Chart...</div>
});

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function InstituteDashboard() {
    const [topStudents, setTopStudents] = useState<Student[]>([]);
    const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [placementRate, setPlacementRate] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            try {
                const data = await fetchInstituteDashboard();
                const fallbackStudents = data.students || [];
                const total = data.totalStudents ?? fallbackStudents.length;
                const rate = data.placementRate
                    ?? (total
                        ? Math.round(((data.placedStudents ?? fallbackStudents.filter((s) => s.status === 'Placed').length) / total) * 1000) / 10
                        : 0);
                const top = data.topStudents
                    ?? [...fallbackStudents].sort((a, b) => b.placementReadiness - a.placementReadiness).slice(0, 3);

                setTotalStudents(total);
                setPlacementRate(rate);
                setTopStudents(top);
                setDepartmentStats(data.departmentStats || []);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    const normalizedTopStudents = useMemo(() => {
        return topStudents.slice(0, 3);
    }, [topStudents]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
                Loading dashboard...
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-10 max-w-[1600px] mx-auto"
        >
            <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-5xl md:text-6xl font-[900] text-gray-900 tracking-tighter mb-2">
                        Dashboard<span className="text-brand-orange">.</span>
                    </h1>
                    <p className="text-gray-500 text-lg font-medium">Overview of your institution's performance.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-5 py-3 bg-white border border-gray-200 rounded-2xl text-gray-500 text-sm font-bold flex items-center shadow-sm">
                        <span className="text-xs uppercase tracking-widest mr-3 text-gray-400">Academic Year</span>
                        <span className="text-gray-900">2025-2026</span>
                    </div>
                    <button className="px-8 py-3 bg-brand-black hover:bg-gray-800 text-white rounded-2xl text-sm font-[900] transition-all shadow-xl hover:shadow-brand-orange/20 hover:-translate-y-1 active:scale-95">
                        Generate Report
                    </button>
                </div>
            </motion.div>

            <motion.div variants={item}>
                <StatsCards
                    totalStudents={totalStudents}
                    placementRate={placementRate}
                    avgPackage="₹6.5 LPA"
                    activeCompanies={32}
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div variants={item} className="lg:col-span-2">
                    <PlacementChart />
                </motion.div>
                <motion.div variants={item} className="h-full">
                    <DepartmentPerformance stats={departmentStats} />
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div variants={item} className="rounded-3xl bg-white border border-gray-100 p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)]">
                    <h3 className="text-xl font-[900] text-gray-900 tracking-tight mb-6">Upcoming Drives</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all group cursor-pointer hover:border-brand-orange/20">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl shadow-sm text-gray-700 group-hover:scale-110 transition-transform">🏢</div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900 group-hover:text-brand-orange transition-colors">Tech Mahindra</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Software Engineer • 18th Feb</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <button className="text-xs text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-xl font-bold hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-all">View</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
                <motion.div variants={item} className="rounded-3xl bg-white border border-gray-100 p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)]">
                    <h3 className="text-xl font-[900] text-gray-900 tracking-tight mb-6">Top Performers</h3>
                    <div className="space-y-4">
                        {normalizedTopStudents.map((student, i) => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all group hover:border-brand-orange/20">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-[900] text-white shadow-lg ${i === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-purple-500 to-indigo-600'}`}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">{student.name}</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{student.department}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-[900] text-gray-900">{student.placementReadiness}<span className="text-sm text-gray-400 font-bold">%</span></p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest text-brand-orange">Readiness</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
