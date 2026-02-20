'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Check, Loader2, Plus, Search, Star, Trash2, X } from 'lucide-react';

type ReviewStatus = 'pending' | 'in_review' | 'approved' | 'needs_changes' | 'published';
type ReviewType = 'code_review' | 'resume' | 'project' | 'general';

interface Review {
    id: string;
    title: string;
    description: string;
    type: ReviewType;
    status: ReviewStatus;
    score: number;
    feedback?: string | null;
    reviewerNotes?: string | null;
    isPublished: boolean;
    isFeatured: boolean;
    createdAt: string;
}

const EMPTY_REVIEW = {
    title: '',
    description: '',
    type: 'general' as ReviewType,
    status: 'pending' as ReviewStatus,
    score: 0,
    feedback: '',
    reviewerNotes: '',
    isPublished: false,
    isFeatured: false,
};

export default function AdminReviewsPage() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_REVIEW);

    const loadReviews = async () => {
        setLoading(true);
        const token = localStorage.getItem('accessToken') || '';
        const response = await fetch(`${apiBase}/reviews`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
            const data = await response.json();
            setReviews(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return reviews;
        return reviews.filter((review) =>
            review.title.toLowerCase().includes(query)
            || review.description.toLowerCase().includes(query)
        );
    }, [reviews, search]);

    const handleCreate = async () => {
        if (!form.title || !form.description) return;
        setSaving(true);
        const token = localStorage.getItem('accessToken') || '';
        const response = await fetch(`${apiBase}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(form),
        });
        setSaving(false);
        if (response.ok) {
            setOpen(false);
            setForm(EMPTY_REVIEW);
            loadReviews();
        }
    };

    const updateReview = async (id: string, patch: Partial<Review>) => {
        const token = localStorage.getItem('accessToken') || '';
        await fetch(`${apiBase}/reviews/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(patch),
        });
        loadReviews();
    };

    const removeReview = async (id: string) => {
        const token = localStorage.getItem('accessToken') || '';
        await fetch(`${apiBase}/reviews/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        loadReviews();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Reviews</h1>
                    <p className="text-slate-500">Manage reviews and publish featured highlights.</p>
                </div>
                <button
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-bold shadow"
                >
                    <Plus size={16} /> Create Review
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search reviews"
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm"
                        />
                    </div>
                    <div className="text-xs text-slate-400">{filtered.length} items</div>
                </div>

                <div className="mt-6 space-y-4">
                    {loading && (
                        <div className="flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={16} /> Loading...</div>
                    )}
                    {!loading && filtered.map((review) => (
                        <div key={review.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <div className="text-xs uppercase font-bold text-slate-400">{review.type.replace('_', ' ')}</div>
                                    <div className="text-lg font-bold text-slate-900">{review.title}</div>
                                    <p className="text-sm text-slate-500 mt-1">{review.description}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => updateReview(review.id, { isFeatured: !review.isFeatured })}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold border ${review.isFeatured ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-slate-200'}`}
                                    >
                                        <Star size={14} className="inline" /> {review.isFeatured ? 'Featured' : 'Feature'}
                                    </button>
                                    <button
                                        onClick={() => updateReview(review.id, { isPublished: !review.isPublished, status: review.isPublished ? 'approved' : 'published' })}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold border ${review.isPublished ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-slate-200'}`}
                                    >
                                        <Check size={14} className="inline" /> {review.isPublished ? 'Published' : 'Publish'}
                                    </button>
                                    <button
                                        onClick={() => removeReview(review.id)}
                                        className="px-3 py-2 rounded-lg text-xs font-bold border border-rose-200 text-rose-600"
                                    >
                                        <Trash2 size={14} className="inline" /> Delete
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <select
                                    value={review.status}
                                    onChange={(e) => updateReview(review.id, { status: e.target.value as ReviewStatus })}
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_review">In Review</option>
                                    <option value="approved">Approved</option>
                                    <option value="needs_changes">Needs Changes</option>
                                    <option value="published">Published</option>
                                </select>
                                <input
                                    value={review.score}
                                    onChange={(e) => updateReview(review.id, { score: Number(e.target.value) })}
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600"
                                    type="number"
                                    placeholder="Score"
                                />
                                <div className="text-xs text-slate-400 flex items-center gap-2">
                                    <Calendar size={14} /> {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={() => setOpen(false)}>
                    <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Create Review</h2>
                            <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-slate-100">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input
                                value={form.title}
                                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm"
                                placeholder="Review title"
                            />
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm min-h-[120px]"
                                placeholder="Review description"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as ReviewType }))}
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="code_review">Code Review</option>
                                    <option value="resume">Resume</option>
                                    <option value="project">Project</option>
                                    <option value="general">General</option>
                                </select>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as ReviewStatus }))}
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_review">In Review</option>
                                    <option value="approved">Approved</option>
                                    <option value="needs_changes">Needs Changes</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    value={form.score}
                                    onChange={(e) => setForm((prev) => ({ ...prev, score: Number(e.target.value) }))}
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                    type="number"
                                    placeholder="Score"
                                />
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={form.isFeatured}
                                        onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                                    />
                                    Featured
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={form.isPublished}
                                        onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                                    />
                                    Published
                                </label>
                            </div>
                            <button
                                onClick={handleCreate}
                                disabled={saving}
                                className="w-full bg-slate-900 text-white rounded-lg py-3 text-sm font-bold flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Save Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
