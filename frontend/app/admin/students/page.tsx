'use client';

import { fetchApi } from '../../lib/apiClient';

import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    MoreVertical,
    ShieldAlert,
    Crown,
    Phone,
    Mail,
    Building2,
    Clock,
    UserCheck,
    Loader2,
    X,
    User
} from 'lucide-react';
import { Student, StudentsData, fetchAdminStudents } from '@/app/lib/admin';
import { getStoredToken } from '@/app/lib/auth-storage';

export default function AdminStudentsPage() {
    const [data, setData] = useState<StudentsData | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCollege, setSelectedCollege] = useState<string>('All');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Security Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'disable' | 'delete'>('disable');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [confirmationText, setConfirmationText] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const token = getStoredToken('admin') || '';
                const result = await fetchAdminStudents(token);
                setData(result);
                setStudents(result.students);
            } catch (error) {
                console.error("Failed to load students data", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Derive unique colleges from the student list
    const uniqueColleges = ['All', ...Array.from(new Set(students.map(s => s.college)))].sort();

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCollege = selectedCollege === 'All' || s.college === selectedCollege;

        return matchesSearch && matchesCollege && s.status === 'active';
    });

    const openModal = (student: Student, type: 'disable' | 'delete') => {
        setSelectedStudent(student);
        setActionType(type);
        setConfirmationText('');
        setIsModalOpen(true);
        setActiveMenu(null);
    };

    const handleConfirmAction = async () => {
        if (!selectedStudent || confirmationText.toLowerCase() !== actionType) return;

        const token = getStoredToken('admin') || '';
        if (!token) return;
        try {
            if (actionType === 'delete') {
                await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/admin/students/${selectedStudent.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStudents(prev => prev.filter(s => s.id !== selectedStudent.id));
            } else {
                await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/admin/students/${selectedStudent.id}/disable`, {
                    method: 'PATCH',
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, status: 'disabled' } : s));
            }
        } finally {
            setIsModalOpen(false);
        }

    };

    const formatRelativeTime = (isoString: string) => {
        const diff = Date.now() - new Date(isoString).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        return `${days} days ago`;
    };

    const getSubscriptionBadge = (sub: string) => {
        if (sub === 'placement_plus' || sub === 'standard' || sub.includes('standard')) return <span className="px-2.5 py-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-1 w-fit"><Crown size={12} /> EMBLE Pro Member</span>;
        const label = sub.replace(/_/g, ' ').replace(/\w/g, (c) => c.toUpperCase());
        if (sub === 'free') return <span className="px-2.5 py-1 text-xs font-bold text-slate-500 bg-slate-100 rounded-lg">Free Tier</span>;
        if (sub === 'we2_max' || sub === 'pro' || sub.includes('pro')) return <span className="px-2.5 py-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-1 w-fit"><Crown size={12} /> EMBLE Pro Member</span>;
        return <span className="px-2.5 py-1 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg w-fit">{label}</span>;
    };

    if (isLoading || !data) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-sm font-bold uppercase tracking-widest">Loading Student Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-full max-w-[1400px] mx-auto space-y-8 pb-12">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        Student Directory
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">
                            {data.totalStudents.toLocaleString()} Total
                        </span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Manage user accounts, subscriptions, and access.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
                        <h3 className="text-3xl font-black text-slate-900">{data.totalStudents.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Crown size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Premium Users</p>
                        <h3 className="text-3xl font-black text-slate-900">{data.premiumUsers.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="w-12 h-12 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700 flex items-center justify-center relative z-10">
                        <UserCheck size={24} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">New This Week</p>
                        <h3 className="text-3xl font-black text-white">+{data.newThisWeek}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Main Table Area */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, email, ID, or college..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all bg-white shadow-sm"
                            />
                        </div>
                        <div className="w-full sm:w-auto shrink-0 relative">
                            <select
                                value={selectedCollege}
                                onChange={(e) => setSelectedCollege(e.target.value)}
                                className="w-full sm:w-64 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all bg-white text-slate-700 cursor-pointer appearance-none shadow-sm"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                            >
                                {uniqueColleges.map((college, idx) => (
                                    <option key={idx} value={college}>
                                        {college === 'All' ? 'All Institutions & Learners' : college === 'Independent Learner' ? 'Independent Learners Only' : `College: ${college}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider w-[35%]">Student</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider w-[25%]">Contact</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider w-[25%]">Institution / Tier</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                No active students found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                                            <img loading="lazy" decoding="async" src={`https://api.dicebear.com/7.x/notionists/svg?seed=${student.avatarBase}`} alt={student.name} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer">{student.name}</p>
                                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{student.id.toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 space-y-1">
                                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                                        <Mail size={12} className="text-slate-400" />
                                                        {student.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                                        <Phone size={12} className="text-slate-400" />
                                                        {student.mobile || '--'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 space-y-2">
                                                    <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                                        {student.college === 'Independent Learner' ? (
                                                            <User size={14} className="text-blue-500" />
                                                        ) : (
                                                            <Building2 size={14} className="text-slate-400" />
                                                        )}
                                                        <span className={`truncate max-w-[200px] ${student.college === 'Independent Learner' ? 'text-blue-600 font-bold' : ''}`} title={student.college}>{student.college}</span>
                                                    </div>
                                                    <div>
                                                        {getSubscriptionBadge(student.subscription)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right relative">
                                                    <button
                                                        onClick={() => setActiveMenu(activeMenu === student.id ? null : student.id)}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {activeMenu === student.id && (
                                                        <div className="absolute right-12 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200 text-left">
                                                            <div className="p-1">
                                                                <button
                                                                    onClick={() => openModal(student, 'disable')}
                                                                    className="w-full text-left px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 rounded-lg flex items-center gap-2"
                                                                >
                                                                    <ShieldAlert size={14} />
                                                                    Disable Account
                                                                </button>
                                                                <button
                                                                    onClick={() => openModal(student, 'delete')}
                                                                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 mt-1"
                                                                >
                                                                    <X size={14} />
                                                                    Delete Permanently
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

            {/* Security Confirmation Modal */}
            {isModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 bg-rose-50 border-b border-rose-100">
                            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 border border-rose-200 shadow-sm">
                                <ShieldAlert size={24} />
                            </div>
                            <h2 className="text-xl font-black text-rose-900 mb-1">
                                {actionType === 'delete' ? 'Permanently Delete' : 'Disable'} Account
                            </h2>
                            <p className="text-sm border-rose-800 font-medium text-rose-700/80">
                                You are about to {actionType} the account for <strong className="text-rose-900 break-all">{selectedStudent.email}</strong>.
                                {actionType === 'delete' ? ' This action cannot be undone and will erase all associated student data.' : ' They will no longer be able to log in until re-enabled.'}
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                    Type <span className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded font-mono select-none">{actionType}</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={confirmationText}
                                    onChange={(e) => setConfirmationText(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all font-mono"
                                    placeholder={actionType}
                                    autoComplete="off"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setConfirmationText('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    disabled={confirmationText.toLowerCase() !== actionType}
                                    className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm disabled:shadow-none translate-y-0 active:translate-y-[1px]"
                                >
                                    Confirm Action
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
