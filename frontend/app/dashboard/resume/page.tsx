'use client';

import React, { useState, useRef } from 'react';
import ResumeForm from '@/app/components/resume/ResumeForm';
import ResumePreview from '@/app/components/resume/ResumePreview';
import { initialResumeState, ResumeData } from '@/app/lib/resume.types';
import { useReactToPrint } from 'react-to-print';
import { Download, Layout, ChevronLeft, ArrowRight, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import ATSScanner from './_components/ats-scanner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResumeBuilderPage() {
    const [view, setView] = useState<'landing' | 'templates' | 'builder' | 'scanner'>('landing');
    const [data, setData] = useState<ResumeData>(initialResumeState);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `${data.personalInfo.fullName.replace(' ', '_')}_Resume`,
    });

    const templates = [
        { id: 'modern', name: 'Modern Professional', description: 'Clean, indigo-accented design with a focused layout.', previewColor: 'bg-indigo-500' },
        { id: 'classic', name: 'Classic Serif', description: 'Traditional, elegant design using serif typography for a formal look.', previewColor: 'bg-slate-700' },
        { id: 'minimal', name: 'Minimalist', description: 'Ultra-clean, single-column design focusing purely on content.', previewColor: 'bg-slate-400' },
    ];

    const selectTemplate = (id: string) => {
        setData(prev => ({ ...prev, templateId: id }));
        setView('builder');
    };

    return (
        <div className="h-[calc(100vh-7rem)] flex flex-col bg-slate-50 overflow-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 rounded-2xl border border-slate-200">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shrink-0 sticky top-0">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
                    <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                        <Layout className="text-indigo-600" size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Resume<span className="text-indigo-600">Center</span></h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {view !== 'landing' && (
                        <button
                            onClick={() => {
                                if (view === 'builder') setView('templates');
                                else setView('landing');
                            }}
                            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            <ChevronLeft size={16} /> {view === 'builder' ? 'Change Template' : 'Back'}
                        </button>
                    )}

                    {view === 'builder' && (
                        <button
                            onClick={() => handlePrint && handlePrint()}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95"
                        >
                            <Download size={18} /> Export PDF
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {view === 'landing' && (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-y-auto"
                    >
                        {/* Hero Section */}
                        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                                <Sparkles size={12} /> Career Acceleration
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                Build Your Future,<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">One Resume at a Time.</span>
                            </h2>
                            <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
                                Create a ATS-optimized resume in minutes or analyze your existing one to get hired faster.
                            </p>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
                            {/* Builder Card */}
                            <motion.div
                                whileHover={{ y: -4 }}
                                onClick={() => setView('templates')}
                                className="group bg-white border border-slate-200 hover:border-indigo-200 p-8 rounded-3xl cursor-pointer transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-100 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                                        <FileText className="text-indigo-600 group-hover:text-white transition-colors" size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Resume Builder</h3>
                                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                        Use our professional, field-tested templates to create a resume that stands out.
                                    </p>

                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    {i}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm group-hover:gap-3 transition-all">
                                            Start Building <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Scanner Card */}
                            <motion.div
                                whileHover={{ y: -4 }}
                                onClick={() => setView('scanner')}
                                className="group bg-white border border-slate-200 hover:border-emerald-200 p-8 rounded-3xl cursor-pointer transition-all shadow-sm hover:shadow-xl hover:shadow-emerald-100 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
                                        <CheckCircle2 className="text-emerald-600 group-hover:text-white transition-colors" size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">ATS Scanner</h3>
                                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                        Get an instant score and AI-driven feedback to optimize your resume for algorithms.
                                    </p>

                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg">
                                            <Sparkles size={12} /> AI Powered
                                        </span>
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm group-hover:gap-3 transition-all">
                                            Analyze Now <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {view === 'templates' && (
                    <motion.div
                        key="templates"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col items-center p-12 overflow-y-auto custom-scrollbar"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Choose your template</h2>
                            <p className="text-slate-500 font-medium">Select a design that best fits your career goals.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
                            {templates.map((tpl) => (
                                <motion.div
                                    key={tpl.id}
                                    whileHover={{ y: -8 }}
                                    onClick={() => selectTemplate(tpl.id)}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-[3/4] bg-white rounded-2xl border-2 border-slate-100 p-4 mb-4 group-hover:border-indigo-500 transition-all shadow-sm group-hover:shadow-xl group-hover:shadow-indigo-100 overflow-hidden relative">
                                        <div className={`w-full h-full rounded-lg ${tpl.previewColor} opacity-10 flex items-center justify-center`}>
                                            <FileText size={48} className="text-slate-400 opacity-50" />
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-white to-transparent pt-12">
                                            <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                                Select Template
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{tpl.name}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{tpl.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {view === 'builder' && (
                    <motion.div
                        key="builder"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex overflow-hidden z-10"
                    >
                        {/* Left Panel: Editor */}
                        <div className="w-1/2 md:w-[45%] h-full border-r border-slate-200 bg-white overflow-y-auto custom-scrollbar">
                            <ResumeForm data={data} onChange={setData} />
                        </div>

                        {/* Right Panel: Preview */}
                        <div className="w-1/2 md:w-[55%] h-full bg-slate-100/50 overflow-hidden flex items-center justify-center relative">
                            <div className="absolute inset-0 overflow-auto p-8 custom-scrollbar flex justify-center">
                                <div className="scale-[0.85] origin-top shadow-2xl rounded-sm">
                                    <ResumePreview ref={printRef} data={data} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'scanner' && (
                    <motion.div
                        key="scanner"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 z-10"
                    >
                        <ATSScanner />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
