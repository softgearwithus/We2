"use client";

import { mockStudents } from "@/lib/institute/mockData";
import { ReadinessMetrics } from "@/components/institute/Placements/ReadinessMetrics";
import { FileDown } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';

const ResumeQualityChart = dynamic(() => import('@/components/institute/Placements/ResumeQualityChart').then(mod => mod.ResumeQualityChart), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center text-slate-500">Loading Resume Chart...</div>
});

const MockInterviewTrends = dynamic(() => import('@/components/institute/Placements/MockInterviewTrends').then(mod => mod.MockInterviewTrends), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center text-slate-500">Loading Trends...</div>
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

export default function PlacementPage() {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6 pb-10"
        >
            <motion.div variants={item} className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Placement Readiness</h1>
                    <p className="text-slate-400 mt-2">Monitor batch-wise preparedness and skill distribution.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
                    <FileDown className="w-4 h-4" />
                    Download Report
                </button>
            </motion.div>

            {/* Top Metrics Grid */}
            <motion.div variants={item}>
                <ReadinessMetrics students={mockStudents} />
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                <motion.div variants={item} className="h-full">
                    <ResumeQualityChart />
                </motion.div>
                <motion.div variants={item} className="lg:col-span-2 h-full">
                    <MockInterviewTrends />
                </motion.div>
            </div>

            {/* Detailed Insights Placeholder */}
            <motion.div variants={item} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Critical Action Items</h3>
                <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start justify-between">
                        <div>
                            <h4 className="font-semibold text-red-400">Low DSA Proficiency in Mechanical Dept</h4>
                            <p className="text-sm text-red-300/70 mt-1">Average coding score is 45/100. Suggested Action: Organize a 2-day Python workshop.</p>
                        </div>
                        <button className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors">Schedule Workshop</button>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start justify-between">
                        <div>
                            <h4 className="font-semibold text-amber-400">Resume Scores Below Threshold</h4>
                            <p className="text-sm text-amber-300/70 mt-1">45 Students have resumes scoring less than 60%. Suggested Action: Enable auto-review for these students.</p>
                        </div>
                        <button className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors">Enable Auto-Review</button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
