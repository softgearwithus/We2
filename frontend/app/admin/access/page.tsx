'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Copy, KeyRound, Users, Building2, Plus } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

type RoleOption = 'student' | 'college_admin' | 'company_admin';

const ROLE_LABELS: Record<RoleOption, string> = {
    student: 'Student Account',
    college_admin: 'Institute Admin',
    company_admin: 'Company Admin',
};

export default function AdminAccessPage() {
    const { user } = useAuth();
    const [role, setRole] = useState<RoleOption>('student');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [collegeId, setCollegeId] = useState('');
    const [collegeName, setCollegeName] = useState('');
    const [collegeCode, setCollegeCode] = useState('');
    const [collegeCity, setCollegeCity] = useState('');
    const [collegeState, setCollegeState] = useState('');
    const [collegeEmail, setCollegeEmail] = useState('');
    const [colleges, setColleges] = useState<Array<{ id: string; name: string; code?: string | null }>>([]);
    const [collegeLoading, setCollegeLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const canSetCollegeId = useMemo(() => user?.role === 'super_admin', [user?.role]);
    const isSuperAdmin = user?.role === 'super_admin';

    const fetchColleges = async () => {
        if (!isSuperAdmin) return;
        const token = localStorage.getItem('accessToken') || '';
        const response = await fetch(`${apiBase}/colleges`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
            const data = await response.json();
            setColleges(data || []);
        }
    };

    useMemo(() => {
        fetchColleges();
    }, [isSuperAdmin]);

    const handleGenerate = () => {
        const random = Math.random().toString(36).slice(2, 8);
        setEmail(`${role.replace('_', '.')}.${random}@prep0.dev`);
        setPassword(`Temp${Math.random().toString(36).slice(2, 6)}!A1`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!email || !password) {
            setMessage({ type: 'error', text: 'Email and password are required.' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken') || '';
            const payload = {
                email,
                password,
                role,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                collegeId: canSetCollegeId ? (collegeId || undefined) : undefined,
            };

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
                throw new Error(errorText || 'Failed to create user');
            }

            setMessage({ type: 'success', text: 'Account created successfully.' });
            fetchColleges();
            setFirstName('');
            setLastName('');
            setEmail('');
            setPassword('');
            setCollegeId('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error?.message || 'Failed to create account.' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCollege = async () => {
        if (!collegeName) {
            setMessage({ type: 'error', text: 'College name is required.' });
            return;
        }
        setCollegeLoading(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('accessToken') || '';
            const response = await fetch(`${apiBase}/colleges`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: collegeName,
                    code: collegeCode || undefined,
                    city: collegeCity || undefined,
                    state: collegeState || undefined,
                    contactEmail: collegeEmail || undefined,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to create college');
            }

            setMessage({ type: 'success', text: 'College created successfully.' });
            setCollegeName('');
            setCollegeCode('');
            setCollegeCity('');
            setCollegeState('');
            setCollegeEmail('');
            fetchColleges();
        } catch (error: any) {
            setMessage({ type: 'error', text: error?.message || 'Failed to create college.' });
        } finally {
            setCollegeLoading(false);
        }
    };

    const handleCopy = async (value: string) => {
        if (!value) return;
        await navigator.clipboard.writeText(value);
        setMessage({ type: 'success', text: 'Copied to clipboard.' });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Access Control</h1>
                    <p className="text-slate-500">Create college admins, company admins, or student logins.</p>
                </div>
                <button
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-bold shadow"
                >
                    <KeyRound size={16} /> Generate Credentials
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    {!isSuperAdmin ? (
                        <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4">
                            Only super admins can create accounts.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Account Type</label>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                                {(Object.keys(ROLE_LABELS) as RoleOption[]).map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setRole(option)}
                                        className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${role === option
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200'}
                                        `}
                                    >
                                        {ROLE_LABELS[option]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">First Name</label>
                                <input
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                    placeholder="Jane"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Last Name</label>
                                <input
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <div className="mt-2 flex items-center gap-2">
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                        placeholder="admin@college.edu"
                                    />
                                    <button type="button" onClick={() => handleCopy(email)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <div className="mt-2 flex items-center gap-2">
                                    <input
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                        placeholder="TempPass123!"
                                    />
                                    <button type="button" onClick={() => handleCopy(password)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {canSetCollegeId && (
                            <div>
                                <label className="text-sm font-medium text-slate-700">College / Institute</label>
                                <select
                                    value={collegeId}
                                    onChange={(e) => setCollegeId(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white"
                                >
                                    <option value="">Select a college</option>
                                    {colleges.map((college) => (
                                        <option key={college.id} value={college.id}>
                                            {college.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <div className="text-xs text-slate-400">Roles map to login portals (student / college / industry).</div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-6 py-3 text-sm font-bold shadow-lg shadow-blue-500/20 disabled:opacity-60"
                            >
                                <Users size={16} /> {loading ? 'Creating...' : 'Create Account'}
                            </button>
                        </div>
                        </form>
                    )}
                    </div>

                    {isSuperAdmin && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Building2 size={18} /> Create College
                                    </h2>
                                    <p className="text-xs text-slate-500">Add a college/institute to scope analytics and admin access.</p>
                                </div>
                                <button
                                    onClick={handleCreateCollege}
                                    disabled={collegeLoading}
                                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-xs font-bold"
                                >
                                    <Plus size={14} /> {collegeLoading ? 'Saving...' : 'Add College'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">College Name</label>
                                    <input
                                        value={collegeName}
                                        onChange={(e) => setCollegeName(e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                        placeholder="IIT Bombay"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Code (optional)</label>
                                    <input
                                        value={collegeCode}
                                        onChange={(e) => setCollegeCode(e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                        placeholder="IITB"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">City (optional)</label>
                                    <input
                                        value={collegeCity}
                                        onChange={(e) => setCollegeCity(e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                        placeholder="Mumbai"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">State (optional)</label>
                                    <input
                                        value={collegeState}
                                        onChange={(e) => setCollegeState(e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                        placeholder="Maharashtra"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Contact Email (optional)</label>
                                    <input
                                        value={collegeEmail}
                                        onChange={(e) => setCollegeEmail(e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                        placeholder="admin@college.edu"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-900">Quick Tips</div>
                            <div className="text-xs text-slate-500">Use generated credentials for testing.</div>
                        </div>
                    </div>
                    <ul className="text-xs text-slate-500 space-y-2">
                        <li>Only super admins can create accounts.</li>
                        <li>Assign a college ID to scope the institute portal.</li>
                        <li>Use generated credentials for QA and onboarding.</li>
                    </ul>
                    {isSuperAdmin && colleges.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Existing Colleges</div>
                            <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
                                {colleges.map((college) => (
                                    <div key={college.id} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                                        <div>
                                            <div className="font-semibold text-slate-800">{college.name}</div>
                                            <div className="text-[11px] text-slate-400">ID: {college.id}</div>
                                        </div>
                                        <button
                                            onClick={() => setCollegeId(college.id)}
                                            className="text-brand-orange font-bold"
                                        >
                                            Use ID
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {message && (
                        <div className={`text-xs font-semibold px-3 py-2 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
