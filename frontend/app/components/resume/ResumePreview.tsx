import React, { forwardRef } from 'react';
import { ResumeData } from '@/app/lib/resume.types';

interface ResumePreviewProps {
    data: ResumeData;
}

// Using forwardRef to allow printing
const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data }, ref) => {
    // Determine if we have content to show sections
    const hasExperience = data.experience.length > 0;

    return (
        <div className="bg-white text-slate-900 w-full h-full overflow-y-auto p-8 shadow-2xl" id="resume-preview-container">
            {/* A4 Aspect Ratio Container */}
            <div
                ref={ref}
                className="mx-auto bg-white p-[40px] max-w-[210mm] min-h-[297mm] shadow-sm text-sm leading-relaxed"
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                {/* Header */}
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

                {/* Summary */}
                {data.personalInfo.summary && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Professional Summary</h2>
                        <p className="text-slate-800">{data.personalInfo.summary}</p>
                    </section>
                )}

                {/* Experience */}
                {hasExperience && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">Experience</h2>
                        <div className="space-y-4">
                            {data.experience.map(exp => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-lg text-slate-900">{exp.company}</h3>
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
                            ))}
                        </div>
                    </section>
                )}

                {/* Education (Mocked in Type, need to map if present) */}
                {data.education && data.education.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">Education</h2>
                        <div className="space-y-3">
                            {data.education.map(edu => (
                                <div key={edu.id}>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold text-base text-slate-900">{edu.institution}</h3>
                                        <span className="text-xs font-medium text-slate-500">{edu.startDate} - {edu.endDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-700">{edu.degree} in {edu.fieldOfStudy}</span>
                                        {edu.gpa && <span className="text-xs text-slate-500">GPA: {edu.gpa}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {data.skills && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">Skills</h2>
                        <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
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
        </div>
    );
});

ResumePreview.displayName = 'ResumePreview';
export default ResumePreview;
