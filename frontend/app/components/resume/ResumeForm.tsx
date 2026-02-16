import React from 'react';
import { ResumeData, ExperienceItem, EducationItem, ProjectItem } from '@/app/lib/resume.types';
import { Plus, Trash2 } from 'lucide-react';

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

    // Generic helper for array updates would be cleaner, but let's be explicit for clarity
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

    // Similar functions for Education and Projects...
    // For brevity in this artifact, I'll implement Experience fully and scaffold others.

    return (
        <div className="space-y-8 p-6 bg-slate-900/50 backdrop-blur-sm border border-white/5 text-slate-200 rounded-xl shadow-2xl overflow-y-auto h-full custom-scrollbar">
            {/* Personal Info */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-indigo-500/30 pb-4">
                    <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                    <h2 className="text-xl font-bold text-white tracking-tight">Personal Information</h2>
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
                <div className="flex justify-between items-center border-b border-indigo-500/30 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                        <h2 className="text-xl font-bold text-white tracking-tight">Experience</h2>
                    </div>
                    <button
                        onClick={addExperience}
                        className="flex items-center gap-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        <Plus size={14} /> Add Role
                    </button>
                </div>

                <div className="space-y-4">
                    {data.experience.map((exp) => (
                        <div key={exp.id} className="bg-slate-800/50 border border-white/5 p-6 rounded-xl space-y-4 relative group hover:border-indigo-500/30 transition-colors">
                            <button
                                onClick={() => removeExperience(exp.id)}
                                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-500/10 rounded-lg"
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
                <div className="flex items-center gap-3 border-b border-indigo-500/30 pb-4">
                    <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                    <h2 className="text-xl font-bold text-white tracking-tight">Education</h2>
                </div>
                {data.education.map((edu, index) => (
                    <div key={edu.id} className="bg-slate-800/50 border border-white/5 p-6 rounded-xl space-y-4 hover:border-indigo-500/30 transition-colors">
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
                            <Input label="GPA" value={edu.gpa || ''} onChange={(v) => {
                                const newEdu = [...data.education];
                                newEdu[index].gpa = v;
                                onChange({ ...data, education: newEdu });
                            }} placeholder="e.g. 3.8/4.0" />
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
            </section>

            {/* Projects */}
            <section className="space-y-6">
                <div className="flex justify-between items-center border-b border-indigo-500/30 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                        <h2 className="text-xl font-bold text-white tracking-tight">Projects</h2>
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
                        className="flex items-center gap-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        <Plus size={14} /> Add Project
                    </button>
                </div>

                <div className="space-y-4">
                    {data.projects.map((project, index) => (
                        <div key={project.id} className="bg-slate-800/50 border border-white/5 p-6 rounded-xl space-y-4 relative group hover:border-indigo-500/30 transition-colors">
                            <button
                                onClick={() => {
                                    const updated = data.projects.filter((item) => item.id !== project.id);
                                    onChange({ ...data, projects: updated });
                                }}
                                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-500/10 rounded-lg"
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
                                <Input label="Tech Stack" value={project.technologies.join(', ')} onChange={(v) => {
                                    const newProjects = [...data.projects];
                                    newProjects[index].technologies = v.split(',').map((t) => t.trim()).filter(Boolean);
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
                <div className="flex items-center gap-3 border-b border-indigo-500/30 pb-4">
                    <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                    <h2 className="text-xl font-bold text-white tracking-tight">Skills</h2>
                </div>
                <div className="grid gap-6">
                    <TextArea
                        label="Languages"
                        value={data.skills.languages.join(', ')}
                        onChange={(v) => onChange({ ...data, skills: { ...data.skills, languages: v.split(', ') } })}
                        placeholder="JavaScript, Python, TypeScript..."
                        rows={2}
                    />
                    <TextArea
                        label="Frameworks & Libraries"
                        value={data.skills.frameworks.join(', ')}
                        onChange={(v) => onChange({ ...data, skills: { ...data.skills, frameworks: v.split(', ') } })}
                        placeholder="React, Next.js, Node.js..."
                        rows={2}
                    />
                    <TextArea
                        label="Tools & Platforms"
                        value={data.skills.tools.join(', ')}
                        onChange={(v) => onChange({ ...data, skills: { ...data.skills, tools: v.split(', ') } })}
                        placeholder="Git, Docker, AWS..."
                        rows={2}
                    />
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
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider group-focus-within:text-indigo-400 transition-colors">{label}</label>
        <input
            type={type}
            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all hover:border-slate-600"
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
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider group-focus-within:text-indigo-400 transition-colors">{label}</label>
        <textarea
            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all hover:border-slate-600 resize-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
        />
    </div>
);
