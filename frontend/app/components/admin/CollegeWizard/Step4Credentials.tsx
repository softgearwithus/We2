'use client';

import { useState, useMemo } from 'react';

interface Step4Props {
    collegeId: string;
    years: string[];
    departments: string[];
}

export default function Step4Credentials({ collegeId, years, departments }: Step4Props) {
    const [selectedYear, setSelectedYear] = useState(years[0] || '');
    const [selectedDept, setSelectedDept] = useState(departments[0] || '');
    const [numStudents, setNumStudents] = useState<number>(0);

    const previewUids = useMemo(() => {
        if (!collegeId || !selectedDept || !selectedYear || numStudents <= 0) return [];

        // Shorten department name for UID (e.g. "Computer Science" -> "CSE")
        // For now, let's use the first 3 chars or a simplified mapping
        const deptCode = selectedDept.slice(0, 3).toUpperCase();

        const uids = [];
        const limit = Math.min(numStudents, 10); // Show only first 10 for preview
        for (let i = 1; i <= limit; i++) {
            const count = i.toString().padStart(3, '0');
            uids.push(`${collegeId}-${deptCode}-${selectedYear}-${count}`);
        }
        return uids;
    }, [collegeId, selectedDept, selectedYear, numStudents]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Step 4 — Generate Student Credentials</h2>
                <p className="text-sm text-slate-500 mt-1">UIDs will be auto-generated with temporary passwords for students.</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-4">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <span className="material-symbols-outlined text-lg font-bold">info</span>
                </div>
                <div>
                    <p className="text-sm text-orange-800 font-medium">UID Format Info</p>
                    <p className="text-xs text-orange-700/80 mt-1 leading-relaxed">
                        UIDs will be auto-generated in the format <strong>{collegeId || 'COLLEGEID'}-DEPT-{selectedYear || 'YEAR'}-001</strong>.
                        A temporary password will be sent with each UID.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Year</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 bg-white font-medium outline-none transition-all"
                    >
                        {years.length === 0 && <option value="">No years selected</option>}
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Department</label>
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 bg-white font-medium outline-none transition-all"
                    >
                        {departments.length === 0 && <option value="">No departments added</option>}
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Number of Students</label>
                    <input
                        type="number"
                        value={numStudents || ''}
                        onChange={(e) => setNumStudents(parseInt(e.target.value) || 0)}
                        placeholder="e.g. 120"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium"
                    />
                </div>
            </div>

            {previewUids.length > 0 && (
                <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preview UIDs</p>
                    <div className="p-4 bg-slate-900 rounded-2xl flex flex-wrap gap-x-4 gap-y-2 font-mono text-emerald-400 text-xs shadow-inner">
                        {previewUids.map((uid, i) => (
                            <span key={i}>{uid}</span>
                        ))}
                        {numStudents > 10 && <span className="text-slate-500 italic">... and {numStudents - 10} more</span>}
                    </div>
                </div>
            )}
        </div>
    );
}
