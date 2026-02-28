'use client';

import Link from 'next/link';
import { ArrowLeft, Code2, Database, Sparkles } from 'lucide-react';

export default function AdminTrainingHub() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 pb-6">
                <div>
                    <Link href="/admin/students" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-4 transition-colors">
                        <ArrowLeft size={18} /> Back to Admin
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Training Control Center</h1>
                    <p className="text-slate-500 mt-1 font-medium">Monitor the DSA and SQL problem banks powering training mode.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    href="/admin/training/dsa"
                    className="group bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all"
                >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Code2 size={22} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">DSA Training</h2>
                    <p className="text-sm text-slate-500 mt-2">Browse and monitor problem coverage across difficulty and topics.</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-blue-600 font-bold text-sm">
                        Manage DSA <Sparkles size={16} />
                    </div>
                </Link>

                <Link
                    href="/admin/training/sql"
                    className="group bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all"
                >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Database size={22} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">SQL Training</h2>
                    <p className="text-sm text-slate-500 mt-2">Review the SQL training corpus and dataset coverage.</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-emerald-600 font-bold text-sm">
                        Manage SQL <Sparkles size={16} />
                    </div>
                </Link>
            </div>
        </div>
    );
}
