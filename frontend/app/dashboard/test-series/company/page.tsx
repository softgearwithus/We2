'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Globe, Laptop, Lock, Rocket, Target } from 'lucide-react';

const COMPANIES = [
    { title: 'Google', icon: Globe, count: '10 Mock Tests', color: 'text-red-500', bg: 'bg-red-50' },
    { title: 'Amazon', icon: Target, count: '12 Mock Tests', color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Microsoft', icon: Layout, count: '8 Mock Tests', color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'TCS NQT', icon: Building2, count: '20 Mock Tests', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'Infosys', icon: Laptop, count: '15 Mock Tests', color: 'text-sky-500', bg: 'bg-sky-50' },
    { title: 'Startup Kit', icon: Rocket, count: '5 Mock Tests', color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

// Reusing Layout icon import above, renaming it slightly for clarity if needed or just using it.
import { Layout } from 'lucide-react';

export default function CompanyTestsPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto p-6 lg:p-12">
                <header className="mb-12">
                    <Link href="/dashboard/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Test Series
                    </Link>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                        Company Wise Tests <span className="text-brand-orange">.</span>
                    </h1>
                    <p className="text-lg text-slate-500">
                        Targeted preparation for your dream companies.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {COMPANIES.map((company, idx) => (
                        <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all cursor-pointer group">
                            <div className={`w-14 h-14 ${company.bg} ${company.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <company.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{company.title}</h3>
                            <p className="text-slate-500 font-medium text-sm mb-6">{company.count}</p>

                            <button className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-orange-50 hover:text-brand-orange hover:border-orange-100 transition-colors flex items-center justify-center gap-2">
                                <Lock size={16} /> Unlock Tests
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
