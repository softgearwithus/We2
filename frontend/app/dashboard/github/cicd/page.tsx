'use client';

import React from 'react';
import { Workflow, CheckCircle2 } from 'lucide-react';

export default function CICDPage() {
    return (
        <div className="max-w-full max-w-[1400px] mx-auto min-h-[calc(100vh-8rem)] flex flex-col pt-6 font-sans">
            <header className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-slate-500 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                    <Workflow className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">CI/CD Pipelines</h1>
                    <p className="text-slate-500 font-medium">Master Continuous Integration & Continuous Deployment</p>
                </div>
            </header>

            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Workflow className="w-12 h-12 text-slate-700" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-4">Automation Bootcamp Coming Soon</h2>
                <p className="text-slate-500 max-w-lg mb-8 leading-relaxed">
                    Learn how to automate your testing and deployment workflows using GitHub Actions. This interactive module is currently under construction and will be available in the next curriculum update.
                </p>

                <div className="flex flex-col gap-4 text-sm font-medium text-slate-600 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full max-w-md">
                    <h3 className="font-bold text-slate-900 mb-2">What you'll learn:</h3>
                    <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-emerald-500" /> Writing your first GitHub Action</div>
                    <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-emerald-500" /> Automated testing on Pull Requests</div>
                    <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-emerald-500" /> Deploying to AWS/Vercel securely</div>
                </div>
            </div>
        </div>
    );
}
