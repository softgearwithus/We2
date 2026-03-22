import React from 'react';
import { ResumeData, ExperienceItem, EducationItem, ProjectItem, CustomSectionItem } from '@/app/lib/resume.types';
import { Plus, Trash2, Palette, LayoutTemplate, ChevronUp, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface ResumeFormProps {
    data: ResumeData;
    onChange: (data: ResumeData) => void;
}

export default function ResumeForm({ data, onChange }: ResumeFormProps) {
    const updatePersonalInfo = (field: string, value: string) => {
        onChange({
            ...data,
            personalInfo: { ...data.personalInfo, [field]: value },
        });
    };

    const addExperience = () => {
        const newItem: ExperienceItem = {
            id: crypto.randomUUID(),
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            location: '',
            description: [''],
        };
        onChange({ ...data, experience: [...data.experience, newItem] });
    };

    const updateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
        const updated = data.experience.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
        );
        onChange({ ...data, experience: updated });
    };

    const removeExperience = (id: string) => {
        onChange({ ...data, experience: data.experience.filter((item) => item.id !== id) });
    };

    const addEducation = () => {
        const newItem: EducationItem = {
            id: crypto.randomUUID(),
            institution: '',
            degree: '',
            fieldOfStudy: '',
            startDate: '',
            endDate: '',
            location: '',
        };
        onChange({ ...data, education: [...data.education, newItem] });
    };

    const removeEducation = (id: string) => {
        onChange({ ...data, education: data.education.filter((item) => item.id !== id) });
    };

    const moveSection = (index: number, direction: number) => {
        const newOrder = [...(data.sectionOrder || ['experience', 'projects', 'education', 'skills', 'custom'])];
        if (index + direction >= 0 && index + direction < newOrder.length) {
            const temp = newOrder[index];
            newOrder[index] = newOrder[index + direction];
            newOrder[index + direction] = temp;
            onChange({ ...data, sectionOrder: newOrder });
        }
    };

    return (
        <div className="space-y-8 p-6 bg-white text-slate-900 pb-32">
            
            {/* Theme Settings */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                    <div className="w-1.5 h-6 bg-slate-500 rounded-full" />
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Palette size={20} className="text-slate-700" /> Theme Settings
                    </h2>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                    {/* Template Selector */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <LayoutTemplate size={14} /> Resume Template
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { id: 'google-standard', name: 'Google Standard', desc: 'Clean, professional, strict hierarchy' },
                                { id: 'startup-clean', name: 'Startup Clean', desc: 'Modern SaaS vibe, subtle badges' },
                                { id: 'creative-pro', name: 'Creative Pro', desc: 'Dual-column, stylized, bold' }
                            ].map((tpl) => (
                                <button
                                    key={tpl.id}
                                    onClick={() => onChange({ ...data, templateId: tpl.id as any })}
                                    className={clsx(
                                        "p-4 rounded-xl border text-left transition-all active:scale-[0.98]",
                                        data.templateId === tpl.id
                                            ? "bg-slate-50 border-slate-400 shadow-sm shadow-slate-200 ring-1 ring-slate-200 text-slate-900"
                                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-600 hover:text-slate-900"
                                    )}
                                >
                                    <div className={clsx("font-bold mb-1", data.templateId === tpl.id && "text-slate-900")}>{tpl.name}</div>
                                    <div className="text-[10.5px] leading-tight opacity-80">{tpl.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Layout Size Selector */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                             Spacing & Text Size
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { id: 'compact', name: 'Compact', desc: 'Smaller text, tighter spacing' },
                                { id: 'standard', name: 'Standard', desc: 'Balanced default layout' },
                                { id: 'spacious', name: 'Spacious', desc: 'Larger text, more breathing room' }
                            ].map((sz) => (
                                <button
                                    key={sz.id}
                                    onClick={() => onChange({ ...data, layoutSize: sz.id as any })}
                                    className={clsx(
                                        "p-3 rounded-xl border text-center transition-all active:scale-[0.98]",
                                        (data.layoutSize || 'standard') === sz.id
                                            ? "bg-slate-50 border-slate-400 shadow-sm shadow-slate-200 ring-1 ring-slate-200 text-slate-900"
                                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-600 hover:text-slate-900"
                                    )}
                                >
                                    <div className={clsx("font-bold mb-0.5 text-sm", (data.layoutSize || 'standard') === sz.id && "text-slate-900")}>{sz.name}</div>
                                    <div className="text-[10.5px] leading-tight opacity-80">{sz.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Accent Color Picker */}
                    {data.templateId !== 'google-standard' && (
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Accent Color</label>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { id: 'slate', tw: 'bg-slate-600' },
                                    { id: 'indigo', tw: 'bg-slate-800' },
                                    { id: 'blue', tw: 'bg-blue-600' },
                                    { id: 'emerald', tw: 'bg-emerald-600' },
                                    { id: 'amber', tw: 'bg-amber-600' },
                                    { id: 'rose', tw: 'bg-rose-600' },
                                ].map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => onChange({ ...data, accentColor: color.id })}
                                        className={clsx(
                                            "w-10 h-10 rounded-full transition-all flex items-center justify-center shadow-sm active:scale-90",
                                            color.tw,
                                            data.accentColor === color.id ? "ring-[3px] ring-offset-2 ring-slate-200 scale-110" : "opacity-80 hover:opacity-100 hover:scale-105"
                                        )}
                                        title={color.id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Section Order */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Section Order</label>
                        <div className="flex flex-col gap-2">
                            {(data.sectionOrder || ['experience', 'projects', 'education', 'skills', 'custom']).map((sectionId, idx, arr) => (
                                <div key={sectionId} className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-slate-200 transition-colors">
                                    <span className="text-sm font-bold text-slate-700 capitalize">{sectionId.replace('-', ' ')}</span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => moveSection(idx, -1)} 
                                            disabled={idx === 0}
                                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <button 
                                            onClick={() => moveSection(idx, 1)} 
                                            disabled={idx === arr.length - 1}
                                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Personal Info */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                    <div className="w-1.5 h-6 bg-slate-500 rounded-full" />
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Full Name" value={data.personalInfo.fullName} onChange={(v) => updatePersonalInfo('fullName', v)} placeholder="e.g. John Doe" />
                    <Input label="Email" value={data.personalInfo.email} onChange={(v) => updatePersonalInfo('email', v)} placeholder="john@example.com" />
                    <Input label="Phone" value={data.personalInfo.phone} onChange={(v) => updatePersonalInfo('phone', v)} placeholder="+1 (555) 000-0000" />
                    <Input label="LinkedIn" value={data.personalInfo.linkedin || ''} onChange={(v) => updatePersonalInfo('linkedin', v)} placeholder="linkedin.com/in/johndoe" />
                    <Input label="LeetCode" value={data.personalInfo.leetcode || ''} onChange={(v) => updatePersonalInfo('leetcode', v)} placeholder="leetcode.com/u/johndoe" />
                    <Input label="GitHub" value={data.personalInfo.github || ''} onChange={(v) => updatePersonalInfo('github', v)} placeholder="github.com/johndoe" />
                    <Input label="Portfolio" value={data.personalInfo.portfolio || ''} onChange={(v) => updatePersonalInfo('portfolio', v)} placeholder="johndoe.com" />
                    <Input label="Location" value={data.personalInfo.location || ''} onChange={(v) => updatePersonalInfo('location', v)} placeholder="City, Country" />
                </div>
                <TextArea label="Professional Summary" value={data.personalInfo.summary || ''} onChange={(v) => updatePersonalInfo('summary', v)} placeholder="Briefly describe your professional background and key achievements..." />
            </section>

            {/* Experience */}
            <section className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-slate-500 rounded-full" />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Experience</h2>
                    </div>
                    <button
                        onClick={addExperience}
                        className="flex items-center gap-2 text-xs font-bold bg-slate-500 hover:bg-slate-400 text-white px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-slate-200 active:scale-95"
                    >
                        <Plus size={14} /> Add Role
                    </button>
                </div>

                <div className="space-y-4">
                    {data.experience.map((exp) => (
                        <div key={exp.id} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 relative group hover:border-slate-300 transition-colors">
                            <button
                                onClick={() => removeExperience(exp.id)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-rose-50 rounded-lg"
                                title="Remove Role"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, 'company', v)} placeholder="Company Name" />
                                <Input label="Position" value={exp.position} onChange={(v) => updateExperience(exp.id, 'position', v)} placeholder="Job Title" />
                                <Input label="Location" value={exp.location} onChange={(v) => updateExperience(exp.id, 'location', v)} placeholder="City, Country" />
                                <div className="flex gap-4">
                                    <Input label="Start Date" type="text" value={exp.startDate} onChange={(v) => updateExperience(exp.id, 'startDate', v)} placeholder="MM/YYYY" />
                                    <Input label="End Date" type="text" value={exp.endDate} onChange={(v) => updateExperience(exp.id, 'endDate', v)} placeholder="Present" />
                                </div>
                            </div>
                            <TextArea
                                label="Description"
                                value={exp.description.join('\n')}
                                onChange={(v) => updateExperience(exp.id, 'description', v.split('\n'))}
                                placeholder="• Led a team of..."
                                rows={4}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Education */}
            <section className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-slate-500 rounded-full" />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Education</h2>
                    </div>
                    <button
                        onClick={addEducation}
                        className="flex items-center gap-2 text-xs font-bold bg-slate-500 hover:bg-slate-400 text-white px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-slate-200 active:scale-95"
                    >
                        <Plus size={14} /> Add Education
                    </button>
                </div>
                
                <div className="space-y-4">
                    {data.education.map((edu, index) => (
                        <div key={edu.id} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 relative group hover:border-slate-300 transition-colors">
                            <button
                                onClick={() => removeEducation(edu.id)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-rose-50 rounded-lg"
                                title="Remove Education"
                            >
                                <Trash2 size={16} />
                            </button>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Institution" value={edu.institution} onChange={(v) => {
                                const newEdu = [...data.education];
                                newEdu[index].institution = v;
                                onChange({ ...data, education: newEdu });
                            }} placeholder="University Name" />
                            <Input label="Degree" value={edu.degree} onChange={(v) => {
                                const newEdu = [...data.education];
                                newEdu[index].degree = v;
                                onChange({ ...data, education: newEdu });
                            }} placeholder="Bachelor's, Master's, etc." />
                            <Input label="Field of Study" value={edu.fieldOfStudy} onChange={(v) => {
                                const newEdu = [...data.education];
                                newEdu[index].fieldOfStudy = v;
                                onChange({ ...data, education: newEdu });
                            }} placeholder="Major" />
                            <div className="flex gap-2">
                                <div className="w-[120px] shrink-0">
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-slate-800 transition-colors">Score Type</label>
                                        <select
                                            className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-[3px] focus:ring-slate-200 transition-all hover:border-slate-300 shadow-sm"
                                            value={edu.scoreType || 'GPA'}
                                            onChange={(e) => {
                                                const newEdu = [...data.education];
                                                newEdu[index].scoreType = e.target.value as any;
                                                onChange({ ...data, education: newEdu });
                                            }}
                                        >
                                            <option value="GPA">GPA</option>
                                            <option value="CGPA">CGPA</option>
                                            <option value="Percentage">Percentage</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <Input label="Score" value={edu.gpa || ''} onChange={(v) => {
                                        const newEdu = [...data.education];
                                        newEdu[index].gpa = v;
                                        onChange({ ...data, education: newEdu });
                                    }} placeholder="e.g. 3.8/4.0 or 85%" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Input label="Start Date" value={edu.startDate} onChange={(v) => {
                                    const newEdu = [...data.education];
                                    newEdu[index].startDate = v;
                                    onChange({ ...data, education: newEdu });
                                }} placeholder="YYYY" />
                                <Input label="End Date" value={edu.endDate} onChange={(v) => {
                                    const newEdu = [...data.education];
                                    newEdu[index].endDate = v;
                                    onChange({ ...data, education: newEdu });
                                }} placeholder="YYYY" />
                            </div>
                        </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Projects */}
            <section className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-slate-500 rounded-full" />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Projects</h2>
                    </div>
                    <button
                        onClick={() => {
                            const newProject: ProjectItem = {
                                id: crypto.randomUUID(),
                                name: '',
                                description: [''],
                                technologies: [],
                                liveLink: '',
                                repoLink: '',
                            };
                            onChange({ ...data, projects: [...data.projects, newProject] });
                        }}
                        className="flex items-center gap-2 text-xs font-bold bg-slate-500 hover:bg-slate-400 text-white px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-slate-200 active:scale-95"
                    >
                        <Plus size={14} /> Add Project
                    </button>
                </div>

                <div className="space-y-4">
                    {data.projects.map((project, index) => (
                        <div key={project.id} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 relative group hover:border-slate-300 transition-colors">
                            <button
                                onClick={() => {
                                    const updated = data.projects.filter((item) => item.id !== project.id);
                                    onChange({ ...data, projects: updated });
                                }}
                                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-rose-50 rounded-lg"
                                title="Remove Project"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Project Name" value={project.name} onChange={(v) => {
                                    const newProjects = [...data.projects];
                                    newProjects[index].name = v;
                                    onChange({ ...data, projects: newProjects });
                                }} placeholder="Project Title" />
                                <Input label="Tech Stack" value={(project.technologies || []).join(',')} onChange={(v) => {
                                    const newProjects = [...data.projects];
                                    newProjects[index].technologies = v.split(',');
                                    onChange({ ...data, projects: newProjects });
                                }} placeholder="React, Node.js, PostgreSQL" />
                                <Input label="Live Link" value={project.liveLink || ''} onChange={(v) => {
                                    const newProjects = [...data.projects];
                                    newProjects[index].liveLink = v;
                                    onChange({ ...data, projects: newProjects });
                                }} placeholder="Live demo link" />
                                <Input label="GitHub" value={project.repoLink || ''} onChange={(v) => {
                                    const newProjects = [...data.projects];
                                    newProjects[index].repoLink = v;
                                    onChange({ ...data, projects: newProjects });
                                }} placeholder="Repository link" />
                            </div>
                            <TextArea
                                label="Project Highlights"
                                value={project.description.join('\n')}
                                onChange={(v) => {
                                    const newProjects = [...data.projects];
                                    newProjects[index].description = v.split('\n');
                                    onChange({ ...data, projects: newProjects });
                                }}
                                placeholder="• Built a full-stack app that..."
                                rows={4}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Skills */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                    <div className="w-1.5 h-6 bg-slate-500 rounded-full" />
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Skills</h2>
                </div>
                <div className="grid gap-6">
                    <TextArea
                        label="Languages"
                        value={data.skills.languages?.join(',') || ''}
                        onChange={(v) => onChange({ ...data, skills: { ...data.skills, languages: v.split(',') } })}
                        placeholder="JavaScript, Python, TypeScript..."
                        rows={2}
                    />
                    <TextArea
                        label="Frameworks & Libraries"
                        value={data.skills.frameworks?.join(',') || ''}
                        onChange={(v) => onChange({ ...data, skills: { ...data.skills, frameworks: v.split(',') } })}
                        placeholder="React, Next.js, Node.js..."
                        rows={2}
                    />
                    <TextArea
                        label="Tools & Platforms"
                        value={data.skills.tools?.join(',') || ''}
                        onChange={(v) => onChange({ ...data, skills: { ...data.skills, tools: v.split(',') } })}
                        placeholder="Git, Docker, AWS..."
                        rows={2}
                    />
                </div>
            </section>

            {/* Custom Section */}
            <section className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-1.5 h-6 bg-slate-500 rounded-full" />
                        <input 
                            className="text-xl font-black text-slate-900 tracking-tight bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder-slate-300 w-full hover:bg-slate-50 transition-colors rounded"
                            value={data.customSection?.title || 'Certifications & Awards'}
                            onChange={(e) => onChange({ ...data, customSection: { ...data.customSection, title: e.target.value, items: data.customSection?.items || [] } })}
                            placeholder="Section Title (e.g., Certifications)"
                        />
                    </div>
                    <button
                        onClick={() => {
                            const newItem: CustomSectionItem = {
                                id: crypto.randomUUID(),
                                title: '',
                                subtitle: '',
                                date: '',
                                location: '',
                                description: [''],
                            };
                            const items = data.customSection?.items || [];
                            onChange({ ...data, customSection: { title: data.customSection?.title || 'Certifications & Awards', items: [...items, newItem] } });
                        }}
                        className="flex items-center gap-2 text-xs font-bold bg-slate-500 hover:bg-slate-400 text-white px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-slate-200 active:scale-95 whitespace-nowrap ml-4"
                    >
                        <Plus size={14} /> Add Item
                    </button>
                </div>

                <div className="space-y-4">
                    {(data.customSection?.items || []).map((item, index) => (
                        <div key={item.id} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 relative group hover:border-slate-300 transition-colors">
                            <button
                                onClick={() => {
                                    const items = data.customSection?.items || [];
                                    const updated = items.filter((i) => i.id !== item.id);
                                    onChange({ ...data, customSection: { ...data.customSection!, items: updated } });
                                }}
                                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-rose-50 rounded-lg"
                                title="Remove Item"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Title" value={item.title} onChange={(v) => {
                                    const items = [...(data.customSection?.items || [])];
                                    items[index].title = v;
                                    onChange({ ...data, customSection: { ...data.customSection!, items } });
                                }} placeholder="e.g. AWS Certified Developer" />
                                <Input label="Subtitle/Organization" value={item.subtitle || ''} onChange={(v) => {
                                    const items = [...(data.customSection?.items || [])];
                                    items[index].subtitle = v;
                                    onChange({ ...data, customSection: { ...data.customSection!, items } });
                                }} placeholder="e.g. Amazon Web Services" />
                                <Input label="Date" value={item.date || ''} onChange={(v) => {
                                    const items = [...(data.customSection?.items || [])];
                                    items[index].date = v;
                                    onChange({ ...data, customSection: { ...data.customSection!, items } });
                                }} placeholder="e.g. Aug 2023" />
                                <Input label="Location" value={item.location || ''} onChange={(v) => {
                                    const items = [...(data.customSection?.items || [])];
                                    items[index].location = v;
                                    onChange({ ...data, customSection: { ...data.customSection!, items } });
                                }} placeholder="e.g. Online" />
                            </div>
                            <TextArea
                                label="Description (Optional)"
                                value={(item.description || []).join('\n')}
                                onChange={(v) => {
                                    const items = [...(data.customSection?.items || [])];
                                    items[index].description = v.split('\n');
                                    onChange({ ...data, customSection: { ...data.customSection!, items } });
                                }}
                                placeholder="• Scored 900/1000..."
                                rows={3}
                            />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

interface InputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
}

const Input = ({ label, value, onChange, type = 'text', placeholder }: InputProps) => (
    <div className="space-y-2 group">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-slate-800 transition-colors">{label}</label>
        <input
            type={type}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-[3px] focus:ring-slate-200 transition-all hover:border-slate-300 shadow-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);

interface TextAreaProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}

const TextArea = ({ label, value, onChange, placeholder, rows = 3 }: TextAreaProps) => (
    <div className="space-y-2 group">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-slate-800 transition-colors">{label}</label>
        <textarea
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-[3px] focus:ring-slate-200 transition-all hover:border-slate-300 shadow-sm resize-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
        />
    </div>
);
