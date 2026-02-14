import React, { forwardRef } from 'react';
import { ResumeData } from '@/app/lib/resume.types';
import { clsx } from 'clsx';

interface ResumePreviewProps {
    data: ResumeData;
}

// Using forwardRef to allow printing
const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data }, ref) => {
    const hasExperience = data.experience.length > 0;
    const { templateId = 'modern' } = data;

    const renderHeader = () => {
        if (templateId === 'classic') {
            return (
                <header className="text-center border-b border-slate-300 pb-6 mb-8">
                    <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">{data.personalInfo.fullName}</h1>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-slate-600 font-serif italic">
                        {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                        {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                        {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                    </div>
                </header>
            );
        }

        if (templateId === 'minimal') {
            return (
                <header className="mb-10">
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-1">{data.personalInfo.fullName}</h1>
                    <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{data.experience[0]?.position || 'Professional'}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                        {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                        {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                        {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                    </div>
                </header>
            );
        }

        return (
            <header className="border-b-2 border-slate-900 pb-4 mb-6">
                <h1 className="text-4xl font-bold uppercase tracking-tight text-slate-900 mb-2">{data.personalInfo.fullName}</h1>
                <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-600">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
                    {data.personalInfo.linkedin && <span>• {data.personalInfo.linkedin}</span>}
                    {data.personalInfo.github && <span>• {data.personalInfo.github}</span>}
                    {data.personalInfo.portfolio && <span>• {data.personalInfo.portfolio}</span>}
                    {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
                </div>
            </header>
        );
    };

    const renderSectionHeader = (title: string) => {
        if (templateId === 'classic') {
            return <h2 className="text-base font-serif font-bold uppercase tracking-[2px] text-slate-900 mb-3 border-b border-slate-900 pb-1">{title}</h2>;
        }
        if (templateId === 'minimal') {
            return <h2 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-4">{title}</h2>;
        }
        return <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">{title}</h2>;
    };

    const containerClasses = clsx(
        "mx-auto bg-white p-[40px] max-w-[210mm] min-h-[297mm] shadow-sm leading-relaxed",
        templateId === 'classic' ? "font-serif text-[13px]" : "font-sans text-[14px]",
        templateId === 'minimal' ? "p-[60px]" : "p-[40px]"
    );

    return (
        /* A4 Aspect Ratio Container */
        <div
            id="resume-preview-container"
            ref={ref}
            className={containerClasses}
        >
            {renderHeader()}

            {/* Summary */}
            {data.personalInfo.summary && (
                <section className="mb-6">
                    {templateId !== 'minimal' && renderSectionHeader('Professional Summary')}
                    <p className={clsx(
                        "text-slate-800",
                        templateId === 'minimal' ? "text-lg font-medium leading-relaxed mb-10" : "text-sm"
                    )}>
                        {data.personalInfo.summary}
                    </p>
                </section>
            )}

            {/* Experience */}
            {hasExperience && (
                <section className="mb-6">
                    {renderSectionHeader('Experience')}
                    <div className="space-y-6">
                        {data.experience.map(exp => (
                            <div key={exp.id} className={templateId === 'minimal' ? 'grid grid-cols-[140px_1fr] gap-4' : ''}>
                                {templateId === 'minimal' && (
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-tighter pt-1.5">
                                        {exp.startDate} — {exp.endDate}
                                    </div>
                                )}
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={clsx(
                                            "font-bold text-slate-900",
                                            templateId === 'classic' ? "text-base" : "text-lg"
                                        )}>{exp.company}</h3>
                                        {templateId !== 'minimal' && (
                                            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-700 italic font-medium">{exp.position}</span>
                                        <span className="text-xs text-slate-400">{exp.location}</span>
                                    </div>
                                    <ul className={clsx(
                                        "list-disc list-outside ml-4 space-y-1 text-slate-700",
                                        templateId === 'minimal' ? "list-none ml-0" : ""
                                    )}>
                                        {exp.description.map((desc, i) => (
                                            desc && <li key={i} className={clsx(
                                                "pl-1",
                                                templateId === 'minimal' ? "mb-2 border-l-2 border-slate-100 pl-4 list-none" : ""
                                            )}>{desc}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
                <section className="mb-6">
                    {renderSectionHeader('Projects')}
                    <div className="space-y-4">
                        {data.projects.map(project => (
                            <div key={project.id} className={templateId === 'minimal' ? 'grid grid-cols-[140px_1fr] gap-4' : ''}>
                                {templateId === 'minimal' && (
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-tighter pt-1">
                                        Project
                                    </div>
                                )}
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-base text-slate-900">{project.name}</h3>
                                        {project.link && <span className="text-xs text-indigo-600 font-medium">{project.link}</span>}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {project.technologies.map((tech, i) => (
                                            <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-bold uppercase">{tech}</span>
                                        ))}
                                    </div>
                                    <ul className={clsx(
                                        "list-disc list-outside ml-4 space-y-1 text-slate-700",
                                        templateId === 'minimal' ? "list-none ml-0" : ""
                                    )}>
                                        {project.description.map((desc, i) => (
                                            desc && <li key={i} className={clsx(
                                                "pl-1",
                                                templateId === 'minimal' ? "mb-1 border-l-2 border-slate-100 pl-4 list-none" : ""
                                            )}>{desc}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}


            {/* Education */}
            {data.education && data.education.length > 0 && (
                <section className="mb-6">
                    {renderSectionHeader('Education')}
                    <div className="space-y-4">
                        {data.education.map(edu => (
                            <div key={edu.id} className={templateId === 'minimal' ? 'grid grid-cols-[140px_1fr] gap-4' : ''}>
                                {templateId === 'minimal' && (
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-tighter pt-1">
                                        {edu.startDate} — {edu.endDate}
                                    </div>
                                )}
                                <div>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold text-base text-slate-900">{edu.institution}</h3>
                                        {templateId !== 'minimal' && (
                                            <span className="text-xs font-medium text-slate-500">{edu.startDate} - {edu.endDate}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-700">{edu.degree} in {edu.fieldOfStudy}</span>
                                        {edu.gpa && <span className="text-xs text-slate-500">GPA: {edu.gpa}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {data.skills && (
                <section className="mb-6">
                    {renderSectionHeader('Skills')}
                    <div className={clsx(
                        "grid gap-y-2 text-sm",
                        templateId === 'minimal' ? "grid-cols-1" : "grid-cols-[120px_1fr]"
                    )}>
                        <span className="font-semibold text-slate-900">Languages:</span>
                        <span className="text-slate-700">{data.skills.languages?.join(', ')}</span>

                        <span className="font-semibold text-slate-900">Frameworks:</span>
                        <span className="text-slate-700">{data.skills.frameworks?.join(', ')}</span>

                        <span className="font-semibold text-slate-900">Tools:</span>
                        <span className="text-slate-700">{data.skills.tools?.join(', ')}</span>
                    </div>
                </section>
            )}

        </div>
    );
});

ResumePreview.displayName = 'ResumePreview';
export default ResumePreview;
