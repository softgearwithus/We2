"use client";

import { SkillHeatmap } from "@/components/institute/Skills/SkillHeatmap";
import { WeakAreaList } from "@/components/institute/Skills/WeakAreaList";
import { Lightbulb, Share2 } from "lucide-react";
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

export default function SkillsPage() {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6 pb-10"
        >
            <motion.div variants={item} className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Skill Intelligence</h1>
                    <p className="text-slate-400 mt-2">Identify knowledge gaps and optimize curriculum delivery.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-sm font-medium transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share With HODs
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                <motion.div variants={item} className="lg:col-span-2 h-full">
                    <SkillHeatmap />
                </motion.div>
                <motion.div variants={item} className="h-full">
                    <WeakAreaList />
                </motion.div>
            </div>

            <motion.div variants={item} className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 p-6 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <Lightbulb className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white mb-2">AI Recommendation</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        Based on the current heatmap, <span className="text-white font-semibold">Mechanical Engineering</span> students are lagging significantly in <span className="text-white font-semibold">Coding Proficiency (45%)</span>.
                        Considering keeping up with Industry 4.0 trends, implementing a mandatory "Python for Automation" module in the 3rd semester is highly recommended.
                    </p>
                    <button className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
                        Apply Curriculum Change
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
