'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Trash2, Edit3, Save, X, BookOpen, ChevronRight, ChevronDown, CheckCircle2, Plus, UploadCloud } from 'lucide-react';
import { getStoredToken } from '@/app/lib/auth-storage';
import { fetchCompaniesList, fetchCompanyHierarchy, createMockTest, updateMockTest, deleteMockTest, togglePublishMockTest, createSection, updateSection, deleteSection, importBulkQuestions, addQuestion, fetchSectionQuestions, deleteSingleQuestion, uploadQuestionImage, API_BASE } from '@/app/lib/test-series-builder';

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

    // Single Question Form
    const [addingQuestionToSection, setAddingQuestionToSection] = useState<string | null>(null);
    const [questionForm, setQuestionForm] = useState<{
        type: 'SINGLE_CORRECT' | 'MULTI_CORRECT' | 'TEXT' | 'CODE';
        question: string;
        options: string[];
        correctAnswer: string; // single index, comma-separated indices, or empty
        solutionText: string;
        passageContent: string;
        marks: number;
        imageUrl: string;
    }>({
        type: 'SINGLE_CORRECT',
        question: '',
        options: ['', ''],
        correctAnswer: '',
        solutionText: '',
        passageContent: '',
        marks: 1,
        imageUrl: ''
    });

    const [viewingQuestionsSectionId, setViewingQuestionsSectionId] = useState<string | null>(null);
    const [sectionQuestions, setSectionQuestions] = useState<any[]>([]);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

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

    const handleTogglePublish = async (testId: string, isPublished: boolean) => {
        setIsSaving(true);
        try {
            await togglePublishMockTest(token, testId, isPublished);
            await loadHierarchy(selectedCompany.id);
            setMessage({ type: 'success', text: isPublished ? 'Test published successfully.' : 'Test unpublished and moved to draft.' });
        } catch (error: any) {
            console.error('Toggle Publish Error:', error);
            setMessage({ type: 'error', text: 'Failed to update publish state.' });
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

    // --- Questions View & Delete ---
    const handleViewQuestions = async (sectionId: string) => {
        if (viewingQuestionsSectionId === sectionId) {
            setViewingQuestionsSectionId(null);
            setSectionQuestions([]);
            return;
        }

        setIsLoading(true);
        try {
            const data = await fetchSectionQuestions(token, sectionId);
            setSectionQuestions(data);
            setViewingQuestionsSectionId(sectionId);
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to load questions.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSingleQuestion = async (questionId: string, sectionId: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        setIsSaving(true);
        try {
            await deleteSingleQuestion(token, questionId);
            // Refresh questions list for the active section
            const updatedQuestions = await fetchSectionQuestions(token, sectionId);
            setSectionQuestions(updatedQuestions);

            // Optionally reload hierarchy to update the question count
            await loadHierarchy(selectedCompany.id);

            setMessage({ type: 'success', text: 'Question deleted successfully.' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to delete question.' });
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

    // --- Single Add Question ---
    const handleAddSingleQuestion = async (sectionId: string) => {
        if (!questionForm.question.trim()) {
            setMessage({ type: 'error', text: 'Question text is required.' });
            return;
        }

        const payload: any = {
            type: questionForm.type,
            question: questionForm.question,
            passageContent: questionForm.passageContent || undefined,
            marks: questionForm.marks,
            solutionText: questionForm.solutionText,
            imageUrl: questionForm.imageUrl || undefined
        };

        if (questionForm.type === 'SINGLE_CORRECT' || questionForm.type === 'MULTI_CORRECT') {
            payload.options = questionForm.options.filter(o => o.trim() !== '');
            if (payload.options.length < 2) {
                setMessage({ type: 'error', text: 'At least 2 options are required.' });
                return;
            }
            if (!questionForm.correctAnswer.trim()) {
                setMessage({ type: 'error', text: 'You must select/provide a correct answer index.' });
                return;
            }
            payload.correctAnswer = questionForm.correctAnswer;
        } else {
            // TEXT or CODE
            payload.correctAnswer = questionForm.correctAnswer; // optional
            payload.options = [];
        }

        setIsSaving(true);
        try {
            await addQuestion(token, sectionId, payload);
            setAddingQuestionToSection(null);
            setQuestionForm({ type: 'SINGLE_CORRECT', question: '', options: ['', ''], correctAnswer: '', solutionText: '', passageContent: '', marks: 1, imageUrl: '' });
            await loadHierarchy(selectedCompany.id);
            setMessage({ type: 'success', text: 'Question added successfully.' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to add question.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const data = await uploadQuestionImage(token, file);
            setQuestionForm({ ...questionForm, imageUrl: `${API_BASE}${data.url}` });
            setMessage({ type: 'success', text: 'Image uploaded successfully.' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to upload image.' });
        } finally {
            setIsUploadingImage(false);
            setTimeout(() => setMessage(null), 3000);
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
                                                <button
                                                    onClick={() => handleTogglePublish(test.id, !test.isPublished)}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${test.isPublished
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:border-slate-300'
                                                        }`}
                                                    disabled={isSaving}
                                                >
                                                    {test.isPublished ? 'Published' : 'Draft'}
                                                </button>
                                                <button onClick={() => handleDeleteTest(test.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete Test" disabled={isSaving}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {expandedTests[test.id] && (
                                            <div className="p-5 bg-slate-50/50">
                                                {(test.sections || []).length > 0 ? (
                                                    <div className="space-y-3 mb-4">
                                                        {test.sections.map((section: any) => (
                                                            <div key={section.id} className="bg-white border text-left border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all">
                                                                {/* Section Header Row */}
                                                                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white relative z-10">
                                                                    <div className="flex-1 md:pr-4">
                                                                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-0">
                                                                            <h4 className="font-bold text-slate-800 text-base">{section.title}</h4>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold tracking-wide border border-slate-200 flex items-center gap-1">
                                                                                    <BookOpen size={12} /> {section.questionCount} Qs
                                                                                </span>
                                                                                {section.durationMinutes > 0 && (
                                                                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold tracking-wide border border-slate-200">
                                                                                        {section.durationMinutes}m Limit
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                                                                        <button
                                                                            onClick={() => handleViewQuestions(section.id)}
                                                                            className={`px-3 py-1.5 font-semibold text-sm rounded-lg border transition-all ${viewingQuestionsSectionId === section.id
                                                                                ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                                                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm'
                                                                                }`}
                                                                        >
                                                                            {viewingQuestionsSectionId === section.id ? 'Hide Questions' : 'View Questions'}
                                                                        </button>

                                                                        <button
                                                                            onClick={() => setImportingToSection(importingToSection === section.id ? null : section.id)}
                                                                            className={`px-3 py-1.5 font-semibold text-sm rounded-lg border transition-all ${importingToSection === section.id
                                                                                ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                                                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm'
                                                                                }`}
                                                                        >
                                                                            JSON Upload
                                                                        </button>

                                                                        <button
                                                                            onClick={() => setAddingQuestionToSection(addingQuestionToSection === section.id ? null : section.id)}
                                                                            className={`px-3 py-1.5 font-semibold text-sm rounded-lg border transition-all ${addingQuestionToSection === section.id
                                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                                                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                                                                                }`}
                                                                        >
                                                                            Add Question
                                                                        </button>

                                                                        <button onClick={() => handleDeleteSection(section.id)} className="p-2 ml-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Delete Section" disabled={isSaving}>
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Expanded Content Area */}
                                                                {(importingToSection === section.id || viewingQuestionsSectionId === section.id || addingQuestionToSection === section.id) && (
                                                                    <div className="border-t border-slate-200 bg-slate-50/80 p-4 md:p-6 shadow-inner">

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

                                                                        {viewingQuestionsSectionId === section.id && (
                                                                            <div className="w-full mt-4 p-4 bg-slate-50 shadow-inner rounded-xl border border-slate-200">
                                                                                <h4 className="font-bold text-slate-800 text-sm mb-3">Questions in <i>{section.title}</i></h4>
                                                                                {isLoading ? (
                                                                                    <div className="flex justify-center py-6"><Loader2 className="animate-spin text-orange-500" size={24} /></div>
                                                                                ) : sectionQuestions.length === 0 ? (
                                                                                    <p className="text-sm text-slate-500 font-medium py-3">No questions found for this section.</p>
                                                                                ) : (
                                                                                    <div className="space-y-3">
                                                                                        {sectionQuestions.map((q: any, idx: number) => (
                                                                                            <div key={q.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-start gap-4">
                                                                                                <div className="bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded text-xs shrink-0 mt-0.5">
                                                                                                    Q{idx + 1}
                                                                                                </div>
                                                                                                <div className="flex-1 w-full overflow-hidden">
                                                                                                    <p className="text-base text-slate-800 font-semibold break-words whitespace-pre-wrap leading-relaxed">
                                                                                                        {q.questionText || q.question || 'No question text provided'}
                                                                                                    </p>

                                                                                                    {q.imageUrl && (
                                                                                                        <div className="mt-3 relative inline-block">
                                                                                                            <img src={q.imageUrl} alt="Question Graphic" className="max-w-xs md:max-w-sm h-auto max-h-48 rounded-xl border border-slate-200 shadow-sm object-contain bg-slate-50 block" />
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {/* Render Options if MCQ */}
                                                                                                    {(q.questionType === 'SINGLE_CORRECT' || q.questionType === 'MULTI_CORRECT') && q.optionsJson && Array.isArray(q.optionsJson) && (
                                                                                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                                                            {q.optionsJson.map((opt: string, i: number) => {
                                                                                                                // Check if this option index is in the correctAnswer
                                                                                                                const isCorrect = q.correctAnswer && q.correctAnswer.split(',').includes(String(i));
                                                                                                                return (
                                                                                                                    <div key={i} className={`p-2.5 rounded-lg border text-sm flex gap-3 items-center ${isCorrect ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                                                                                                                        <div className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                                                                                            {String.fromCharCode(65 + i)}
                                                                                                                        </div>
                                                                                                                        <span className={`${isCorrect ? 'text-emerald-800 font-semibold' : 'text-slate-700'}`}>{opt}</span>
                                                                                                                    </div>
                                                                                                                );
                                                                                                            })}
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {/* Render Text/Code Answer if any */}
                                                                                                    {(q.questionType === 'TEXT' || q.questionType === 'CODE') && q.correctAnswer && (
                                                                                                        <div className="mt-4 p-3 rounded-lg border border-orange-200 bg-orange-50/50">
                                                                                                            <p className="text-xs font-bold text-orange-600 mb-1 uppercase tracking-wide">Expected Answer Criteria</p>
                                                                                                            <p className="text-sm font-medium text-slate-700 font-mono whitespace-pre-wrap">{q.correctAnswer}</p>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {/* Solution / Explanation */}
                                                                                                    {q.solutionText && (
                                                                                                        <div className="mt-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                                                                                                            <p className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1"><CheckCircle2 size={12} /> Explanation / Feedback</p>
                                                                                                            <p className="text-sm text-slate-700">{q.solutionText}</p>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                                                                                        <span className="font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md text-xs border border-blue-200">{q.questionType.replace('_', ' ')}</span>
                                                                                                        <span className="font-bold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-md text-xs border border-orange-200">{q.marks} Marks</span>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <button
                                                                                                    onClick={() => handleDeleteSingleQuestion(q.id, section.id)}
                                                                                                    className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded transition"
                                                                                                    title="Delete Question"
                                                                                                >
                                                                                                    <Trash2 size={16} />
                                                                                                </button>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                        {/* Single Add Question Form */}
                                                                        {addingQuestionToSection === section.id && (
                                                                            <div className="w-full mt-4 p-4 bg-slate-50 rounded-xl border border-blue-200">
                                                                                <div className="flex justify-between items-center mb-4">
                                                                                    <h4 className="font-bold text-slate-800 text-sm">Add New Question</h4>
                                                                                    <select
                                                                                        value={questionForm.type}
                                                                                        onChange={(e: any) => setQuestionForm({ ...questionForm, type: e.target.value, options: ['', ''], correctAnswer: '' })}
                                                                                        className="text-sm border border-slate-300 rounded-lg px-2 py-1 outline-none focus:border-blue-500"
                                                                                    >
                                                                                        <option value="SINGLE_CORRECT">Single Correct (Radio)</option>
                                                                                        <option value="MULTI_CORRECT">Multi Correct (Checkbox)</option>
                                                                                        <option value="TEXT">Text Subjective</option>
                                                                                        <option value="CODE">Coding / IDE</option>
                                                                                    </select>
                                                                                </div>

                                                                                <div className="space-y-4">
                                                                                    <div>
                                                                                        <label className="text-xs font-bold text-slate-500 block mb-1">Question Text / Statement</label>
                                                                                        <textarea
                                                                                            value={questionForm.question}
                                                                                            onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                                                                                            className="w-full h-20 p-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                                                            placeholder="Enter question content here..."
                                                                                        />
                                                                                    </div>

                                                                                    <div>
                                                                                        <label className="text-xs font-bold text-slate-500 block mb-1">Passage Content / Context (Optional)</label>
                                                                                        <textarea
                                                                                            value={questionForm.passageContent}
                                                                                            onChange={(e) => setQuestionForm({ ...questionForm, passageContent: e.target.value })}
                                                                                            className="w-full h-20 p-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50"
                                                                                            placeholder="Enter reading passage or common context for this question here..."
                                                                                        />
                                                                                    </div>

                                                                                    <div>
                                                                                        <label className="text-xs font-bold text-slate-500 block mb-2">Question Image (Optional)</label>
                                                                                        {questionForm.imageUrl ? (
                                                                                            <div className="relative inline-block group">
                                                                                                <img src={questionForm.imageUrl} alt="Uploaded" className="max-w-xs h-auto max-h-48 rounded-xl border border-slate-200 shadow-sm object-contain bg-slate-50 block transition-opacity group-hover:opacity-90" />
                                                                                                <button
                                                                                                    onClick={() => setQuestionForm({ ...questionForm, imageUrl: '' })}
                                                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                                                                                                    title="Remove Image"
                                                                                                >
                                                                                                    <X size={14} strokeWidth={3} />
                                                                                                </button>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <label className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors ${isUploadingImage ? 'opacity-50 pointer-events-none bg-slate-50' : 'bg-white'}`}>
                                                                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                                                    {isUploadingImage ? (
                                                                                                        <>
                                                                                                            <Loader2 size={28} className="animate-spin text-blue-500 mb-2" />
                                                                                                            <p className="text-sm font-semibold text-slate-500">Uploading Image...</p>
                                                                                                        </>
                                                                                                    ) : (
                                                                                                        <>
                                                                                                            <div className="p-3 bg-blue-50 rounded-full mb-2">
                                                                                                                <UploadCloud size={24} className="text-blue-500" />
                                                                                                            </div>
                                                                                                            <p className="text-sm font-semibold text-slate-700">Click to upload an image</p>
                                                                                                            <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                                                                                                        </>
                                                                                                    )}
                                                                                                </div>
                                                                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                                                                                            </label>
                                                                                        )}
                                                                                    </div>

                                                                                    {(questionForm.type === 'SINGLE_CORRECT' || questionForm.type === 'MULTI_CORRECT') && (
                                                                                        <div>
                                                                                            <label className="text-xs font-bold text-slate-500 block mb-2">Options & Correct Answers</label>
                                                                                            {questionForm.options.map((opt, idx) => (
                                                                                                <div key={idx} className="flex gap-2 mb-2 items-center">
                                                                                                    {questionForm.type === 'SINGLE_CORRECT' ? (
                                                                                                        <input
                                                                                                            type="radio"
                                                                                                            name={`correct_${section.id}`}
                                                                                                            checked={questionForm.correctAnswer === String(idx)}
                                                                                                            onChange={() => setQuestionForm({ ...questionForm, correctAnswer: String(idx) })}
                                                                                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                                                        />
                                                                                                    ) : (
                                                                                                        <input
                                                                                                            type="checkbox"
                                                                                                            checked={questionForm.correctAnswer.split(',').includes(String(idx))}
                                                                                                            onChange={(e) => {
                                                                                                                let current = questionForm.correctAnswer ? questionForm.correctAnswer.split(',') : [];
                                                                                                                if (e.target.checked) current.push(String(idx));
                                                                                                                else current = current.filter(val => val !== String(idx));
                                                                                                                setQuestionForm({ ...questionForm, correctAnswer: current.join(',') });
                                                                                                            }}
                                                                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                                                                                        />
                                                                                                    )}
                                                                                                    <input
                                                                                                        type="text"
                                                                                                        value={opt}
                                                                                                        onChange={(e) => {
                                                                                                            const newOps = [...questionForm.options];
                                                                                                            newOps[idx] = e.target.value;
                                                                                                            setQuestionForm({ ...questionForm, options: newOps });
                                                                                                        }}
                                                                                                        placeholder={`Option ${idx + 1}`}
                                                                                                        className="flex-1 p-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                                                                                                    />
                                                                                                    <button
                                                                                                        onClick={() => setQuestionForm({ ...questionForm, options: questionForm.options.filter((_, i) => i !== idx) })}
                                                                                                        className="p-2 text-slate-400 hover:text-red-500 transition"
                                                                                                    >
                                                                                                        <X size={16} />
                                                                                                    </button>
                                                                                                </div>
                                                                                            ))}
                                                                                            <button
                                                                                                onClick={() => setQuestionForm({ ...questionForm, options: [...questionForm.options, ''] })}
                                                                                                className="text-xs font-bold text-blue-600 hover:underline mt-1"
                                                                                            >
                                                                                                + Add Option
                                                                                            </button>
                                                                                        </div>
                                                                                    )}

                                                                                    {(questionForm.type === 'TEXT' || questionForm.type === 'CODE') && (
                                                                                        <div>
                                                                                            <label className="text-xs font-bold text-slate-500 block mb-1">Expected Answer (Optional System Checking reference)</label>
                                                                                            <textarea
                                                                                                value={questionForm.correctAnswer}
                                                                                                onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                                                                                                className="w-full h-16 p-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-100"
                                                                                                placeholder={questionForm.type === 'CODE' ? "e.g. function test() { return true; }" : "Key phrases expected..."}
                                                                                            />
                                                                                        </div>
                                                                                    )}

                                                                                    <div className="flex gap-4">
                                                                                        <div className="flex-1">
                                                                                            <label className="text-xs font-bold text-slate-500 block mb-1">Detailed Solution / Feedback Explanation (Shown Post-Test)</label>
                                                                                            <textarea
                                                                                                value={questionForm.solutionText}
                                                                                                onChange={(e) => setQuestionForm({ ...questionForm, solutionText: e.target.value })}
                                                                                                className="w-full h-16 p-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                                                                placeholder="Explain why the answer is correct..."
                                                                                            />
                                                                                        </div>
                                                                                        <div className="w-24">
                                                                                            <label className="text-xs font-bold text-slate-500 block mb-1">Marks</label>
                                                                                            <input
                                                                                                type="number"
                                                                                                value={questionForm.marks}
                                                                                                onChange={(e) => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) || 1 })}
                                                                                                className="w-full p-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                                                                                            />
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200">
                                                                                        <button onClick={() => handleAddSingleQuestion(section.id)} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50">
                                                                                            {isSaving ? 'Saving...' : 'Save Question'}
                                                                                        </button>
                                                                                        <button onClick={() => setAddingQuestionToSection(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-300 disabled:opacity-50">
                                                                                            Cancel
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
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
                                        )
                                        }
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Right: Quick Create Test Form */}
                        < div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6" >
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
        </div >
    );
}
