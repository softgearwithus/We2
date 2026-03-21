'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Trash2, Edit3, Save, X, BookOpen, ChevronRight, CheckCircle2, Plus, UploadCloud } from 'lucide-react';
import { getStoredToken } from '@/app/lib/auth-storage';
import { fetchAdminMcqs, fetchMcqTopics, fetchMcqGroups, createMcq, deleteMcq, deleteMcqModule, updateMcqModuleDuration, deleteMcqSubject, type McqGroup } from '@/app/lib/test-series-admin';

const COLORS = ['indigo', 'blue', 'purple', 'emerald', 'amber', 'rose', 'cyan'];
const ICONS = ['📚', '🔬', '🌍', '⚡', '📊', '🎨', '🚀'];

const SUBJECT_PRESETS: Record<string, { icon: string; color: string }> = {
    english: { icon: '📝', color: 'indigo' },
    aptitude: { icon: '📐', color: 'blue' },
    reasoning: { icon: '🧩', color: 'purple' },
    logical_reasoning: { icon: '🧩', color: 'purple' },
    computer_science: { icon: '💻', color: 'emerald' },
};

type SubjectItem = {
    id: string;
    name: string;
    icon: string;
    color: string;
};

const buildSubjects = (groups: McqGroup[]): SubjectItem[] => (
    groups.map((group, index) => {
        const normalizedLabel = group.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const preset = SUBJECT_PRESETS[group.key] || SUBJECT_PRESETS[normalizedLabel];

        return {
            id: group.key,
            name: group.label,
            icon: preset?.icon || ICONS[index % ICONS.length],
            color: preset?.color || COLORS[index % COLORS.length],
        };
    })
);

type ViewState = 'select_subject' | 'manage_modules';

