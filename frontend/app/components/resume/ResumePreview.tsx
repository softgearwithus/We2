import React, { forwardRef } from 'react';
import { ResumeData } from '@/app/lib/resume.types';
import { clsx } from 'clsx';

interface ResumePreviewProps {
    data: ResumeData;
}

// Using forwardRef to allow printing
const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data }, ref) => {
    const hasExperience = data.experience.length > 0;

    const renderHeader = () => {
        const contactLine = [data.personalInfo.phone, data.personalInfo.email]
            .filter(Boolean)
            .join(' | ');
        return (
            <header className="border-b-2 border-slate-900 pb-4 mb-6">
                <h1 className="text-4xl font-bold uppercase tracking-tight text-slate-900 mb-3">{data.personalInfo.fullName}</h1>
                <div className="space-y-1 text-xs font-medium text-slate-600">
                    {contactLine && <div>{contactLine}</div>}
                    {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                    {data.personalInfo.portfolio && <div>Personal Website - {data.personalInfo.portfolio}</div>}
                    {data.personalInfo.linkedin && <div>LinkedIn - {data.personalInfo.linkedin}</div>}
                    {data.personalInfo.leetcode && <div>LeetCode - {data.personalInfo.leetcode}</div>}
                    {data.personalInfo.github && <div>GitHub - {data.personalInfo.github}</div>}
                </div>
            </header>
        );
    };

    const renderSectionHeader = (title: string) => (
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">{title}</h2>
    );

    const containerClasses = clsx(
        "mx-auto bg-white p-[40px] w-[210mm] min-h-[297mm] shadow-sm leading-relaxed font-sans text-[14px]"
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
                    {renderSectionHeader('Summary')}
                    <p className="text-sm text-slate-800">
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
                            <div key={exp.id}>
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-slate-900 text-lg">{exp.company}</h3>
                                        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-700 italic font-medium">{exp.position}</span>
                                        <span className="text-xs text-slate-400">{exp.location}</span>
                                    </div>
                                    <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700">
                                        {exp.description.map((desc, i) => (
                                            desc && <li key={i} className="pl-1">{desc}</li>
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
                            <div key={project.id}>
                                <div>
                                    <div className="flex items-start justify-between gap-6 mb-1">
                                        <h3 className="font-bold text-base text-slate-900">{project.name}</h3>
                                        <div className="text-[11px] text-slate-500 text-right">
                                            {project.liveLink && <div>Live Link - {project.liveLink}</div>}
                                            {project.repoLink && <div>GitHub - {project.repoLink}</div>}
                                        </div>
                                    </div>
                                    {project.technologies.length > 0 && (
                                        <div className="text-xs text-slate-600 mb-2">
                                            ({project.technologies.join(', ')})
                                        </div>
                                    )}
                                    <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700">
                                        {project.description.map((desc, i) => (
                                            desc && <li key={i} className="pl-1">{desc}</li>
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
                            <div key={edu.id}>
                                <div>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold text-base text-slate-900">{edu.institution}</h3>
                                        <span className="text-xs font-medium text-slate-500">{edu.startDate} - {edu.endDate}</span>
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
                    <div className="grid gap-y-2 text-sm grid-cols-[160px_1fr]">
                        <span className="font-semibold text-slate-900">Programming Languages:</span>
                        <span className="text-slate-700">{data.skills.languages?.join(', ')}</span>

                        <span className="font-semibold text-slate-900">Technologies:</span>
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
