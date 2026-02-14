'use client';

import React, { useState, useRef } from 'react';
import ResumeForm from '@/app/components/resume/ResumeForm';
import ResumePreview from '@/app/components/resume/ResumePreview';
import { initialResumeState, ResumeData } from '@/app/lib/resume.types';
import { useReactToPrint } from 'react-to-print';
import { Download, Share2, Eye, Layout } from 'lucide-react';

export default function ResumeBuilderPage() {
    const [data, setData] = useState<ResumeData>(initialResumeState);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `${data.personalInfo.fullName.replace(' ', '_')}_Resume`,
    });

    return (
        <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
            {/* Top Bar */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Layout className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">Resume Builder</h1>
                        <p className="text-xs text-slate-400">Professional Template</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <Eye size={18} /> Preview
                    </button>
                    <button
                        onClick={() => handlePrint && handlePrint()}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        <Download size={18} /> Export PDF
                    </button>
                </div>
            </header>

            {/* Main Content - Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Editor */}
                <div className="w-1/2 md:w-[45%] h-full border-r border-slate-800 bg-slate-900/30">
                    <ResumeForm data={data} onChange={setData} />
                </div>

                {/* Right Panel: Preview */}
                <div className="w-1/2 md:w-[55%] h-full bg-slate-200 overflow-hidden flex items-center justify-center relative">
                    <div className="absolute inset-0 overflow-auto p-8 custom-scrollbar flex justify-center">
                        <div className="scale-[0.8] origin-top transform-gpu shadow-2xl">
                            <ResumePreview ref={printRef} data={data} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
