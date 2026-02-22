'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function GitTestingPage() {
    return (
        <div className="max-w-[1400px] mx-auto min-h-[calc(100vh-8rem)] flex flex-col pt-6 font-sans">
            <header className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m8 2 1.88 1.88" /><path d="M14.12 3.88 16 2" /><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" /><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" /><path d="M12 20v-9" /><path d="M6.53 9C4.6 8.8 3 7.1 3 5" /><path d="M6 13H2" /><path d="M3 21c0-2.1 1.7-3.9 3.8-4" /><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" /><path d="M22 13h-4" /><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" /></svg>
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Git Testing Environments</h1>
                    <p className="text-slate-500 font-medium">Learn to test code effectively within version control</p>
                </div>
            </header>

            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="m8 2 1.88 1.88" /><path d="M14.12 3.88 16 2" /><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" /><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" /><path d="M12 20v-9" /><path d="M6.53 9C4.6 8.8 3 7.1 3 5" /><path d="M6 13H2" /><path d="M3 21c0-2.1 1.7-3.9 3.8-4" /><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" /><path d="M22 13h-4" /><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" /></svg>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-4">Testing Module In Development</h2>
                <p className="text-slate-500 max-w-lg mb-8 leading-relaxed">
                    Learn best practices for running unit tests, integration tests, and staging environments before merging code. This interactive sandbox is being built by our team.
                </p>

                <div className="flex flex-col gap-4 text-sm font-medium text-slate-600 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full max-w-md">
                    <h3 className="font-bold text-slate-900 mb-2">Upcoming Lessons:</h3>
                    <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-emerald-500" /> Pre-commit Testing Hooks</div>
                    <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-emerald-500" /> Branch protection rules</div>
                    <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-emerald-500" /> Resolving test failure merges</div>
                </div>
            </div>
        </div>
    );
}
