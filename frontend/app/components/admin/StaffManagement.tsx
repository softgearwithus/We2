'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Shield, X, Mail, User, Search, ChevronLeft, Download } from 'lucide-react';

interface StaffMember {
    name: string;
    email: string;
    role: string;
    roleLabel?: string;
    dept?: string;
    department?: string;
    year?: string;
    id: string;
    credentialId?: string;
    password?: string;
    tempPassword?: string;
}

interface StaffManagementProps {
    college: {
        id: string;
        name: string;
        years: string[];
        departments: string[];
    };
    staff: StaffMember[];
    onUpdateStaff: (updatedStaff: StaffMember[]) => void;
}

export default function StaffManagement({ college, staff, onUpdateStaff }: StaffManagementProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'College Admin',
        dept: '',
        year: ''
    });
    const [loading, setLoading] = useState(false);

    const isNonAdmin = formData.role !== 'College Admin';
    const isFormIncomplete = !formData.name || !formData.email || (isNonAdmin && (!formData.dept || !formData.year));

    const addStaff = async () => {
        if (isFormIncomplete) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken') || '';
            const { createCollegeStaff, fetchCollegeStaff } = await import('@/app/lib/colleges');
            const roleMap: Record<string, string> = {
                'College Admin': 'college_admin',
                'HOD': 'college_admin',
                'Mentor': 'mentor',
                'Viewer': 'college_admin',
            };
            await createCollegeStaff(token, college.id, {
                name: formData.name,
                email: formData.email,
                role: roleMap[formData.role] || 'mentor',
                roleLabel: formData.role,
                department: formData.dept || null,
                year: formData.year || null,
            });
            const updated = await fetchCollegeStaff(token, college.id);
            onUpdateStaff(updated);
            setFormData({
                name: '',
                email: '',
                role: 'College Admin',
                dept: '',
                year: ''
            });
        } finally {
            setLoading(false);
        }
    };

    const removeStaff = async (id: string) => {
        const token = localStorage.getItem('accessToken') || '';
        const { deleteCollegeStaff, fetchCollegeStaff } = await import('@/app/lib/colleges');
        await deleteCollegeStaff(token, college.id, id);
        const updated = await fetchCollegeStaff(token, college.id);
        onUpdateStaff(updated);
    };

    const downloadStaffCSV = () => {
        if (staff.length === 0) return;

        const headers = ['System ID', 'Name', 'Email', 'Role', 'Password', 'Department', 'Year'];
        const rows = staff.map(s => [
            s.credentialId || s.id,
            s.name,
            s.email,
            s.role,
            s.tempPassword || s.password || 'N/A',
            s.department || s.dept || 'Full Access',
            s.year || 'Full Access'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${college.name}_Staff_Credentials.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        const loadStaff = async () => {
            try {
                const token = localStorage.getItem('accessToken') || '';
                const { fetchCollegeStaff } = await import('@/app/lib/colleges');
                const updated = await fetchCollegeStaff(token, college.id);
                onUpdateStaff(updated);
            } catch (error) {
                // ignore
            }
        };
        loadStaff();
    }, [college.id]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Staff Roles & Access</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Assign hierarchical access to college administrators, HODs, and mentors.</p>
                </div>
                {staff.length > 0 && (
                    <button
                        onClick={downloadStaffCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl border border-emerald-100 transition-all font-bold text-xs shadow-sm"
                    >
                        <Download size={14} />
                        Download Staff List (CSV)
                    </button>
                )}
            </div>

            {/* Manual Entry Form */}
            <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="e.g. Dr. Ramesh Kumar"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium bg-slate-50/30"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                placeholder="name@college.edu.in"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium bg-slate-50/30"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value, dept: '', year: '' })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 bg-white font-medium outline-none transition-all"
                        >
                            <option value="College Admin">College Admin (Full Access)</option>
                            <option value="HOD">Department HOD</option>
                            <option value="Mentor">Year Mentor</option>
                            <option value="Viewer">Viewer</option>
                        </select>
                    </div>

                    {isNonAdmin && (
                        <>
                            <div className="space-y-2 animate-in slide-in-from-left-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    Department <span className="text-red-500 font-black">*</span>
                                </label>
                                <select
                                    value={formData.dept}
                                    onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 bg-white font-medium outline-none transition-all"
                                >
                                    <option value="">Select Department</option>
                                    {college.departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2 animate-in slide-in-from-left-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    Academic Year <span className="text-red-500 font-black">*</span>
                                </label>
                                <select
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 bg-white font-medium outline-none transition-all"
                                >
                                    <option value="">Select Year</option>
                                    {college.years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={addStaff}
                    disabled={isFormIncomplete || loading}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200"
                >
                    <UserPlus size={20} />
                    {loading ? 'Saving...' : 'Generate & Add Staff Credential'}
                </button>
            </div>

            {/* Staff List */}
            {staff.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Added Staff Members ({staff.length})</p>
                        <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest">Randomized Passwords Generated</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {staff.map((s) => (
                            <div key={s.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/20 flex items-center justify-between group animate-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-black text-slate-900 text-lg leading-none tracking-tight">{s.name}</p>
                                <span className="text-[9px] font-black uppercase bg-blue-600 text-white px-2 py-1 rounded-lg">
                                    {s.roleLabel || s.role}
                                </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5 font-bold">
                                            <p className="text-xs text-slate-400">{s.email}</p>
                                            {(s.department || s.dept || s.year) && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <p className="text-[10px] text-blue-500 uppercase tracking-wider">
                                                        Scope: {s.department || s.dept} {s.year ? `[${s.year}]` : ''}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Credentials Preview</p>
                                        <div className="flex flex-col gap-1 items-end">
                                            <p className="text-[10px] font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md leading-none">ID: {s.credentialId || s.id}</p>
                                            <p className="text-[10px] font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md leading-none">PW: {s.tempPassword || s.password || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeStaff(s.id)}
                                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                    >
                                        <X size={20} />
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
