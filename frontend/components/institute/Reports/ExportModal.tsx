"use client";

import { X, FileText, Download, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const handleExport = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setIsComplete(true);
            setTimeout(() => {
                setIsComplete(false);
                onClose();
            }, 1500);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="mb-6">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Export Insight Report</h3>
                        <p className="text-sm text-slate-400 mt-1">Generate a comprehensive PDF report for internal review.</p>
                    </div>

                    <div className="space-y-3 mb-6">
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5 cursor-pointer">
                            <input type="radio" name="reportType" defaultChecked className="accent-indigo-500" />
                            <span className="text-sm font-medium text-white">Full Placement Summary</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 bg-slate-800/30 cursor-pointer hover:border-slate-600 transition-colors">
                            <input type="radio" name="reportType" className="accent-indigo-500" />
                            <span className="text-sm font-medium text-slate-300">Department Metrics Only</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 bg-slate-800/30 cursor-pointer hover:border-slate-600 transition-colors">
                            <input type="radio" name="reportType" className="accent-indigo-500" />
                            <span className="text-sm font-medium text-slate-300">Student Leaderboard</span>
                        </label>
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={isGenerating || isComplete}
                        className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${isComplete
                                ? "bg-emerald-500 text-white"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating PDF...
                            </>
                        ) : isComplete ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Downloaded!
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Download Report
                            </>
                        )}
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
