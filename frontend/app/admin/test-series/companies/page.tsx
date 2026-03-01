'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Plus, Loader2, Trash2, Edit3, Save, X } from 'lucide-react';
import { getStoredToken } from '@/app/lib/auth-storage';
import { fetchCompaniesList, createCompany, updateCompany, deleteCompany } from '@/app/lib/test-series-builder';

export default function AdminCompaniesManager() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [form, setForm] = useState({ name: '', logoUrl: '', isActive: true });
    const [editId, setEditId] = useState<string | null>(null);

    const token = typeof window !== 'undefined' ? (getStoredToken('admin') || '') : '';

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await fetchCompaniesList(token, true);
            setCompanies(data);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to load companies.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) loadData();
    }, [token]);

    const handleCreate = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            const payload = { ...form } as any;
            if (!payload.logoUrl) delete payload.logoUrl;

            await createCompany(token, payload);
            setForm({ name: '', logoUrl: '', isActive: true });
            setMessage({ type: 'success', text: 'Company created.' });
            await loadData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to create company.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async (id: string) => {
        setIsSaving(true);
        setMessage(null);
        try {
            const payload = { ...form } as any;
            if (!payload.logoUrl) delete payload.logoUrl;

            await updateCompany(token, id, payload);
            setEditId(null);
            setForm({ name: '', logoUrl: '', isActive: true });
            setMessage({ type: 'success', text: 'Company updated.' });
            await loadData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update company.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this company? It will cascade delete its modules and chapters.')) return;
        setIsSaving(true);
        setMessage(null);
        try {
            await deleteCompany(token, id);
            setMessage({ type: 'success', text: 'Company deleted.' });
            await loadData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to delete company.' });
        } finally {
            setIsSaving(false);
        }
    };

    const startEdit = (c: any) => {
        setEditId(c.id);
        setForm({ name: c.name, logoUrl: c.logoUrl || '', isActive: c.isActive });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 pb-6">
                <div>
                    <Link href="/admin/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-4 transition-colors">
                        <ArrowLeft size={18} /> Back to Test Series Hub
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Companies Management</h1>
                    <p className="text-slate-500 mt-1 font-medium">Add or remove target companies for the test series.</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{editId ? 'Edit Company' : 'Add Company'}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Company Name</label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Google"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logo URL (Optional)</label>
                        <input
                            value={form.logoUrl}
                            onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                            placeholder="https://..."
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
                        />
                    </div>

                    <div className="flex items-center gap-3 md:col-span-2">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                            id="isActive"
                            className="w-5 h-5 rounded text-orange-600 border-slate-300 focus:ring-orange-600"
                        />
                        <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Active (Visible to students)</label>
                    </div>

                    <div className="flex items-end gap-3 md:col-span-2">
                        {editId ? (
                            <>
                                <button
                                    onClick={() => handleUpdate(editId)}
                                    disabled={isSaving}
                                    className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                                </button>
                                <button
                                    onClick={() => {
                                        setEditId(null);
                                        setForm({ name: '', logoUrl: '', isActive: true });
                                    }}
                                    className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm flex items-center gap-2"
                                >
                                    <X size={16} /> Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleCreate}
                                disabled={isSaving || !form.name.trim()}
                                className="px-5 py-3 rounded-xl bg-orange-600 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add Company
                            </button>
                        )}
                    </div>
                </div>

                {message && (
                    <div className={`mt-6 px-4 py-3 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Existing Companies</h3>
                {isLoading ? (
                    <div className="py-10 text-center text-slate-400">
                        <Loader2 className="animate-spin mx-auto mb-3" /> Loading...
                    </div>
                ) : (
                    <div className="space-y-3">
                        {companies.map((c) => (
                            <div key={c.id} className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${c.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    <span className="font-bold text-slate-900">{c.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => startEdit(c)} className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 text-sm font-medium flex gap-2 items-center">
                                        <Edit3 size={14} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(c.id)} className="px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 text-sm font-medium flex gap-2 items-center">
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        {companies.length === 0 && <div className="text-slate-500 text-center py-6">No companies added yet.</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
