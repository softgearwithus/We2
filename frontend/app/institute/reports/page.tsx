"use client";

import { useEffect, useState } from "react";
import { LeaderBoard } from "@/components/institute/Reports/LeaderBoard";
import { ExportModal } from "@/components/institute/Reports/ExportModal";
import { Printer, CalendarRange } from "lucide-react";
import { motion } from "framer-motion";

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

export default function ReportsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reportData, setReportData] = useState({
        topStudents: [] as Array<{ id: string; name: string; department: string; placementReadiness: number }>,
        deptPerformance: [] as Array<{ name: string; score: number }>,
    });

    useEffect(() => {
        const loadReports = async () => {
            try {
                const { getActiveToken } = await import('@/app/lib/auth-storage');
                const token = getActiveToken() || '';
                const { fetchInstituteReports } = await import('@/app/lib/institute');
                const data = await fetchInstituteReports(token);
                setReportData({
                    topStudents: data.topStudents || [],
                    deptPerformance: data.deptPerformance || [],
                });
            } catch (error) {
                // keep defaults
            }
        };
        loadReports();
    }, []);

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6 pb-10"
        >
            <motion.div variants={item} className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Reports & Leaderboard</h1>
                    <p className="text-slate-400 mt-2">Generate insights and recognize top institutional talent.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors">
                        <CalendarRange className="w-4 h-4" />
                        This Semester
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-slate-200 flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print Summary
                    </button>
                </div>
            </motion.div>

            {/* Leaderboard Section */}
            <motion.div variants={item} className="h-[600px]">
                <LeaderBoard
                    topStudents={reportData.topStudents}
                    deptPerformance={reportData.deptPerformance}
                />
            </motion.div>

            {/* Modal */}
            <ExportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </motion.div>
    );
}
