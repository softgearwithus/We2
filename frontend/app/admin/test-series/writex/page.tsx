'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Trash2, X, CheckCircle2, Plus, PenTool } from 'lucide-react';
import { getStoredToken } from '@/app/lib/auth-storage';
import { fetchWriteXGroups, fetchWriteXQuestions, createWriteXQuestion, updateWriteXQuestion, deleteWriteXQuestion, WriteXQuestion, McqGroup } from '@/app/lib/test-series-admin';

export default function AdminWriteXBuilder() {
    const [modules, setModules] = useState<McqGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const token = typeof window !== 'undefined' ? (getStoredToken('admin') || '') : '';

    // Module Creation State
    const [newModuleName, setNewModuleName] = useState('');
    const [isAddingModule, setIsAddingModule] = useState(false);

    // Active Module Management
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const [moduleQuestions, setModuleQuestions] = useState<WriteXQuestion[]>([]);

    // Prompt Adding/Editing
    const [addingQuestionToModule, setAddingQuestionToModule] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [promptForm, setPromptForm] = useState({ prompt: '', active: true });

    const loadModules = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await fetchWriteXGroups(token);
            setModules(data || []);
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to load WriteX modules.' });
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            loadModules();
        }
    }, [token, loadModules]);

    const handleCreateModule = async () => {
        if (!newModuleName.trim()) return;
        const topicKey = newModuleName.toLowerCase().replace(/[^a-z0-9]+/g, '_');

        setIsSaving(true);
        try {
            await createWriteXQuestion(token, {
                prompt: 'Placeholder Prompt (Edit or delete this after creating real prompts)',
                active: true,
                topicKey,
                topicLabel: newModuleName.trim(),
            });
            await loadModules();
            setMessage({ type: 'success', text: 'WriteX module created successfully.' });
            setIsAddingModule(false);
            setNewModuleName('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error?.message || 'Failed to create WriteX module.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleViewQuestions = async (moduleKey: string) => {
        setMessage(null);
        if (expandedModule === moduleKey) {
            setExpandedModule(null);
            setModuleQuestions([]);
            return;
        }

        setIsLoading(true);
        try {
            const data = await fetchWriteXQuestions(token, moduleKey);
            setModuleQuestions(data);
            setExpandedModule(moduleKey);
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to load prompts.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteQuestion = async (id: string, moduleKey: string) => {
        if (!confirm('Delete this WriteX prompt?')) return;
        setIsSaving(true);
        try {
            await deleteWriteXQuestion(token, id);
            const refreshedQuestions = await fetchWriteXQuestions(token, moduleKey);
            setModuleQuestions(refreshedQuestions);
            setExpandedModule(refreshedQuestions.length > 0 ? moduleKey : null);
            await loadModules();
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to delete prompt.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleActive = async (id: string, moduleKey: string, currentActive: boolean) => {
        setIsSaving(true);
        try {
            await updateWriteXQuestion(token, id, { active: !currentActive });
            const refreshedQuestions = await fetchWriteXQuestions(token, moduleKey);
            setModuleQuestions(refreshedQuestions);
            setExpandedModule(moduleKey);
            await loadModules();
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to update prompt status.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePrompt = async (moduleKey: string) => {
        if (!promptForm.prompt.trim()) return;
        
        const moduleData = modules.find(m => m.key === moduleKey);
        const topicLabel = moduleData ? moduleData.label : moduleKey;

        setIsSaving(true);
        try {
            if (editId) {
                await updateWriteXQuestion(token, editId, {
                    prompt: promptForm.prompt,
                    active: promptForm.active,
                    topicKey: moduleKey,
                    topicLabel,
                });
                setMessage({ type: 'success', text: 'Prompt updated.' });
            } else {
                await createWriteXQuestion(token, {
                    prompt: promptForm.prompt,
                    active: promptForm.active,
                    topicKey: moduleKey,
                    topicLabel: topicLabel
                });
                setMessage({ type: 'success', text: 'Prompt added.' });
            }
            
            setAddingQuestionToModule(null);
            setEditId(null);
            setPromptForm({ prompt: '', active: true });
            
            await loadModules();
            if (expandedModule === moduleKey) {
                await handleViewQuestions(moduleKey);
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to save prompt.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const openEditForm = (q: WriteXQuestion, moduleKey: string) => {
        setAddingQuestionToModule(moduleKey);
        setEditId(q.id);
        setPromptForm({ prompt: q.prompt, active: q.active });
    };

    if (!token) return <div className="p-8 text-center bg-slate-50 min-h-screen text-slate-500">Not authenticated.</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 pb-6">
                    <div>
                        <Link href="/admin/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-medium mb-4 transition-colors">
                            <ArrowLeft size={18} /> Back to Test Series
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">WriteX Builder</h1>
                        <p className="text-slate-500 mt-1 font-medium">Create and manage WriteX modules and their prompts.</p>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 font-semibold shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <X size={20} />}
                        {message.text}
                    </div>
                )}

                <div className="space-y-6">
                    {isLoading && !modules.length ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
                    ) : (
                        <>
                            {modules.length === 0 ? (
                                <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                                    <PenTool className="mx-auto text-slate-300 mb-4" size={48} />
                                    <h3 className="text-xl font-bold text-slate-800">No WriteX Modules Yet</h3>
                                    <p className="text-slate-500 mt-2">Create your first module below to start adding prompts.</p>
                                </div>
                            ) : (
                                modules.map((mod) => (
                                    <div key={mod.key} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800">{mod.label}</h3>
                                                <span className="inline-flex items-center gap-1 px-3 py-1 mt-2 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
                                                    <PenTool size={12} /> {mod.count} Prompts
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button onClick={() => {
                                                    setAddingQuestionToModule(addingQuestionToModule === mod.key ? null : mod.key);
                                                    setEditId(null);
                                                    setPromptForm({ prompt: '', active: true });
                                                    setMessage(null);
                                                }} className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl hover:bg-emerald-100 transition">
                                                    Add Prompt
                                                </button>
                                                <button onClick={() => handleViewQuestions(mod.key)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition">
                                                    {expandedModule === mod.key ? 'Hide' : 'View'}
                                                </button>
                                            </div>
                                        </div>

                                        {addingQuestionToModule === mod.key && (
                                            <div className="p-5 bg-emerald-50/50 border-t border-emerald-100">
                                                <h4 className="font-bold text-slate-900 mb-4">{editId ? 'Edit Prompt' : 'Create New Prompt'} for {mod.label}</h4>
                                                <div className="space-y-4">
                                                    <textarea 
                                                        value={promptForm.prompt} 
                                                        onChange={e => setPromptForm({...promptForm, prompt: e.target.value})} 
                                                        placeholder="Enter the WriteX essay/code prompt here..." 
                                                        rows={4}
                                                        className="w-full p-4 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                    />
                                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer w-max">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={promptForm.active} 
                                                            onChange={e => setPromptForm({...promptForm, active: e.target.checked})} 
                                                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                                                        />
                                                        Set as active (visible to students)
                                                    </label>
                                                    
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleSavePrompt(mod.key)} disabled={isSaving || !promptForm.prompt.trim()} className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 disabled:opacity-50">
                                                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : (editId ? 'Update Prompt' : 'Save New Prompt')}
                                                        </button>
                                                        <button onClick={() => {
                                                            setAddingQuestionToModule(null);
                                                            setEditId(null);
                                                            setPromptForm({ prompt: '', active: true });
                                                        }} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50">Cancel</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {expandedModule === mod.key && (
                                            <div className="p-5 bg-slate-50 border-t border-slate-100">
                                                {isLoading && moduleQuestions.length === 0 ? (
                                                    <div className="flex justify-center py-4"><Loader2 className="animate-spin text-emerald-400" /></div>
                                                ) : moduleQuestions.length === 0 ? (
                                                    <p className="text-center text-slate-500 font-medium py-4">No prompts in this module yet.</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {moduleQuestions.map((q) => (
                                                            <div key={q.id} className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between gap-4">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        {q.active ? (
                                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                                                                                <CheckCircle2 size={12} /> Active
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-full">
                                                                                Draft
                                                                            </span>
                                                                        )}
                                                                        <span className="text-xs text-slate-400">{new Date(q.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <p className="font-medium text-slate-800 text-sm whitespace-pre-wrap">{q.prompt}</p>
                                                                </div>
                                                                <div className="flex items-start gap-2 self-end md:self-auto shrink-0 mt-3 md:mt-0">
                                                                    <button onClick={() => handleToggleActive(q.id, mod.key, q.active)} disabled={isSaving} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 text-xs font-bold transition">
                                                                        {q.active ? 'Deactivate' : 'Activate'}
                                                                    </button>
                                                                    <button onClick={() => openEditForm(q, mod.key)} disabled={isSaving} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 text-xs font-bold transition">
                                                                        Edit
                                                                    </button>
                                                                    <button onClick={() => handleDeleteQuestion(q.id, mod.key)} disabled={isSaving} className="text-rose-400 hover:text-rose-600 transition p-1.5 border border-transparent hover:border-rose-100 hover:bg-rose-50 rounded-lg">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}

                            {/* Add Module Block */}
                            {isAddingModule ? (
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-200">
                                    <h4 className="font-bold text-slate-800 mb-3">New WriteX Module Name</h4>
                                    <input 
                                        type="text" 
                                        autoFocus
                                        value={newModuleName} 
                                        onChange={e => setNewModuleName(e.target.value)} 
                                        placeholder="e.g., Essay Practice, Email Drafting, Module 1" 
                                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-emerald-500 mb-4" 
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleCreateModule} disabled={isSaving || !newModuleName.trim()} className="px-5 py-2 bg-emerald-600 text-white font-bold text-sm rounded-xl disabled:opacity-50">Create</button>
                                        <button onClick={() => setIsAddingModule(false)} className="px-5 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setIsAddingModule(true)} className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-2xl text-slate-500 font-bold hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center gap-2 transition">
                                    <Plus size={20} /> Create New Module
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
