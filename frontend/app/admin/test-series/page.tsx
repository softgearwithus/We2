'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, PenTool, ClipboardCheck } from 'lucide-react';

export default function AdminTestSeriesHub() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 pb-6">
                <div>
                    <Link href="/admin/students" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-4 transition-colors">
                        <ArrowLeft size={18} /> Back to Admin
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Test Series Control Center</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage MCQs and WriteX prompts powering the student test series.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    href="/admin/test-series/mcqs"
                    className="group bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all"
                >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <BookOpen size={22} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">MCQ Library</h2>
                    <p className="text-sm text-slate-500 mt-2">Create, edit, and batch import subject and company question banks.</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-indigo-600 font-bold text-sm">
                        Manage MCQs <ClipboardCheck size={16} />
                    </div>
                </Link>

                <Link
                    href="/admin/test-series/writex"
                    className="group bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all"
                >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <PenTool size={22} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">WriteX Prompts</h2>
                    <p className="text-sm text-slate-500 mt-2">Publish and activate WriteX prompts for AI evaluation.</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-emerald-600 font-bold text-sm">
                        Manage WriteX <PenTool size={16} />
                    </div>
                </Link>

                <Link
                    href="/admin/test-series/companies"
                    className="group bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all"
                >
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-black text-slate-900">Companies</h2>
                    <p className="text-sm text-slate-500 mt-2">Manage the list of companies available for practice.</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-orange-600 font-bold text-sm">
                        Manage Companies <ClipboardCheck size={16} />
                    </div>
                </Link>

                <Link
                    href="/admin/test-series/builder"
                    className="group bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all"
                >
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-black text-slate-900">Test Series Builder</h2>
                    <p className="text-sm text-slate-500 mt-2">Construct modules, subjects, and link questions for company tests.</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-rose-600 font-bold text-sm">
                        Build Curriculum <PenTool size={16} />
                    </div>
                </Link>
            </div>
        </div>
    );
}
