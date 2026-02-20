'use client';

import { useState } from 'react';
import { UserPlus, Shield, X, Mail, User } from 'lucide-react';

interface StaffMember {
    name: string;
    email: string;
    role: string;
    dept?: string;
    year?: string;
    id: string;
}

interface Step5Props {
    collegeId: string;
    years: string[];
    departments: string[];
}

export default function Step5InstituteRoles({ collegeId, years, departments }: Step5Props) {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'College Admin',
        dept: '',
        year: ''
    });

    const addStaff = () => {
        if (!formData.name || !formData.email) return;

        const newStaff: StaffMember = {
            ...formData,
            id: `${collegeId}-${formData.role === 'College Admin' ? 'ADM' : formData.role === 'HOD' ? 'HOD' : 'STAFF'}-${Date.now().toString().slice(-4)}`
        };

        setStaff([...staff, newStaff]);
        setFormData({
            name: '',
            email: '',
            role: 'College Admin',
            dept: '',
            year: ''
        });
    };

    const removeStaff = (id: string) => {
        setStaff(staff.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Step 5 — Institute Roles & Credentials</h2>
                <p className="text-sm text-slate-500 mt-1">Assign hierarchical access to college administrators, HODs, and mentors.</p>
            </div>

            {/* Manual Entry Form */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium bg-white"
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="email"
                            placeholder="Personal/Work Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium bg-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value, dept: '', year: '' })}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 bg-white font-medium outline-none"
                    >
                        <option value="College Admin">College Admin (Full Access)</option>
                        <option value="HOD">Department HOD</option>
                        <option value="Mentor">Year Mentor</option>
                        <option value="Viewer">Viewer</option>
                    </select>

                    {(formData.role === 'HOD' || formData.role === 'Mentor' || formData.role === 'Viewer') && (
                        <select
                            value={formData.dept}
                            onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 bg-white font-medium outline-none"
                        >
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    )}

                    {(formData.role === 'Mentor' || formData.role === 'Viewer') && (
                        <select
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 bg-white font-medium outline-none"
                        >
                            <option value="">Select Year</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    )}
                </div>

                <button
                    onClick={addStaff}
                    disabled={!formData.name || !formData.email}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
                >
                    <UserPlus size={18} />
                    Add Staff Member
                </button>
            </div>

            {/* Staff List */}
            {staff.length > 0 && (
                <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Added Staff ({staff.length})</p>
                    <div className="grid grid-cols-1 gap-3">
                        {staff.map((s) => (
                            <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group animate-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-slate-900 leading-none">{s.name}</p>
                                            <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                                {s.role}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{s.email}</p>
                                        {(s.dept || s.year) && (
                                            <p className="text-[10px] text-slate-500 mt-1 font-medium">
                                                Scope: {s.dept} {s.year ? `(${s.year})` : '(Full Dept)'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Generated ID</p>
                                        <p className="text-xs font-mono font-bold text-blue-600">{s.id}</p>
                                    </div>
                                    <button
                                        onClick={() => removeStaff(s.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