export default function AdminSubjectBuilder() {
    const [view, setViewState] = useState<ViewState>('select_subject');
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [isAddingSubject, setIsAddingSubject] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);
    const [modules, setModules] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const token = typeof window !== 'undefined' ? (getStoredToken('admin') || '') : '';

    // Module Creation State (Instead of creating a "module" directly, we just define it when adding a question, 
    // but a builder implies creating a module first. Let's spoof module creation or just show "Add Module" UI 
    // that pre-fills the topicLabel for the first question added).
    // Actually, in our schema, a Topic/Module exists *because* a question has that topicKey. 
    // So to "create a module", we might just need to store it locally until the first question is imported.
    const [newModuleName, setNewModuleName] = useState('');
    const [isAddingModule, setIsAddingModule] = useState(false);

    // Active Module Management
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const [moduleQuestions, setModuleQuestions] = useState<any[]>([]);
    const [jsonInput, setJsonInput] = useState('');
    const [importingToModule, setImportingToModule] = useState<string | null>(null);

    // Single Question Adding
    const [addingQuestionToModule, setAddingQuestionToModule] = useState<string | null>(null);
    const [questionForm, setQuestionForm] = useState({
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
        isNew: false
    });

    // Timer configuration
    const [configuringTimerForModule, setConfiguringTimerForModule] = useState<string | null>(null);
    const [timerFormDuration, setTimerFormDuration] = useState<number>(60);

    const loadSubjects = useCallback(async () => {
        if (!token) return;
        setIsSubjectsLoading(true);
        setMessage(null);
        try {
            const groups = await fetchMcqGroups(token, 'subject');
            setSubjects(buildSubjects(groups));
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load subjects.' });
        } finally {
            setIsSubjectsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token || view !== 'select_subject') return;
        loadSubjects();
    }, [token, view, loadSubjects]);

    const selectSubject = async (subject: SubjectItem) => {
        setSelectedSubject(subject);
        setViewState('manage_modules');
        await loadModules(subject.id);
    };

    const loadModules = async (subjectId: string) => {
        setIsLoading(true);
        setMessage(null);
        try {
            const data = await fetchMcqTopics(token, 'subject', subjectId);
            setModules(data || []);
        } catch (error: any) {
            setMessage({ type: 'error', text: error?.message || 'Failed to load modules.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateFakeModule = async () => {
        if (!newModuleName.trim()) return;
        if (!selectedSubject) return;
        
        setIsSaving(true);
        try {
            // Create a draft question so the module persists instantly
            await createMcq(token, {
                category: 'subject',
                group: selectedSubject.name,
                topic: newModuleName.trim(),
                question: 'Placeholder Question (Delete me after adding real questions)',
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctOptionIndex: 0,
                isNew: false
            });
            
            setMessage({ type: 'success', text: 'Module created successfully.' });
            await loadModules(selectedSubject.id);
        } catch (error: any) {
            setMessage({ type: 'error', text: error?.message || 'Failed to create module' });
        } finally {
            setIsSaving(false);
            setIsAddingModule(false);
            setNewModuleName('');
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleCreateFakeSubject = async () => {
        if (!newSubjectName.trim()) return;
        const subjectName = newSubjectName.trim();
        
        setIsSaving(true);
        try {
            // Create a placeholder question so the Subject completely persists in the DB
            await createMcq(token, {
                category: 'subject',
                group: subjectName,
                topic: 'Draft Module',
                question: 'Placeholder Question (Delete me after adding real questions)',
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctOptionIndex: 0,
                isNew: false
            });

            await loadSubjects();
            setMessage({ type: 'success', text: `Subject "${subjectName}" created successfully! Tap on it to configure modules.` });
        } catch (error: any) {
            setMessage({ type: 'error', text: error?.message || 'Failed to create subject' });
        } finally {
            setIsSaving(false);
            setIsAddingSubject(false);
            setNewSubjectName('');
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleDeleteModule = async (moduleKey: string) => {
        if (!selectedSubject) return;
        if (!confirm('Are you sure you want to delete this ENTIRE module and all its questions? This is irreversible.')) return;
        setIsSaving(true);
        try {
            await deleteMcqModule(token, 'subject', selectedSubject.id, moduleKey);
            setMessage({ type: 'success', text: 'Module deleted successfully.' });
            await loadModules(selectedSubject.id);
            if (expandedModule === moduleKey) setExpandedModule(null);
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to delete module.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleDeleteSubject = async (e: React.MouseEvent, subject: SubjectItem) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete the ENTIRE "${subject.name}" subject and ALL of its modules and questions? This is irreversible.`)) return;
        setIsSaving(true);
        try {
            const result = await deleteMcqSubject(token, 'subject', subject.id);
            if (result?.deletedCount === 0) {
                setMessage({ type: 'error', text: `Subject "${subject.name}" could not be deleted because it no longer exists.` });
            } else {
                await loadSubjects();
                if (selectedSubject?.id === subject.id) {
                    setSelectedSubject(null);
                    setModules([]);
                    setViewState('select_subject');
                }
                setMessage({ type: 'success', text: `Subject "${subject.name}" deleted successfully.` });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to delete subject.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleViewQuestions = async (moduleKey: string) => {
        if (!selectedSubject) return;
        if (expandedModule === moduleKey) {
            setExpandedModule(null);
            setModuleQuestions([]);
            return;
        }

        setIsLoading(true);
        try {
            const data = await fetchAdminMcqs(token, { category: 'subject', groupKey: selectedSubject.id, topicKey: moduleKey });
            setModuleQuestions(data.items || []);
            setExpandedModule(moduleKey);
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to load questions.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteQuestion = async (id: string, moduleKey: string) => {
        if (!selectedSubject) return;
        if (!confirm('Delete this question?')) return;
        setIsSaving(true);
        try {
            await deleteMcq(token, id);
            await handleViewQuestions(moduleKey); // reload
            await loadModules(selectedSubject.id); // update counts
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to delete question.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkImport = async (moduleKey: string) => {
        if (!selectedSubject) return;
        if (!jsonInput.trim()) return;
        let parsed: any[];
        try {
            parsed = JSON.parse(jsonInput);
        } catch (err) {
            setMessage({ type: 'error', text: 'Invalid JSON format.' });
            return;
        }

        const moduleData = modules.find(m => m.key === moduleKey);
        const topicLabel = moduleData ? moduleData.label : moduleKey;

        // Augment JSON with category, group, and topic
        const augmented = parsed.map(q => ({
            category: 'subject' as const,
            group: selectedSubject.name,
            topic: topicLabel,
            question: q.questionText || q.question,
            options: q.optionsJson || q.options,
            correctOptionIndex: q.correctOptionIndex,
            isNew: q.isNew || false
        }));

        setIsSaving(true);
        try {
            // Bulk insert by looping since there's no native JSON bulk endpoint for MCQs
            await Promise.all(augmented.map(payload => createMcq(token, payload)));
            setImportingToModule(null);
            setJsonInput('');
            await loadModules(selectedSubject.id);
            if (expandedModule === moduleKey) {
                await handleViewQuestions(moduleKey);
            }
            setMessage({ type: 'success', text: 'Questions imported successfully.' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Import failed. Check JSON format.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleAddQuestion = async (moduleKey: string) => {
        if (!selectedSubject) return;
        if (!questionForm.questionText.trim()) return;
        
        const moduleData = modules.find(m => m.key === moduleKey);
        const topicLabel = moduleData ? moduleData.label : moduleKey;

        const payload = {
            category: 'subject' as const,
            group: selectedSubject.name,
            topic: topicLabel,
            question: questionForm.questionText,
            options: questionForm.options.filter(o => o.trim() !== ''),
            correctOptionIndex: questionForm.correctOptionIndex,
            isNew: questionForm.isNew
        };

        setIsSaving(true);
        try {
            await createMcq(token, payload);
            setAddingQuestionToModule(null);
            setQuestionForm({ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '', isNew: false });
            await loadModules(selectedSubject.id);
            if (expandedModule === moduleKey) {
                await handleViewQuestions(moduleKey);
            }
            setMessage({ type: 'success', text: 'Question added.' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to add question.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleSaveTimerConfig = async (moduleKey: string) => {
        if (!selectedSubject) return;
        setIsSaving(true);
        try {
            await updateMcqModuleDuration(token, 'subject', selectedSubject.id, moduleKey, timerFormDuration);
            setConfiguringTimerForModule(null);
            await loadModules(selectedSubject.id);
            setMessage({ type: 'success', text: 'Module duration updated successfully.' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to update module duration.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (!token) return <div className="p-8 text-center bg-slate-50 min-h-screen text-slate-500">Not authenticated.</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    {view === 'manage_modules' && (
                        <button onClick={() => setViewState('select_subject')} className="p-2 hover:bg-slate-200 rounded-lg transition">
                            <ArrowLeft size={24} className="text-slate-600" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            {view === 'select_subject' ? 'Subject Builder' : `Modules: ${selectedSubject?.name}`}
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Build hierarchical modules for subject-wise practice.</p>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 font-semibold shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <X size={20} />}
                        {message.text}
                    </div>
                )}

                {view === 'select_subject' ? (
                    <div className="space-y-6">
                        {isSubjectsLoading && subjects.length === 0 ? (
                            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-700" size={32} /></div>
                        ) : subjects.length === 0 ? (
                            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                                <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                                <h3 className="text-xl font-bold text-slate-800">No Subjects Yet</h3>
                                <p className="text-slate-500 mt-2">Create a subject below to start building modules.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {subjects.map((subject) => {
                                    const borderHoverClass = {
                                        indigo: 'hover:border-slate-200',
                                        blue: 'hover:border-blue-200',
                                        purple: 'hover:border-slate-200',
                                        emerald: 'hover:border-emerald-200',
                                        amber: 'hover:border-amber-200',
                                        rose: 'hover:border-rose-200',
                                        cyan: 'hover:border-cyan-200',
                                    }[subject.color] || 'hover:border-slate-200';
                                    const iconClass = {
                                        indigo: 'bg-slate-50 text-slate-800',
                                        blue: 'bg-blue-50 text-blue-600',
                                        purple: 'bg-slate-50 text-slate-800',
                                        emerald: 'bg-emerald-50 text-emerald-600',
                                        amber: 'bg-amber-50 text-amber-600',
                                        rose: 'bg-rose-50 text-rose-600',
                                        cyan: 'bg-cyan-50 text-cyan-600',
                                    }[subject.color] || 'bg-slate-50 text-slate-800';

                                    return (
                                    <div
                                        key={subject.id}
                                        onClick={() => selectSubject(subject)}
                                        className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 ${borderHoverClass} cursor-pointer group transition-all relative group`}
                                    >
                                        <button 
                                            onClick={(e) => handleDeleteSubject(e, subject)}
                                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Entire Subject"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className={`w-14 h-14 ${iconClass} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                                            {subject.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 pr-8">{subject.name}</h3>
                                        <p className="text-sm text-slate-500 mt-1 font-medium flex items-center gap-1 group-hover:text-slate-800 transition-colors">
                                            Manage Modules <ChevronRight size={14} />
                                        </p>
                                    </div>
                                )})}
                            </div>
                        )}

                        {/* Add Subject Block */}
                        <div className="max-w-md">
                            {isAddingSubject ? (
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                    <h4 className="font-bold text-slate-800 mb-3">New Subject Name</h4>
                                    <input 
                                        type="text" 
                                        autoFocus
                                        value={newSubjectName} 
                                        onChange={e => setNewSubjectName(e.target.value)} 
                                        placeholder="e.g., Biology, Physics, Literature" 
                                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-slate-400 mb-4" 
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleCreateFakeSubject} disabled={!newSubjectName.trim()} className="px-5 py-2 bg-slate-800 text-white font-bold text-sm rounded-xl hover:bg-slate-900">Create</button>
                                        <button onClick={() => setIsAddingSubject(false)} className="px-5 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setIsAddingSubject(true)} className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-2xl text-slate-500 font-bold hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center gap-2 transition">
                                    <Plus size={20} /> Add Custom Subject
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {isLoading && !modules.length ? (
                            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-700" size={32} /></div>
                        ) : (
                            <>
                                {modules.length === 0 ? (
                                    <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                                        <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                                        <h3 className="text-xl font-bold text-slate-800">No Modules Yet</h3>
                                        <p className="text-slate-500 mt-2">Create a module below to start adding questions.</p>
                                    </div>
                                ) : (
                                    modules.map((mod) => (
                                        <div key={mod.key} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-800">{mod.label}</h3>
                                                    <div className="flex gap-2 mt-2">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
                                                            <BookOpen size={12} /> {mod.count} Questions
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                                                            ⏱️ {mod.durationMinutes || 60} mins
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <button onClick={() => {
                                                        setConfiguringTimerForModule(configuringTimerForModule === mod.key ? null : mod.key);
                                                        setTimerFormDuration(mod.durationMinutes || 60);
                                                    }} className="px-4 py-2 bg-amber-50 text-amber-700 font-bold text-sm rounded-xl hover:bg-amber-100 transition">
                                                        ⏱️ Timer
                                                    </button>
                                                    <button onClick={() => setImportingToModule(importingToModule === mod.key ? null : mod.key)} className="px-4 py-2 bg-slate-50 text-slate-900 font-bold text-sm rounded-xl hover:bg-slate-100 transition">
                                                        Bulk Import
                                                    </button>
                                                    <button onClick={() => setAddingQuestionToModule(addingQuestionToModule === mod.key ? null : mod.key)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition">
                                                        Add MCQ
                                                    </button>
                                                    <button onClick={() => handleViewQuestions(mod.key)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition">
                                                        {expandedModule === mod.key ? 'Hide' : 'View'}
                                                    </button>
                                                    <button onClick={() => handleDeleteModule(mod.key)} className="px-3 py-2 bg-rose-50 text-rose-600 font-bold text-sm rounded-xl hover:bg-rose-100 transition" title="Delete Entire Module">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {importingToModule === mod.key && (
                                                <div className="p-5 bg-slate-50/50 border-t border-slate-200">
                                                    <h4 className="font-bold text-slate-900 mb-2">Import JSON directly into {mod.label}</h4>
                                                    <textarea 
                                                        value={jsonInput} 
                                                        onChange={e => setJsonInput(e.target.value)} 
                                                        className="w-full h-40 p-3 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-200" 
                                                        placeholder='[{"questionText": "What is JS?", "optionsJson": ["A","B","C"], "correctOptionIndex": 0}]'
                                                    />
                                                    <div className="mt-3 flex gap-2">
                                                        <button onClick={() => handleBulkImport(mod.key)} disabled={isSaving} className="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-sm hover:bg-slate-900">Import Questions</button>
                                                        <button onClick={() => setImportingToModule(null)} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50">Cancel</button>
                                                    </div>
                                                </div>
                                            )}

                                            {addingQuestionToModule === mod.key && (
                                                <div className="p-5 bg-slate-50 border-t border-slate-100">
                                                    <h4 className="font-bold text-slate-900 mb-4">Add Multiple Choice Question</h4>
                                                    <div className="space-y-4">
                                                        <textarea 
                                                            value={questionForm.questionText} 
                                                            onChange={e => setQuestionForm({...questionForm, questionText: e.target.value})} 
                                                            placeholder="Question Text" 
                                                            className="w-full p-3 border border-slate-300 rounded-xl text-sm"
                                                        />
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {questionForm.options.map((opt, idx) => (
                                                                <div key={idx} className="flex items-center gap-2">
                                                                    <input type="radio" checked={questionForm.correctOptionIndex === idx} onChange={() => setQuestionForm({...questionForm, correctOptionIndex: idx})} className="w-4 h-4 text-slate-800 cursor-pointer" />
                                                                    <input type="text" value={opt} onChange={e => {
                                                                        const opts = [...questionForm.options];
                                                                        opts[idx] = e.target.value;
                                                                        setQuestionForm({...questionForm, options: opts});
                                                                    }} placeholder={`Option ${idx+1}`} className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <textarea 
                                                            value={questionForm.explanation} 
                                                            onChange={e => setQuestionForm({...questionForm, explanation: e.target.value})} 
                                                            placeholder="Explanation (Optional)" 
                                                            className="w-full p-3 border border-slate-300 rounded-xl text-sm"
                                                        />
                                                        <div className="flex items-center gap-3 py-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={questionForm.isNew}
                                                                onChange={(e) => setQuestionForm((prev) => ({ ...prev, isNew: e.target.checked }))}
                                                                id={`isNew-${mod.key}`}
                                                                className="w-4 h-4 text-slate-800 rounded border-slate-300 focus:ring-slate-200 cursor-pointer"
                                                            />
                                                            <label htmlFor={`isNew-${mod.key}`} className="text-sm font-bold text-slate-700 cursor-pointer">Mark question as 'New'</label>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleAddQuestion(mod.key)} disabled={isSaving} className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm">Save Question</button>
                                                            <button onClick={() => setAddingQuestionToModule(null)} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-sm">Cancel</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {configuringTimerForModule === mod.key && (
                                                <div className="p-5 bg-amber-50/40 border-t border-amber-100">
                                                    <h4 className="font-bold text-amber-900 mb-2">Set Module Duration Constraint</h4>
                                                    <p className="text-sm text-slate-500 mb-4">This modifies the practice limit for all questions contained within this module.</p>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3 py-2 w-32 shadow-sm focus-within:border-amber-400">
                                                            <input 
                                                                type="number" 
                                                                min={1}
                                                                value={timerFormDuration} 
                                                                onChange={e => setTimerFormDuration(parseInt(e.target.value) || 0)} 
                                                                className="w-full text-base font-bold text-slate-800 outline-none text-right placeholder-slate-400"
                                                                placeholder="60"
                                                            />
                                                            <span className="text-slate-500 font-medium ml-2 text-sm">mins</span>
                                                        </div>
                                                        <button onClick={() => handleSaveTimerConfig(mod.key)} disabled={isSaving || timerFormDuration < 1} className="px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-sm hover:bg-amber-600 shadow-sm transition-colors">
                                                            {isSaving ? <Loader2 size={16} className="animate-spin text-white/70" /> : 'Save Time Limit'}
                                                        </button>
                                                        <button onClick={() => setConfiguringTimerForModule(null)} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 shadow-sm transition-colors">Cancel</button>
                                                    </div>
                                                </div>
                                            )}

                                            {expandedModule === mod.key && (
                                                <div className="p-5 bg-slate-50 border-t border-slate-100">
                                                    {isLoading && moduleQuestions.length === 0 ? (
                                                        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-slate-400" /></div>
                                                    ) : moduleQuestions.length === 0 ? (
                                                        <p className="text-center text-slate-500 font-medium py-4">No questions inside this module yet.</p>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {moduleQuestions.map((q, idx) => (
                                                                <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between gap-4">
                                                                    <div>
                                                                        <span className="text-xs font-bold text-slate-400 mb-1 block">Q{idx + 1}</span>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <p className="font-semibold text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">{q.question}</p>
                                                                            {q.isNew && (
                                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-slate-100 text-slate-900">New</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <button onClick={() => handleDeleteQuestion(q.id, mod.key)} disabled={isSaving} className="text-rose-400 hover:text-rose-600 transition p-2 hover:bg-rose-50 rounded-lg self-start">
                                                                        <Trash2 size={16} />
                                                                    </button>
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
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                        <h4 className="font-bold text-slate-800 mb-3">New Module Name</h4>
                                        <input 
                                            type="text" 
                                            autoFocus
                                            value={newModuleName} 
                                            onChange={e => setNewModuleName(e.target.value)} 
                                            placeholder="e.g., Number Systems, Variables, Module 1" 
                                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-slate-400 mb-4" 
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={handleCreateFakeModule} disabled={!newModuleName.trim()} className="px-5 py-2 bg-slate-800 text-white font-bold text-sm rounded-xl">Create</button>
                                            <button onClick={() => setIsAddingModule(false)} className="px-5 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsAddingModule(true)} className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-2xl text-slate-500 font-bold hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center gap-2 transition">
                                        <Plus size={20} /> Create New Module
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
