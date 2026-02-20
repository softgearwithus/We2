'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Plus, Search, Trash2, X } from 'lucide-react';

interface Testimonial {
    id: string;
    name: string;
    role: string;
    image: string;
    package?: string | null;
    text: string;
    verified: boolean;
    isFeatured: boolean;
    isActive: boolean;
    sortOrder: number;
}

const EMPTY = {
    name: '',
    role: '',
    image: '',
    package: '',
    text: '',
    verified: true,
    isFeatured: false,
    isActive: true,
    sortOrder: 0,
};

export default function AdminTestimonialsPage() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const [items, setItems] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY);

    const load = async () => {
        setLoading(true);
        const token = localStorage.getItem('accessToken') || '';
        const response = await fetch(`${apiBase}/testimonials`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
            const data = await response.json();
            setItems(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return items;
        return items.filter((item) => item.name.toLowerCase().includes(query) || item.role.toLowerCase().includes(query));
    }, [items, search]);

    const create = async () => {
        if (!form.name || !form.role || !form.text || !form.image) return;
        setSaving(true);
        const token = localStorage.getItem('accessToken') || '';
        const response = await fetch(`${apiBase}/testimonials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(form),
        });
        setSaving(false);
        if (response.ok) {
            setOpen(false);
            setForm(EMPTY);
            load();
        }
    };

    const update = async (id: string, patch: Partial<Testimonial>) => {
        const token = localStorage.getItem('accessToken') || '';
        await fetch(`${apiBase}/testimonials/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(patch),
        });
        load();
    };

    const remove = async (id: string) => {
        const token = localStorage.getItem('accessToken') || '';
        await fetch(`${apiBase}/testimonials/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        load();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Testimonials</h1>
                    <p className="text-slate-500">Manage homepage testimonials and featured quotes.</p>
                </div>
                <button
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-bold shadow"
                >
                    <Plus size={16} /> Add Testimonial
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search testimonials"
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm"
                        />
                    </div>
                    <div className="text-xs text-slate-400">{filtered.length} items</div>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {loading && (
                        <div className="flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={16} /> Loading...</div>
                    )}
                    {!loading && filtered.map((item) => (
                        <div key={item.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-full object-cover border border-white shadow" />
                                <div>
                                    <div className="font-bold text-slate-900">{item.name}</div>
                                    <div className="text-xs text-slate-500">{item.role}</div>
                                    <div className="text-xs text-emerald-600 font-bold">{item.package}</div>
                                </div>
                                {item.verified && <CheckCircle2 size={16} className="text-blue-500 ml-auto" />}
                            </div>
                            <p className="text-sm text-slate-500 mt-4">"{item.text}"</p>
                            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                                <label className="flex items-center gap-2 text-slate-500">
                                    <input
                                        type="checkbox"
                                        checked={item.isActive}
                                        onChange={(e) => update(item.id, { isActive: e.target.checked })}
                                    />
                                    Active
                                </label>
                                <label className="flex items-center gap-2 text-slate-500">
                                    <input
                                        type="checkbox"
                                        checked={item.isFeatured}
                                        onChange={(e) => update(item.id, { isFeatured: e.target.checked })}
                                    />
                                    Featured
                                </label>
                                <label className="flex items-center gap-2 text-slate-500">
                                    <input
                                        type="checkbox"
                                        checked={item.verified}
                                        onChange={(e) => update(item.id, { verified: e.target.checked })}
                                    />
                                    Verified
                                </label>
                                <input
                                    value={item.sortOrder}
                                    onChange={(e) => update(item.id, { sortOrder: Number(e.target.value) })}
                                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-20"
                                    type="number"
                                    placeholder="Order"
                                />
                                <button
                                    onClick={() => remove(item.id)}
                                    className="ml-auto text-rose-600 font-bold"
                                >
                                    <Trash2 size={14} className="inline" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={() => setOpen(false)}>
                    <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Add Testimonial</h2>
                            <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-slate-100">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm"
                                placeholder="Name"
                            />
                            <input
                                value={form.role}
                                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm"
                                placeholder="Role"
                            />
                            <input
                                value={form.image}
                                onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm"
                                placeholder="Photo URL"
                            />
                            <input
                                value={form.package}
                                onChange={(e) => setForm((prev) => ({ ...prev, package: e.target.value }))}
                                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm"
                                placeholder="Package (e.g. ₹30 LPA)"
                            />
                            <textarea
                                value={form.text}
                                onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
                                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm min-h-[120px]"
                                placeholder="Testimonial quote"
                            />
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <label className="flex items-center gap-2 text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={form.verified}
                                        onChange={(e) => setForm((prev) => ({ ...prev, verified: e.target.checked }))}
                                    />
                                    Verified
                                </label>
                                <label className="flex items-center gap-2 text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={form.isFeatured}
                                        onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                                    />
                                    Featured
                                </label>
                                <label className="flex items-center gap-2 text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                                    />
                                    Active
                                </label>
                            </div>
                            <button
                                onClick={create}
                                disabled={saving}
                                className="w-full bg-slate-900 text-white rounded-lg py-3 text-sm font-bold flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Save Testimonial
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
