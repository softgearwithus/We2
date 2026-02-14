'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Code2, Database, Globe, Layers, Lock } from 'lucide-react';

const SUBJECTS = [
    { title: 'Data Structures & Algorithms', icon: Code2, count: '15 Tests', color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Operating Systems', icon: Layers, count: '8 Tests', color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Database Management Systems', icon: Database, count: '10 Tests', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Computer Networks', icon: Globe, count: '6 Tests', color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Object Oriented Programming', icon: BookOpen, count: '12 Tests', color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

export default function SubjectTestsPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto p-6 lg:p-12">
                <header className="mb-12">
                    <Link href="/dashboard/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Test Series
                    </Link>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                        Subject Wise Tests <span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-lg text-slate-500">
                        Deep dive into core computer science subjects.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SUBJECTS.map((subject, idx) => (
                        <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all cursor-pointer group">
                            <div className={`w-14 h-14 ${subject.bg} ${subject.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <subject.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{subject.title}</h3>
                            <p className="text-slate-500 font-medium text-sm mb-6">{subject.count}</p>

                            <button className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-colors flex items-center justify-center gap-2">
                                <Lock size={16} /> Unlock Tests
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
