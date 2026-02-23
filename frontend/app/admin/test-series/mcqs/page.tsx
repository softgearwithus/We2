'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    BookOpen,
    Plus,
    Search,
    Loader2,
    Trash2,
    Edit3,
    Save,
    X,
    Upload,
} from 'lucide-react';
import {
    createMcq,
    deleteMcq,
    fetchAdminMcqs,
    fetchMcqGroups,
    importMcqsCsv,
    McqAdminItem,
    McqGroup,
    UpdateMcqPayload,
    updateMcq,
    bulkDeleteMcqs,
} from '@/app/lib/test-series-admin';

const SUBJECT_KEYS = [
    { value: 'english', label: 'English' },
    { value: 'aptitude', label: 'Aptitude' },
    { value: 'logical_reasoning', label: 'Logical Reasoning' },
    { value: 'computer_science', label: 'Computer Science' },
];

const emptyForm = {
    category: 'subject' as 'subject' | 'company',
    group: '',
    question: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
};

export default function AdminMcqManager() {
    const [items, setItems] = useState<McqAdminItem[]>([]);
    const [groups, setGroups] = useState<McqGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [csvPayload, setCsvPayload] = useState('');
    const [csvApiKey, setCsvApiKey] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [filters, setFilters] = useState({
        category: 'subject',
        groupKey: '',
        search: '',
        page: 1,
    });

    const [form, setForm] = useState({ ...emptyForm });
    const [editId, setEditId] = useState<string | null>(null);

    const pageSize = 50;

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';

    const loadData = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const [listRes, groupRes] = await Promise.all([
                fetchAdminMcqs(token, {
                    category: filters.category,
                    groupKey: filters.groupKey,
                    search: filters.search,
                    page: filters.page,
                    limit: pageSize,
                }),
                fetchMcqGroups(token, filters.category as 'subject' | 'company'),
            ]);
            setItems(listRes.items);
            setGroups(groupRes);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to load MCQs.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token) return;
        loadData();
    }, [filters.category, filters.groupKey, filters.search, filters.page]);

    const groupOptions = useMemo(() => {
        if (filters.category === 'subject') {
            return SUBJECT_KEYS.map((item) => ({ key: item.value, label: item.label }));
        }
        return groups.map((group) => ({ key: group.key, label: group.label }));
    }, [filters.category, groups]);

    const handleCreate = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            await createMcq(token, {
                category: form.category,
                group: form.group,
                question: form.question,
                options: form.options,
                correctOptionIndex: form.correctOptionIndex,
            });
            setForm({ ...emptyForm, category: form.category });
            setMessage({ type: 'success', text: 'MCQ created successfully.' });
            await loadData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to create MCQ.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async (id: string) => {
        setIsSaving(true);
        setMessage(null);
        try {
            const payload: UpdateMcqPayload = {
                category: form.category,
                group: form.group,
                question: form.question,
                options: form.options,
                correctOptionIndex: form.correctOptionIndex,
            };
            await updateMcq(token, id, payload);
            setEditId(null);
            setForm({ ...emptyForm, category: form.category });
            setMessage({ type: 'success', text: 'MCQ updated successfully.' });
            await loadData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update MCQ.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsSaving(true);
        setMessage(null);
        try {
            await deleteMcq(token, id);
            setMessage({ type: 'success', text: 'MCQ deleted.' });
            await loadData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to delete MCQ.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkDelete = async () => {
        if (!filters.search && !filters.groupKey && !filters.category) {
            setMessage({ type: 'error', text: 'Add a search or filter before bulk delete.' });
            return;
        }
        const confirmed = window.confirm('Delete all MCQs that match the current filters? This cannot be undone.');
        if (!confirmed) return;
        setIsSaving(true);
        setMessage(null);
        try {
            const result = await bulkDeleteMcqs(token, {
                category: filters.category,
                groupKey: filters.groupKey,
                search: filters.search,
            });
            setMessage({ type: 'success', text: `Deleted ${result.deletedCount || 0} MCQs.` });
            await loadData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to bulk delete MCQs.' });
        } finally {
            setIsSaving(false);
        }
    };

    const startEdit = (mcq: McqAdminItem) => {
        setEditId(mcq.id);
        setForm({
            category: mcq.category,
            group: mcq.groupLabel,
            question: mcq.question,
            options: mcq.options,
            correctOptionIndex: mcq.correctOptionIndex,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCsvImport = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            await importMcqsCsv(csvApiKey, csvPayload);
            setCsvPayload('');
            setCsvApiKey('');
            setIsBulkOpen(false);
            setMessage({ type: 'success', text: 'CSV import completed.' });
            await loadData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'CSV import failed.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 pb-6">
                <div>
                    <Link href="/admin/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-4 transition-colors">
                        <ArrowLeft size={18} /> Back to Test Series
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">MCQ Library</h1>
                    <p className="text-slate-500 mt-1 font-medium">Build subject and company question banks for student practice.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsBulkOpen(true)}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Upload size={16} /> Bulk Import
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{editId ? 'Edit MCQ' : 'Create MCQ'}</h2>
                        <p className="text-xs text-slate-500">Ensure group labels match student test series categories.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as 'subject' | 'company' }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
                        >
                            <option value="subject">Subject</option>
                            <option value="company">Company</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Group Label</label>
                        <input
                            value={form.group}
                            onChange={(e) => setForm((prev) => ({ ...prev, group: e.target.value }))}
                            placeholder={form.category === 'subject' ? 'English' : 'Google'}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question</label>
                        <textarea
                            value={form.question}
                            onChange={(e) => setForm((prev) => ({ ...prev, question: e.target.value }))}
                            rows={3}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
                        />
                    </div>

                    {form.options.map((opt, idx) => (
                        <div key={idx} className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Option {idx + 1}</label>
                            <input
                                value={opt}
                                onChange={(e) =>
                                    setForm((prev) => {
                                        const updated = [...prev.options];
                                        updated[idx] = e.target.value;
                                        return { ...prev, options: updated };
                                    })
                                }
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
                            />
                        </div>
                    ))}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Correct Option</label>
                        <select
                            value={form.correctOptionIndex}
                            onChange={(e) => setForm((prev) => ({ ...prev, correctOptionIndex: Number(e.target.value) }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
                        >
                            {form.options.map((_, idx) => (
                                <option key={idx} value={idx}>
                                    Option {idx + 1}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end gap-3">
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
                                        setForm({ ...emptyForm, category: form.category });
                                    }}
                                    className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm flex items-center gap-2"
                                >
                                    <X size={16} /> Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleCreate}
                                disabled={isSaving}
                                className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add MCQ
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
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <BookOpen size={18} /> Existing MCQs
                    </div>
                    <div className="flex flex-1 gap-3">
                        <div className="flex-1 relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={filters.search}
                                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                                placeholder="Search by question or group"
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm"
                            />
                        </div>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value, groupKey: '', page: 1 }))}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
                        >
                            <option value="subject">Subject</option>
                            <option value="company">Company</option>
                        </select>
                        <select
                            value={filters.groupKey}
                            onChange={(e) => setFilters((prev) => ({ ...prev, groupKey: e.target.value, page: 1 }))}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
                        >
                            <option value="">All Groups</option>
                            {groupOptions.map((group) => (
                                <option key={group.key} value={group.key}>
                                    {group.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBulkDelete}
                            disabled={isSaving}
                            className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 font-semibold text-sm hover:bg-rose-50 disabled:opacity-50"
                        >
                            Bulk Delete
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-16 text-center text-slate-400">
                        <Loader2 className="animate-spin mx-auto mb-3" />
                        Loading MCQs...
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((mcq) => (
                            <div key={mcq.id} className="border border-slate-200 rounded-2xl p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{mcq.groupLabel}</p>
                                        <h3 className="text-base font-bold text-slate-900 mt-1">{mcq.question}</h3>
                                        <p className="text-xs text-slate-400 mt-2">Correct: Option {mcq.correctOptionIndex + 1}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => startEdit(mcq)}
                                            className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 flex items-center gap-2 text-sm"
                                        >
                                            <Edit3 size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(mcq.id)}
                                            className="px-3 py-2 rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-sm"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && (
                            <div className="py-10 text-center text-slate-500">No MCQs found for this filter.</div>
                        )}
                    </div>
                )}
            </div>

            {isBulkOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-6">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Import MCQs from CSV</h3>
                            <button onClick={() => setIsBulkOpen(false)} className="text-slate-400 hover:text-slate-900">
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Paste CSV with headers: category, group, question, options, correctOptionIndex. Use | to separate options.</p>
                        <div className="space-y-3">
                            <input
                                value={csvApiKey}
                                onChange={(e) => setCsvApiKey(e.target.value)}
                                placeholder="MCQ import API key"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                            />
                            <textarea
                                value={csvPayload}
                                onChange={(e) => setCsvPayload(e.target.value)}
                                rows={8}
                                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-mono"
                            />
                        </div>
                        <div className="mt-4 flex justify-end gap-3">
                            <button
                                onClick={() => setIsBulkOpen(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCsvImport}
                                disabled={isSaving}
                                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
                            >
                                {isSaving ? 'Importing...' : 'Import'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
