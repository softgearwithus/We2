'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2, X, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { useSectionUsage } from '@/app/hooks/useSectionUsage';

interface AnalysisResult {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}

export default function ATSScanner() {
    const [maxUploadSizeMB, setMaxUploadSizeMB] = useState<number | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isLimited } = useSectionUsage('resume');

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/public/settings`)
            .then((res) => res.json())
            .then((data) => {
                if (typeof data.maxUploadSizeMB === 'number') {
                    setMaxUploadSizeMB(data.maxUploadSizeMB);
                }
            })
            .catch(() => null);
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (selectedFile: File) => {
        if (selectedFile.type !== 'application/pdf') {
            setError('Please upload a PDF file.');
            return;
        }
        setFile(selectedFile);
        setError(null);
        setResult(null);
    };

    const analyzeResume = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        if (jobDescription.trim()) {
            formData.append('jobDescription', jobDescription);
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resume/analyze`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Analysis failed.');
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    AI <span className="text-emerald-600">Resume Scanner</span>
                </h2>
                <p className="text-slate-500 font-medium">Check your resume's ATS compatibility and get instant feedback.</p>
            </div>

            {/* Upload Area */}
            <div
                className={clsx(
                    "border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer bg-white",
                    isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-400 hover:bg-slate-50",
                    file ? "bg-emerald-50/30 border-emerald-200" : "",
                    isLimited ? "opacity-60 cursor-not-allowed" : ""
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isLimited && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />

                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div
                            key="upload-prompt"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="p-4 bg-emerald-100/50 rounded-full text-emerald-600 mb-2">
                                <UploadCloud size={32} />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900">Click or Drag & Drop PDF here</p>
                            <p className="text-sm text-slate-500 mt-1 font-medium">
                                Supports PDF up to {maxUploadSizeMB ?? 5}MB
                            </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="file-selected"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-between max-w-md mx-auto bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FileText size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-900 truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-slate-500 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Job Description Input */}
            <AnimatePresence>
                {file && !result && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-6 shadow-sm">
                            <label className="block text-sm font-bold text-slate-900 mb-3 ml-1 flex items-center gap-2">
                                <FileText size={16} className="text-emerald-600" />
                                Paste Job Description (Optional)
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job requirements here to get a match score and targeted improvements..."
                                disabled={isLimited}
                                className={`w-full h-40 p-4 border border-slate-100 rounded-2xl bg-slate-50 text-sm font-medium transition-all outline-none resize-none custom-scrollbar ${isLimited ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                            />
                            <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">
                                {jobDescription.length === 0 ? "Analyzing against standard ATS benchmarks" : "Targeting specific job requirements"}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2">
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            {/* Analyze Button */}
            {file && !result && (
                <div className="flex justify-center">
                    <button
                        onClick={analyzeResume}
                        disabled={isAnalyzing || isLimited}
                        className="flex items-center gap-2 px-8 py-4 bg-slate-900 font-bold text-white rounded-xl shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="animate-spin" size={20} /> Analyzing compatibility...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={20} /> Analyze Resume
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Results */}
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Score Card */}
                        <div className="md:col-span-1 bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center relative shadow-sm overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-transparent" />
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                                    <circle
                                        cx="96" cy="96" r="80"
                                        stroke="currentColor" strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray="502.65"
                                        strokeDashoffset={502.65 - (502.65 * result.score) / 100}
                                        className={clsx(
                                            result.score >= 80 ? "text-emerald-500" :
                                                result.score >= 60 ? "text-yellow-500" : "text-red-500"
                                        )}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className={clsx(
                                        "text-5xl font-black tracking-tighter",
                                        result.score >= 80 ? "text-emerald-600" :
                                            result.score >= 60 ? "text-yellow-600" : "text-red-600"
                                    )}>{result.score}</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ATS Score</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative">
                            <h3 className="text-lg font-black text-slate-900 mb-4">Analysis Summary</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">{result.summary}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-8">
                            <h3 className="text-emerald-700 font-bold mb-6 flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-100 rounded-lg">
                                    <CheckCircle2 size={18} />
                                </div>
                                Strengths
                            </h3>
                            <ul className="space-y-4">
                                {result.strengths.map((item, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-700 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-8">
                            <h3 className="text-orange-700 font-bold mb-6 flex items-center gap-2">
                                <div className="p-1.5 bg-orange-100 rounded-lg">
                                    <AlertTriangle size={18} />
                                </div>
                                Improvements Needed
                            </h3>
                            <ul className="space-y-4">
                                {result.weaknesses.map((item, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-700 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 lg:p-10">
                        <h3 className="text-indigo-900 font-bold mb-6 flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-100 rounded-lg">
                                <Sparkles size={18} className="text-indigo-600" />
                            </div>
                            Actionable Suggestions
                        </h3>
                        <ul className="space-y-4">
                            {result.suggestions.map((item, i) => (
                                <li key={i} className="flex gap-3 text-sm text-indigo-900/80 font-medium items-start">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold mt-0.5 shrink-0">
                                        {i + 1}
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                </motion.div>
            )}
        </div>
    );
}
