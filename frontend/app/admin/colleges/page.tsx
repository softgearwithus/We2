'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreVertical, GraduationCap, MapPin, Users, Settings2, Trash2, ExternalLink, Download, Building2, TrendingUp } from 'lucide-react';
import CollegeManager from '@/app/components/admin/CollegeManager';

export default function CollegesPage() {
    const [selectedCollege, setSelectedCollege] = useState<any>(null);
    const [colleges, setColleges] = useState<any[]>([]);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const loadColleges = async () => {
        try {
            const token = localStorage.getItem('accessToken') || '';
            const { fetchColleges } = await import('@/app/lib/colleges');
            const data = await fetchColleges(token);
            const normalized = data.map((c: any) => ({
                id: c.id,
                code: c.code,
                name: c.name,
                location: c.location,
                type: c.type,
                students: c.studentCount || 0,
                status: c.status || 'Active',
                years: c.years || [],
                departments: c.departments || [],
                studentCohorts: [],
            }));
            setColleges(normalized);

            if (selectedCollege) {
                const updated = normalized.find((c: any) => c.id === selectedCollege.id);
                if (updated) setSelectedCollege(updated);
            }
        } catch (error) {
            setColleges([]);
        }
    };

    useEffect(() => {
        loadColleges();

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedCollege]);

    const handleUpdateCollege = async (updatedCollege: any) => {
        try {
            const token = localStorage.getItem('accessToken') || '';
            const { updateCollege } = await import('@/app/lib/colleges');
            await updateCollege(token, updatedCollege.id, {
                name: updatedCollege.name,
                code: updatedCollege.code || updatedCollege.id,
                location: updatedCollege.location,
                type: updatedCollege.type,
                years: updatedCollege.years,
                departments: updatedCollege.departments,
                adminEmail: updatedCollege.adminEmail,
            });
            await loadColleges();
        } catch (error) {
            // ignore
        }
    };

    const handleDeleteCollege = async (id: string) => {
        if (!confirm('Are you sure you want to delete this institution? All data will be permanently removed.')) return;
        try {
            const token = localStorage.getItem('accessToken') || '';
            const { deleteCollege } = await import('@/app/lib/colleges');
            await deleteCollege(token, id);
            await loadColleges();
            setActiveMenu(null);
        } catch (error) {
            // ignore
        }
    };

    if (selectedCollege) {
        return (
            <div className="max-w-5xl mx-auto">
                <CollegeManager
                    college={selectedCollege}
                    onClose={() => setSelectedCollege(null)}
                    onUpdate={handleUpdateCollege}
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institution Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Onboard and manage educational partners.</p>
                </div>
                <Link
                    href="/admin/colleges/create"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all text-sm w-fit"
                >
                    <Plus size={18} />
                    Onboard New
                </Link>
            </div>

            {/* Simple Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Institutions', value: colleges.length, icon: Building2, color: 'text-blue-600' },
                    { label: 'Active Placements', value: 12, icon: TrendingUp, color: 'text-emerald-600' },
                    { label: 'Total Students', value: colleges.reduce((acc, c) => acc + (c.students || 0), 0).toLocaleString(), icon: Users, color: 'text-indigo-600' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg bg-slate-50 ${stat.color} border border-slate-100`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* List Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-sm">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-xs transition-all bg-white"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        <Filter size={14} />
                        Filter List
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institution</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Students</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Management</th>
                                <th className="px-4 py-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {colleges.map((college) => (
                                <tr key={college.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold border border-slate-200 text-sm">
                                                {college.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{college.name}</p>
                                            <p className="text-[10px] font-medium text-slate-400 uppercase">{college.code || college.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <MapPin size={12} />
                                            <span className="text-xs font-medium">{college.location}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                            {college.students}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => setSelectedCollege(college)}
                                            className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white transition-all font-bold text-[11px] uppercase tracking-wider"
                                        >
                                            Manage
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 relative">
                                        <button
                                            onClick={() => setActiveMenu(activeMenu === college.id ? null : college.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {activeMenu === college.id && (
                                            <div
                                                ref={menuRef}
                                                className="absolute right-4 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200"
                                            >
                                                <div className="p-1 border-b border-slate-100">
                                                    <button
                                                        onClick={() => setSelectedCollege(college)}
                                                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                                                    >
                                                        <Settings2 size={14} className="text-slate-400" />
                                                        Overview
                                                    </button>
                                                    <button className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                                                        <Download size={14} className="text-slate-400" />
                                                        Export CSV
                                                    </button>
                                                </div>
                                                <div className="p-1">
                                                    <button
                                                        onClick={() => handleDeleteCollege(college.id)}
                                                        className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {colleges.length === 0 && (
                        <div className="p-12 text-center">
                            <Building2 size={40} className="text-slate-200 mx-auto mb-4" />
                            <p className="text-sm font-bold text-slate-400">No institutions found. Onboard your first college to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
