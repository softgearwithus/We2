'use client';

import { useState } from 'react';
import { ChevronLeft, GraduationCap, Users, Plus, CheckCircle2, Trash2, Download } from 'lucide-react';
import StaffManagement from '@/app/components/admin/StaffManagement';

interface StudentCredential {
    uid: string;
    password: string;
}

interface StudentCohort {
    id: string;
    year: string;
    dept: string;
    count: number;
    credentials: StudentCredential[];
}

interface CollegeManagerProps {
    college: {
        id: string;
        name: string;
        years: string[];
        departments: string[];
        students?: number;
        staff?: any[];
        studentCohorts?: StudentCohort[];
    };
    onClose: () => void;
    onUpdate: (updatedCollege: any) => void;
}

const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

export default function CollegeManager({ college, onClose, onUpdate }: CollegeManagerProps) {
    const [activeTab, setActiveTab] = useState<'staff' | 'students'>('students');
    const [studentCohorts, setStudentCohorts] = useState<StudentCohort[]>(college.studentCohorts || []);
    const [staff, setStaff] = useState<any[]>(college.staff || []);

    // Student Form State
    const [studentFormData, setStudentFormData] = useState({
        year: '',
        dept: '',
        count: 0
    });

    const handleAddCohort = () => {
        if (!studentFormData.year || !studentFormData.dept || studentFormData.count <= 0) return;

        const cohortId = `${college.id}-${studentFormData.dept.slice(0, 3).toUpperCase()}-${studentFormData.year}`;

        // Check if cohort already exists
        if (studentCohorts.find(c => c.id === cohortId)) {
            alert('This cohort already has generated credentials. Please update or delete the existing one first.');
            return;
        }

        const credentials: StudentCredential[] = [];
        for (let i = 1; i <= studentFormData.count; i++) {
            credentials.push({
                uid: `${cohortId}-${i.toString().padStart(3, '0')}`,
                password: generatePassword()
            });
        }

        const newCohort: StudentCohort = {
            id: cohortId,
            year: studentFormData.year,
            dept: studentFormData.dept,
            count: studentFormData.count,
            credentials
        };

        const updatedCohorts = [...studentCohorts, newCohort];
        setStudentCohorts(updatedCohorts);

        // Update the college object and persist
        const updatedCollege = {
            ...college,
            studentCohorts: updatedCohorts,
            students: updatedCohorts.reduce((acc, curr) => acc + curr.count, 0)
        };
        onUpdate(updatedCollege);

        setStudentFormData({ year: '', dept: '', count: 0 });
    };

    const handleRemoveCohort = (id: string) => {
        const updatedCohorts = studentCohorts.filter(c => c.id !== id);
        setStudentCohorts(updatedCohorts);

        const updatedCollege = {
            ...college,
            studentCohorts: updatedCohorts,
            students: updatedCohorts.reduce((acc, curr) => acc + curr.count, 0)
        };
        onUpdate(updatedCollege);
    };

    const handleUpdateStaff = (updatedStaff: any[]) => {
        setStaff(updatedStaff);
        const updatedCollege = {
            ...college,
            staff: updatedStaff
        };
        onUpdate(updatedCollege);
    }

    const downloadCohortCSV = (cohort: StudentCohort) => {
        const headers = ['UID', 'Password', 'Year', 'Department'];
        const rows = cohort.credentials.map(c => [
            c.uid,
            c.password,
            cohort.year,
            cohort.dept
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${college.name}_${cohort.dept}_${cohort.year}_Students.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold"
                >
                    <ChevronLeft size={16} />
                    Back to Dashboard
                </button>
                <div className="flex gap-4">
                    <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-2">
                        <GraduationCap size={16} className="text-blue-600" />
                        <span className="text-sm font-black text-blue-700">{college.students || 0} Students</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-xl">
                            {college.name[0]}
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{college.name}</h2>
                    </div>
                    <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl">
                        Management portal for generating credentials and controlling access for students and staff.
                    </p>
                </div>
                <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200 shadow-inner">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'students' ? 'bg-white text-blue-600 shadow-md transform scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Students
                    </button>
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'staff' ? 'bg-white text-blue-600 shadow-md transform scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Staff Roles
                    </button>
                </div>
            </div>

            <div className="min-h-[500px]">
                {activeTab === 'students' ? (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        {/* Student Generator Form */}
                        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/30">
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                <Plus size={20} className="text-blue-600" />
                                Bulk Generate Student Credentials
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
                                    <select
                                        value={studentFormData.year}
                                        onChange={(e) => setStudentFormData({ ...studentFormData, year: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 bg-slate-50/50 font-bold text-sm outline-none transition-all"
                                    >
                                        <option value="">Select Year</option>
                                        {college.years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                                    <select
                                        value={studentFormData.dept}
                                        onChange={(e) => setStudentFormData({ ...studentFormData, dept: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 bg-slate-50/50 font-bold text-sm outline-none transition-all"
                                    >
                                        <option value="">Select Dept</option>
                                        {college.departments.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Strength</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 120"
                                        value={studentFormData.count || ''}
                                        onChange={(e) => setStudentFormData({ ...studentFormData, count: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 bg-slate-50/50 font-bold text-sm outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleAddCohort}
                                disabled={!studentFormData.year || !studentFormData.dept || studentFormData.count <= 0}
                                className="w-full mt-6 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale shadow-xl shadow-blue-500/20"
                            >
                                <CheckCircle2 size={18} />
                                Generate Batch Credentials
                            </button>
                        </div>

                        {/* Generated cohorts table */}
                        {studentCohorts.length > 0 && (
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Student Cohorts</p>
                                    <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded tracking-widest uppercase">Unique Passwords Encrypted</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left font-bold">
                                        <thead className="bg-slate-50/50">
                                            <tr>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Batch Details</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Strength</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Export Action</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {studentCohorts.map((cohort) => (
                                                <tr key={cohort.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-6 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-sm font-black text-slate-900 leading-none">{cohort.dept}</span>
                                                            <span className="text-[10px] font-black text-blue-600 mt-1 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md leading-none">{cohort.year}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center text-slate-700">{cohort.count}</td>
                                                    <td className="px-8 py-6 text-center">
                                                        <button
                                                            onClick={() => downloadCohortCSV(cohort)}
                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 font-bold text-xs"
                                                        >
                                                            <Download size={14} />
                                                            Download CSV
                                                        </button>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <button
                                                            onClick={() => handleRemoveCohort(cohort.id)}
                                                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-left-4 duration-500">
                        <StaffManagement
                            college={college}
                            staff={staff}
                            onUpdateStaff={handleUpdateStaff}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
