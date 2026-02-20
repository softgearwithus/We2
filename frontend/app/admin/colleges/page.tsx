'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, Search, Users, KeyRound, Sparkles, Copy } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

interface College {
    id: string;
    name: string;
    code?: string | null;
    city?: string | null;
    state?: string | null;
    contactEmail?: string | null;
}

interface CreatedCredential {
    email: string;
    password: string;
    role: string;
}

export default function CollegesAdminPage() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'super_admin';
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const [colleges, setColleges] = useState<College[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const [selectedCollegeId, setSelectedCollegeId] = useState('');
    const [adminFirstName, setAdminFirstName] = useState('');
    const [adminLastName, setAdminLastName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [studentCount, setStudentCount] = useState(0);
    const [studentDomain, setStudentDomain] = useState('prep0.dev');
    const [created, setCreated] = useState<CreatedCredential[]>([]);
    const [creating, setCreating] = useState(false);

    const fetchColleges = async () => {
        if (!isSuperAdmin) return;
        setLoading(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('accessToken') || '';
            const response = await fetch(`${apiBase}/colleges`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to load colleges');
            const data = await response.json();
            setColleges(data || []);
        } catch (error: any) {
            setMessage(error?.message || 'Failed to load colleges');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchColleges();
    }, [isSuperAdmin]);

    const filteredColleges = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return colleges;
        return colleges.filter((college) => {
            return (
                college.name.toLowerCase().includes(query)
                || (college.code || '').toLowerCase().includes(query)
                || (college.city || '').toLowerCase().includes(query)
                || (college.state || '').toLowerCase().includes(query)
            );
        });
    }, [colleges, search]);

    const generateAdminCredentials = () => {
        const random = Math.random().toString(36).slice(2, 6);
        setAdminEmail(`admin.${random}@${studentDomain}`);
        setAdminPassword(`Admin${Math.random().toString(36).slice(2, 6)}!A1`);
    };

    const createAccount = async (payload: { email: string; password: string; role: string; firstName?: string; lastName?: string; collegeId?: string; }) => {
        const token = localStorage.getItem('accessToken') || '';
        const response = await fetch(`${apiBase}/users/admin/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to create account');
        }
    };

    const handleCreateWizard = async () => {
        if (!selectedCollegeId || !adminEmail || !adminPassword) {
            setMessage('Select a college and provide admin credentials.');
            return;
        }
        setCreating(true);
        setMessage(null);
        setCreated([]);
        try {
            await createAccount({
                email: adminEmail,
                password: adminPassword,
                role: 'college_admin',
                firstName: adminFirstName || undefined,
                lastName: adminLastName || undefined,
                collegeId: selectedCollegeId,
            });

            const createdList: CreatedCredential[] = [
                { email: adminEmail, password: adminPassword, role: 'college_admin' },
            ];

            if (studentCount > 0) {
                for (let i = 1; i <= studentCount; i += 1) {
                    const email = `student.${i}.${Math.random().toString(36).slice(2, 5)}@${studentDomain}`;
                    const password = `Student${Math.random().toString(36).slice(2, 6)}!A1`;
                    await createAccount({
                        email,
                        password,
                        role: 'student',
                        collegeId: selectedCollegeId,
                    });
                    createdList.push({ email, password, role: 'student' });
                }
            }

            setCreated(createdList);
            setMessage('Accounts created successfully.');
        } catch (error: any) {
            setMessage(error?.message || 'Failed to create accounts');
        } finally {
            setCreating(false);
        }
    };

    const copyAll = async () => {
        if (!created.length) return;
        const content = created.map((item) => `${item.role},${item.email},${item.password}`).join('\n');
        await navigator.clipboard.writeText(content);
        setMessage('Credentials copied to clipboard.');
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Building2 size={20} /> Colleges
                    </h1>
                    <p className="text-slate-500">Manage partner colleges and create institute access.</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search colleges by name, code, city"
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm"
                        />
                    </div>
                    <button
                        onClick={fetchColleges}
                        className="text-xs font-bold text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50"
                    >
                        Refresh
                    </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {loading && <div className="text-sm text-slate-400">Loading colleges...</div>}
                    {!loading && filteredColleges.map((college) => (
                        <div key={college.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/40">
                            <div className="text-sm font-bold text-slate-900">{college.name}</div>
                            <div className="text-xs text-slate-500 mt-1">{college.city || '—'} {college.state ? `• ${college.state}` : ''}</div>
                            <div className="text-[11px] text-slate-400 mt-2">ID: {college.id}</div>
                            {college.code && <div className="text-[11px] text-slate-400">Code: {college.code}</div>}
                        </div>
                    ))}
                    {!loading && !filteredColleges.length && (
                        <div className="text-sm text-slate-400">No colleges found.</div>
                    )}
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles size={18} /> Create Institute Admin + Students
                        </h2>
                        <p className="text-xs text-slate-500">Generate login credentials for a college in one flow.</p>
                    </div>
                </div>

                {!isSuperAdmin ? (
                    <div className="mt-4 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4">
                        Only super admins can create accounts.
                    </div>
                ) : (
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">College</label>
                                <select
                                    value={selectedCollegeId}
                                    onChange={(e) => setSelectedCollegeId(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white"
                                >
                                    <option value="">Select a college</option>
                                    {colleges.map((college) => (
                                        <option key={college.id} value={college.id}>{college.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Admin First Name</label>
                                    <input
                                        value={adminFirstName}
                                        onChange={(e) => setAdminFirstName(e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                        placeholder="Ananya"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Admin Last Name</label>
                                    <input
                                        value={adminLastName}
                                        onChange={(e) => setAdminLastName(e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                        placeholder="Sharma"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Admin Email</label>
                                    <input
                                        value={adminEmail}
                                        onChange={(e) => setAdminEmail(e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                        placeholder="admin@college.edu"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Admin Password</label>
                                    <input
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                        placeholder="AdminPass123!"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={generateAdminCredentials}
                                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50"
                                >
                                    <KeyRound size={14} /> Generate Admin Credentials
                                </button>
                                <div className="text-xs text-slate-400">Uses the domain below.</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Student Accounts</label>
                                <div className="mt-2 flex items-center gap-3">
                                    <input
                                        type="number"
                                        min={0}
                                        max={20}
                                        value={studentCount}
                                        onChange={(e) => setStudentCount(Math.min(20, Math.max(0, Number(e.target.value))))}
                                        className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                    />
                                    <span className="text-xs text-slate-500">(0 - 20)</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Email Domain</label>
                                <input
                                    value={studentDomain}
                                    onChange={(e) => setStudentDomain(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                    placeholder="college.edu"
                                />
                            </div>

                            <button
                                onClick={handleCreateWizard}
                                disabled={creating}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-6 py-3 text-sm font-bold shadow-lg shadow-blue-500/20 disabled:opacity-60"
                            >
                                <Users size={16} /> {creating ? 'Creating...' : 'Create Accounts'}
                            </button>

                            {message && (
                                <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                                    {message}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {created.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Created Credentials</h3>
                        <button
                            onClick={copyAll}
                            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50"
                        >
                            <Copy size={14} /> Copy All
                        </button>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {created.map((item, index) => (
                            <div key={`${item.email}-${index}`} className="border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                                <div className="font-bold text-slate-800">{item.role}</div>
                                <div>Email: {item.email}</div>
                                <div>Password: {item.password}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
