'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Info, Settings, Code, LayoutDashboard, Send, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { PROJECT_DOMAINS } from '@/app/lib/ProjectData';
import { createProjectLab } from '@/app/lib/project-labs';
import { useRouter } from 'next/navigation';

export default function NewProjectForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Core Form State mapping directly to ProjectType
    const [formData, setFormData] = useState({
        targetDomain: '',
        title: '',
        description: '',
        complexity: 'Beginner',
        estimatedTime: '',
        skills: [] as string[],
        tags: [] as string[],
        details: {
            frontend: '',
            backend: '',
            database: '',
            architecture: '',
            prerequisites: [] as string[],
            tools: [] as string[],
            resources: [] as { title: string; url: string; type: 'docs' | 'design' | 'guide' | 'video' }[]
        },
        readme: {
            problem: '',
            solution: '',
            features: [] as string[],
            outcomes: [] as string[],
        },
        tasks: [] as { id: string, title: string, status: string }[]
    });

    // Temp states for arrays
    const [tempInputs, setTempInputs] = useState({
        skill: '',
        tag: '',
        prerequisite: '',
        tool: '',
        feature: '',
        outcome: '',
        task: '',
        resourceTitle: '',
        resourceUrl: '',
        resourceType: 'docs' as any
    });

    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, details: { ...prev.details, [name]: value } }));
    };

    const handleReadmeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, readme: { ...prev.readme, [name]: value } }));
    };

    const addArrayItem = (field: string, tempField: string) => {
        const val = tempInputs[tempField as keyof typeof tempInputs] as string;
        if (!val.trim()) return;

        setFormData(prev => {
            const newState = { ...prev };
            // Handle nested vs top-level arrays
            if (['prerequisites', 'tools'].includes(field)) {
                (newState.details as any)[field] = [...(newState.details as any)[field], val.trim()];
            } else if (['features', 'outcomes'].includes(field)) {
                (newState.readme as any)[field] = [...(newState.readme as any)[field], val.trim()];
            } else if (field === 'tasks') {
                newState.tasks = [...newState.tasks, { id: Date.now().toString(), title: val.trim(), status: 'pending' }];
            } else if (field === 'resources') {
                newState.details.resources = [...newState.details.resources, {
                    title: tempInputs.resourceTitle.trim(),
                    url: tempInputs.resourceUrl.trim(),
                    type: tempInputs.resourceType
                }];
                // Clear specific resource temp inputs
                setTempInputs(prev => ({ ...prev, resourceTitle: '', resourceUrl: '', resourceType: 'docs' }));
                return newState;
            } else {
                (newState as any)[field] = [...(newState as any)[field], val.trim()];
            }
            return newState;
        });

        // Clear standard temp input
        if (field !== 'resources') {
            setTempInputs(prev => ({ ...prev, [tempField]: '' }));
        }
    };

    const removeArrayItem = (field: string, index: number) => {
        setFormData(prev => {
            const newState = { ...prev };
            if (['prerequisites', 'tools'].includes(field)) {
                (newState.details as any)[field] = (newState.details as any)[field].filter((_: any, i: number) => i !== index);
            } else if (['features', 'outcomes'].includes(field)) {
                (newState.readme as any)[field] = (newState.readme as any)[field].filter((_: any, i: number) => i !== index);
            } else if (field === 'tasks') {
                newState.tasks = newState.tasks.filter((_, i) => i !== index);
            } else if (field === 'resources') {
                newState.details.resources = newState.details.resources.filter((_, i) => i !== index);
            } else {
                (newState as any)[field] = (newState as any)[field].filter((_: any, i: number) => i !== index);
            }
            return newState;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        const token = localStorage.getItem('accessToken') || '';
        if (!token) {
            setSubmitError('Missing admin token.');
            setIsSubmitting(false);
            return;
        }

        const payload = {
            domainId: formData.targetDomain,
            title: formData.title,
            description: formData.description,
            complexity: formData.complexity,
            estimatedTime: formData.estimatedTime,
            skills: formData.skills,
            tags: formData.tags,
            tasks: formData.tasks,
            readme: formData.readme,
            details: formData.details,
        };

        try {
            await createProjectLab(token, payload);
            router.push('/admin/projects');
        } catch (error: any) {
            setSubmitError(error?.message || 'Failed to create project lab.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Generic Array Input Component
    const SimpleArrayField = ({ label, field, tempField, placeholder }: { label: string, field: string, tempField: string, placeholder: string }) => {
        let items: any[] = [];
        if (['prerequisites', 'tools'].includes(field)) items = (formData.details as any)[field];
        else if (['features', 'outcomes'].includes(field)) items = (formData.readme as any)[field];
        else if (field === 'tasks') items = formData.tasks.map(t => t.title);
        else items = (formData as any)[field];

        return (
            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{label}</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={(tempInputs as any)[tempField]}
                        onChange={e => setTempInputs(prev => ({ ...prev, [tempField]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArrayItem(field, tempField))}
                        placeholder={placeholder}
                        className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <button type="button" onClick={() => addArrayItem(field, tempField)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm">Add</button>
                </div>
                {items.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        {items.map((item: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-sm shadow-sm">
                                <span>{item}</span>
                                <button type="button" onClick={() => removeArrayItem(field, idx)} className="text-slate-400 hover:text-red-500 ml-1">
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div>
                <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4 font-medium">
                    <ChevronLeft size={16} /> Back to Projects
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Upload New Project</h1>
                        <p className="text-slate-500 mt-1.5 font-medium">Configure all metadata, requirements, and assets for a new curriculum item.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Basic Info */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                        <Info size={20} className="text-blue-500" /> Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Target Domain (Category)</label>
                            <select required name="targetDomain" value={formData.targetDomain} onChange={handleBasicChange} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-medium bg-white">
                                <option value="">Select Domain...</option>
                                {PROJECT_DOMAINS.map(domain => (
                                    <option key={domain.id} value={domain.id}>{domain.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Project Title</label>
                            <input required name="title" value={formData.title} onChange={handleBasicChange} placeholder="e.g. Next.js SaaS Boilerplate" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Short Description</label>
                            <textarea required name="description" value={formData.description} onChange={handleBasicChange} rows={2} placeholder="Briefly describe what the user will build..." className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Complexity Lever</label>
                            <select name="complexity" value={formData.complexity} onChange={handleBasicChange} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-medium">
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Estimated Time</label>
                            <input required name="estimatedTime" value={formData.estimatedTime} onChange={handleBasicChange} placeholder="e.g. 5 Hours" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>
                </div>

                {/* 2. Technical Dependencies */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                        <Settings size={20} className="text-slate-500" /> Technical Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Frontend Technology</label>
                            <input name="frontend" value={formData.details.frontend} onChange={handleDetailChange} placeholder="e.g. React.js + Tailwind" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Backend Technology</label>
                            <input name="backend" value={formData.details.backend} onChange={handleDetailChange} placeholder="e.g. Node.js Express" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Database</label>
                            <input name="database" value={formData.details.database} onChange={handleDetailChange} placeholder="e.g. PostgreSQL" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Architecture / Pattern</label>
                            <input name="architecture" value={formData.details.architecture} onChange={handleDetailChange} placeholder="e.g. Microservices, MVC" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <SimpleArrayField label="Prerequisites (Concepts)" field="prerequisites" tempField="prerequisite" placeholder="e.g. Basic JavaScript" />
                        <SimpleArrayField label="Required Tools" field="tools" tempField="tool" placeholder="e.g. VS Code, Postman" />
                    </div>
                </div>

                {/* 3. README Context */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                        <BookOpen size={20} className="text-emerald-500" /> Readme & Context
                    </h2>
                    <div className="space-y-6 mb-8">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Problem Statement</label>
                            <textarea required name="problem" value={formData.readme.problem} onChange={handleReadmeChange} rows={3} placeholder="Describe the real-world problem..." className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Solution Description</label>
                            <textarea required name="solution" value={formData.readme.solution} onChange={handleReadmeChange} rows={3} placeholder="How does this project solve the problem..." className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <SimpleArrayField label="Platform Features (Expected UI)" field="features" tempField="feature" placeholder="e.g. User Authentication" />
                        <SimpleArrayField label="Learning Outcomes" field="outcomes" tempField="outcome" placeholder="e.g. Mastery of Hooks" />
                    </div>
                </div>

                {/* 4. Curriculum & Indexing */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                        <LayoutDashboard size={20} className="text-indigo-500" /> Curriculum Setup
                    </h2>

                    <div className="mb-8">
                        <SimpleArrayField label="Implementation Roadmap (Tasks)" field="tasks" tempField="task" placeholder="e.g. Configure the database schema" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <SimpleArrayField label="Skills Developed" field="skills" tempField="skill" placeholder="e.g. React.js, Auth" />
                        <SimpleArrayField label="Search Tags" field="tags" tempField="tag" placeholder="e.g. Portfolio, WebApp" />
                    </div>
                </div>

                {/* 5. Resources */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                        <Code size={20} className="text-orange-500" /> Reference Resources
                    </h2>

                    <div className="space-y-2 mb-6">
                        <label className="text-sm font-semibold text-slate-700">Add Learning Resource</label>
                        <div className="flex flex-col md:flex-row gap-3">
                            <input type="text" value={tempInputs.resourceTitle} onChange={e => setTempInputs(prev => ({ ...prev, resourceTitle: e.target.value }))} placeholder="Title (e.g. Official Docs)" className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                            <input type="url" value={tempInputs.resourceUrl} onChange={e => setTempInputs(prev => ({ ...prev, resourceUrl: e.target.value }))} placeholder="URL (https://...)" className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                            <select value={tempInputs.resourceType} onChange={e => setTempInputs(prev => ({ ...prev, resourceType: e.target.value as any }))} className="w-full md:w-32 rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none bg-white">
                                <option value="docs">Docs</option>
                                <option value="design">Design</option>
                                <option value="video">Video</option>
                                <option value="guide">Guide</option>
                            </select>
                            <button type="button" onClick={() => addArrayItem('resources', '')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-lg transition-colors font-medium text-sm whitespace-nowrap">Add</button>
                        </div>
                    </div>

                    {formData.details.resources.length > 0 && (
                        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left bg-white text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="py-2.5 px-4 font-semibold text-slate-600">Title</th>
                                        <th className="py-2.5 px-4 font-semibold text-slate-600">Type</th>
                                        <th className="py-2.5 px-4 font-semibold text-slate-600">URL</th>
                                        <th className="py-2.5 px-4 font-semibold text-slate-600 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.details.resources.map((res, idx) => (
                                        <tr key={idx} className="border-b border-slate-50 last:border-none">
                                            <td className="py-3 px-4 font-medium text-slate-800">{res.title}</td>
                                            <td className="py-3 px-4"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600 font-medium uppercase tracking-wider">{res.type}</span></td>
                                            <td className="py-3 px-4 text-slate-500 truncate max-w-[200px]">{res.url}</td>
                                            <td className="py-3 px-4 text-right">
                                                <button type="button" onClick={() => removeArrayItem('resources', idx)} className="text-red-400 hover:text-red-600 transition-colors p-1"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm sticky bottom-6 z-10 backdrop-blur-xl bg-slate-50/90">
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                        <AlertCircle size={18} />
                        Ensure all array constraints are validated before submission.
                    </div>
                    {submitError && (
                        <div className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg">
                            {submitError}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <><span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Processing...</>
                        ) : (
                            <><Send size={18} /> Launch to Project Labs</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
