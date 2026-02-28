'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, PenTool, Plus, Loader2, Trash2, Save, X, CheckCircle2 } from 'lucide-react';
import {
    createWriteXQuestion,
    deleteWriteXQuestion,
    fetchWriteXQuestions,
    updateWriteXQuestion,
    WriteXQuestion,
} from '@/app/lib/test-series-admin';
import { getStoredToken } from '@/app/lib/auth-storage';

export default function AdminWriteXManager() {
    const [questions, setQuestions] = useState<WriteXQuestion[]>([]);
    const [prompt, setPrompt] = useState('');
    const [active, setActive] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const token = typeof window !== 'undefined' ? (getStoredToken('admin') || '') : '';

    const loadQuestions = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const data = await fetchWriteXQuestions(token);
            setQuestions(data);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to load WriteX prompts.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token) return;
        loadQuestions();
    }, []);

    const handleSubmit = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            if (editId) {
                await updateWriteXQuestion(token, editId, { prompt, active });
                setMessage({ type: 'success', text: 'WriteX prompt updated.' });
            } else {
                await createWriteXQuestion(token, { prompt, active });
                setMessage({ type: 'success', text: 'WriteX prompt created.' });
            }
            setPrompt('');
            setActive(true);
            setEditId(null);
            await loadQuestions();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to save WriteX prompt.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (question: WriteXQuestion) => {
        setEditId(question.id);
        setPrompt(question.prompt);
        setActive(question.active);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleActivate = async (question: WriteXQuestion) => {
        setIsSaving(true);
        setMessage(null);
        try {
            await updateWriteXQuestion(token, question.id, { active: true });
            setMessage({ type: 'success', text: 'Prompt activated.' });
            await loadQuestions();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to activate prompt.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsSaving(true);
        setMessage(null);
        try {
            await deleteWriteXQuestion(token, id);
            setMessage({ type: 'success', text: 'Prompt deleted.' });
            await loadQuestions();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to delete prompt.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 pb-6">
                <div>
                    <Link href="/admin/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-medium mb-4 transition-colors">
                        <ArrowLeft size={18} /> Back to Test Series
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">WriteX Prompts</h1>
                    <p className="text-slate-500 mt-1 font-medium">Publish prompts and control the active WriteX task.</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <PenTool size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{editId ? 'Edit Prompt' : 'Create Prompt'}</h2>
                        <p className="text-xs text-slate-500">Set active to swap the student prompt immediately.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-medium"
                        placeholder="Write the WriteX prompt here..."
                    />

                    <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                            <input
                                type="checkbox"
                                checked={active}
                                onChange={(e) => setActive(e.target.checked)}
                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            Set as active
                        </label>
                        <div className="flex-1" />
                        {editId && (
                            <button
                                onClick={() => {
                                    setEditId(null);
                                    setPrompt('');
                                    setActive(true);
                                }}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm flex items-center gap-2"
                            >
                                <X size={16} /> Cancel
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={isSaving || !prompt.trim()}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : editId ? <Save size={16} /> : <Plus size={16} />}
                            {editId ? 'Save Prompt' : 'Create Prompt'}
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`mt-6 px-4 py-3 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-slate-700 font-bold mb-6">
                    <PenTool size={18} /> Existing Prompts
                </div>

                {isLoading ? (
                    <div className="py-16 text-center text-slate-400">
                        <Loader2 className="animate-spin mx-auto mb-3" />
                        Loading prompts...
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questions.map((question) => (
                            <div key={question.id} className="border border-slate-200 rounded-2xl p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            {question.active && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                                                    <CheckCircle2 size={12} /> Active
                                                </span>
                                            )}
                                            <span className="text-xs text-slate-400">{new Date(question.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-800 whitespace-pre-wrap">{question.prompt}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!question.active && (
                                            <button
                                                onClick={() => handleActivate(question)}
                                                className="px-3 py-2 rounded-lg border border-emerald-100 text-emerald-600 hover:bg-emerald-50 text-sm font-semibold"
                                            >
                                                Activate
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(question)}
                                            className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-600 text-sm font-semibold"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(question.id)}
                                            className="px-3 py-2 rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50 text-sm font-semibold"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {questions.length === 0 && (
                            <div className="py-10 text-center text-slate-500">No prompts yet. Create your first WriteX prompt.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
