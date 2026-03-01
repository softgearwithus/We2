'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Trash2, Edit3, Save, X, BookOpen, ChevronRight, ChevronDown, CheckCircle2, Plus } from 'lucide-react';
import { getStoredToken } from '@/app/lib/auth-storage';
import { fetchCompaniesList, fetchCompanyHierarchy, createMockTest, updateMockTest, deleteMockTest, createSection, updateSection, deleteSection, importBulkQuestions } from '@/app/lib/test-series-builder';

type ViewState = 'select_company' | 'manage_hierarchy';

export default function AdminTestSeriesBuilder() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
    const [hierarchy, setHierarchy] = useState<any>({ mockTests: [] });

    const [view, setViewState] = useState<ViewState>('select_company');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const token = typeof window !== 'undefined' ? (getStoredToken('admin') || '') : '';

    // Hierarchy State
    const [expandedTests, setExpandedTests] = useState<Record<string, boolean>>({});

    // Forms
    const [testForm, setTestForm] = useState({ title: '', description: '', totalDurationMinutes: 45, order: 0 });
    const [editTestId, setEditTestId] = useState<string | null>(null);

    const [sectionForm, setSectionForm] = useState({ title: '', durationMinutes: 0, order: 0 });
    const [addingSectionToTest, setAddingSectionToTest] = useState<string | null>(null);
    const [editSectionId, setEditSectionId] = useState<string | null>(null);

    // Bulk Import Logic
    const [importingToSection, setImportingToSection] = useState<string | null>(null);
    const [jsonInput, setJsonInput] = useState('');

    useEffect(() => {
        if (token) loadCompanies();
    }, [token]);

    const loadCompanies = async () => {
        setIsLoading(true);
        try {
            const data = await fetchCompaniesList(token, true);
            setCompanies(data);
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to load companies.' });
        } finally {
            setIsLoading(false);
        }
    };

    const selectCompany = async (company: any) => {
        setSelectedCompany(company);
        setViewState('manage_hierarchy');
        await loadHierarchy(company.id);
    };

    const loadHierarchy = async (companyId: string) => {
        setIsLoading(true);
        try {
            const data = await fetchCompanyHierarchy(token, companyId);
            setHierarchy(data);

            // Auto expand tests
            const expanded: Record<string, boolean> = {};
            data.mockTests.forEach((m: any) => expanded[m.id] = true);
            setExpandedTests(expanded);
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to load hierarchy.' });
        } finally {
            setIsLoading(false);
        }
    };

    // --- Mock Test Actions ---
    const handleCreateTest = async () => {
        if (!selectedCompany) return;
        setIsSaving(true);
        try {
            await createMockTest(token, { ...testForm, companyId: selectedCompany.id });
            setTestForm({ title: '', description: '', totalDurationMinutes: 45, order: 0 });
            await loadHierarchy(selectedCompany.id);
            setMessage({ type: 'success', text: 'Mock Test created.' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to create mock test.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleDeleteTest = async (testId: string) => {
        if (!confirm('Delete this mock test and all its sections?')) return;
        setIsSaving(true);
        try {
            await deleteMockTest(token, testId);
            await loadHierarchy(selectedCompany.id);
            setMessage({ type: 'success', text: 'Test deleted.' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to delete test.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    // --- Section Actions ---
    const handleCreateSection = async (testId: string) => {
        setIsSaving(true);
        try {
            await createSection(token, { ...sectionForm, mockTestId: testId });
            setSectionForm({ title: '', durationMinutes: 0, order: 0 });
            setAddingSectionToTest(null);
            await loadHierarchy(selectedCompany.id);
            setMessage({ type: 'success', text: 'Section created.' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to create section.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (!confirm('Delete this section and all associated questions?')) return;
        setIsSaving(true);
        try {
            await deleteSection(token, sectionId);
            await loadHierarchy(selectedCompany.id);
            setMessage({ type: 'success', text: 'Section deleted.' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to delete section.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    // --- Bulk Import ---
    const handleBulkImport = async (sectionId: string) => {
        if (!jsonInput.trim()) {
            setMessage({ type: 'error', text: 'Please paste JSON payload.' });
            return;
        }

        let parsed: any[];
        try {
            parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) throw new Error('Not an array');
        } catch (err) {
            setMessage({ type: 'error', text: 'Invalid JSON format. Must be an array of objects.' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        setIsSaving(true);
        try {
            const res = await importBulkQuestions(token, sectionId, parsed);
            setImportingToSection(null);
            setJsonInput('');
            await loadHierarchy(selectedCompany.id);
            setMessage({ type: 'success', text: `Successfully imported ${res.count} questions.` });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to import questions. Check your JSON format.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };


    if (!token) return <div className="p-8 text-center bg-slate-50 min-h-screen text-slate-500">Not authenticated.</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    {view === 'manage_hierarchy' && (
                        <button
                            onClick={() => setViewState('select_company')}
                            className="p-2 hover:bg-slate-200 rounded-lg transition"
                        >
                            <ArrowLeft size={24} className="text-slate-600" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            {view === 'select_company' ? 'Mock Test Builder' : `Mock Tests: ${selectedCompany?.name}`}
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Create standalone placement mock tests using fast bulk JSON imports.</p>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 font-semibold shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <X size={20} />}
                        {message.text}
                    </div>
                )}

                {isLoading && view === 'select_company' ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
                ) : view === 'select_company' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companies.map(company => (
                            <div
                                key={company.id}
                                onClick={() => selectCompany(company)}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 object-cover overflow-hidden">
                                        {company.logoUrl ? <img src={company.logoUrl} alt={company.name} className="w-8 h-8 object-contain" /> : <BookOpen className="text-slate-400" size={20} />}
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">{company.name}</h3>
                                <p className="text-sm text-slate-500 mt-1 font-medium">Click to manage exams</p>
                            </div>
                        ))}
                        {companies.length === 0 && (
                            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                                No active companies found. Go to the "Manage Companies" tab to create one.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                        {/* Left: Test Hierarchy List */}
                        <div className="xl:col-span-2 space-y-6">
                            {isLoading ? (
                                <div className="flex justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-200"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
                            ) : hierarchy.mockTests?.length === 0 ? (
                                <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                                    <BookOpen className="mx-auto text-slate-300 mb-4" size={48} strokeWidth={1.5} />
                                    <h3 className="text-xl font-bold text-slate-800">No Tests Found</h3>
                                    <p className="text-slate-500 mt-2">Use the form on the right to start building the curriculum.</p>
                                </div>
                            ) : (
                                hierarchy.mockTests?.map((test: any) => (
                                    <div key={test.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div
                                            className="p-5 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                            onClick={() => setExpandedTests({ ...expandedTests, [test.id]: !expandedTests[test.id] })}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${expandedTests[test.id] ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {expandedTests[test.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-800">{test.title}</h3>
                                                    <div className="flex gap-4 text-sm text-slate-500 font-medium mt-1">
                                                        <span>{test.totalDurationMinutes} minutes total</span>
                                                        <span>•</span>
                                                        <span>{(test.sections || []).length} sections</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => handleDeleteTest(test.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" disabled={isSaving}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {expandedTests[test.id] && (
                                            <div className="p-5 bg-slate-50/50">
                                                {(test.sections || []).length > 0 ? (
                                                    <div className="space-y-3 mb-4">
                                                        {test.sections.map((section: any) => (
                                                            <div key={section.id} className="bg-white border text-left border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                                                                <div>
                                                                    <div className="flex items-center gap-3">
                                                                        <h4 className="font-bold text-slate-800">{section.title}</h4>
                                                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold tracking-wide">
                                                                            {section.questionCount} Qs
                                                                        </span>
                                                                        {section.durationMinutes > 0 && (
                                                                            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold tracking-wide border border-blue-100">
                                                                                {section.durationMinutes}m Time Limit
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <button
                                                                        onClick={() => setImportingToSection(importingToSection === section.id ? null : section.id)}
                                                                        className="px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 font-semibold rounded-lg text-sm border border-orange-200 transition-colors"
                                                                    >
                                                                        JSON Upload
                                                                    </button>

                                                                    <button onClick={() => handleDeleteSection(section.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" disabled={isSaving}>
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>

                                                                {/* JSON Importer */}
                                                                {importingToSection === section.id && (
                                                                    <div className="w-full mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                                        <p className="text-sm font-semibold text-slate-700 mb-2">Paste JSON Array:</p>
                                                                        <textarea
                                                                            value={jsonInput}
                                                                            onChange={(e) => setJsonInput(e.target.value)}
                                                                            className="w-full h-40 p-3 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                                                            placeholder={`[\n  {\n    "type": "mcq",\n    "question": "Sample?",\n    "options": ["A","B"],\n    "correctAnswer": "0",\n    "marks": 1\n  }\n]`}
                                                                        />
                                                                        <div className="flex gap-3 mt-3">
                                                                            <button onClick={() => handleBulkImport(section.id)} disabled={isSaving} className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700 disabled:opacity-50">
                                                                                {isSaving ? 'Importing...' : 'Import Questions'}
                                                                            </button>
                                                                            <button onClick={() => setImportingToSection(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-300 disabled:opacity-50">
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-500 font-medium mb-4 text-center py-4">No sections added to this test yet.</p>
                                                )}

                                                {/* Add Section Form Block */}
                                                {addingSectionToTest === test.id ? (
                                                    <div className="bg-white border text-left border-orange-200 rounded-xl p-4 shadow-sm relative">
                                                        <h4 className="font-bold text-slate-800 mb-3 text-sm">Create New Section</h4>
                                                        <input type="text" placeholder="Section Title (e.g., Aptitude)" value={sectionForm.title} onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-orange-500 text-sm mb-3" />
                                                        <div className="flex gap-3 items-center mb-4">
                                                            <div className="flex-1">
                                                                <label className="text-xs font-bold text-slate-500 mb-1 block">Time Limit (mins, 0 = unlimited)</label>
                                                                <input type="number" value={sectionForm.durationMinutes} onChange={e => setSectionForm({ ...sectionForm, durationMinutes: parseInt(e.target.value) || 0 })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-orange-500 text-sm" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <label className="text-xs font-bold text-slate-500 mb-1 block">Sort Order</label>
                                                                <input type="number" value={sectionForm.order} onChange={e => setSectionForm({ ...sectionForm, order: parseInt(e.target.value) || 0 })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-orange-500 text-sm" />
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleCreateSection(test.id)} disabled={!sectionForm.title || isSaving} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-black disabled:opacity-50 transition">Save Section</button>
                                                            <button onClick={() => setAddingSectionToTest(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-200 transition">Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => { setAddingSectionToTest(test.id); setSectionForm({ title: '', durationMinutes: 0, order: test.sections?.length || 0 }); }}
                                                        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-semibold hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition flex items-center justify-center gap-2 text-sm"
                                                    >
                                                        <Plus size={18} strokeWidth={2.5} /> Add Section
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Right: Quick Create Test Form */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Create Mock Test</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-1.5">Test Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TCS NQT 2024 Exam 1"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition"
                                        value={testForm.title}
                                        onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-1.5">Description (Optional)</label>
                                    <textarea
                                        placeholder="Short details..."
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition h-20 resize-none"
                                        value={testForm.description}
                                        onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 block mb-1.5">Total Mins</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition"
                                            value={testForm.totalDurationMinutes}
                                            onChange={(e) => setTestForm({ ...testForm, totalDurationMinutes: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 block mb-1.5">Sort Order</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition"
                                            value={testForm.order}
                                            onChange={(e) => setTestForm({ ...testForm, order: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleCreateTest}
                                    disabled={!testForm.title || isSaving}
                                    className="w-full py-3.5 mt-2 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />} Add Mock Test
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
