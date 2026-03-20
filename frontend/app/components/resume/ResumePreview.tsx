import React, { forwardRef } from 'react';
import { ResumeData } from '@/app/lib/resume.types';
import { clsx } from 'clsx';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface ResumePreviewProps {
    data: ResumeData;
}

// Map color choices to Tailwind classes for flexibility
const colorMap: Record<string, string> = {
    indigo: 'text-indigo-600',
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600',
    slate: 'text-slate-800',
};

const borderMap: Record<string, string> = {
    indigo: 'border-indigo-600',
    blue: 'border-blue-600',
    emerald: 'border-emerald-600',
    rose: 'border-rose-600',
    amber: 'border-amber-600',
    slate: 'border-slate-800',
};

const bgMap: Record<string, string> = {
    indigo: 'bg-indigo-600',
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    rose: 'bg-rose-600',
    amber: 'bg-amber-600',
    slate: 'bg-slate-800',
};


const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data }, ref) => {
    const hasExperience = data.experience && data.experience.length > 0;
    const hasProjects = data.projects && data.projects.length > 0;
    const hasEducation = data.education && data.education.length > 0;
    const hasSkills = data.skills && (
        (data.skills.languages && data.skills.languages.some(s => s.trim())) ||
        (data.skills.frameworks && data.skills.frameworks.some(s => s.trim())) ||
        (data.skills.tools && data.skills.tools.some(s => s.trim()))
    );
    const hasCustom = data.customSection && data.customSection.items && data.customSection.items.length > 0;

    const template = data.templateId || 'google-standard';
    const accent = data.accentColor || 'slate';

    const accentText = colorMap[accent] || colorMap['slate'];
    const accentBorder = borderMap[accent] || borderMap['slate'];
    const accentBg = bgMap[accent] || bgMap['slate'];

    const sectionOrder = data.sectionOrder || ['experience', 'projects', 'education', 'skills', 'custom'];

    // --- TEMPLATE: GOOGLE STANDARD ---
    // Strict, high whitespace, no icons, classic hierarchy
    const renderGoogleStandard = () => {
        const sections: Record<string, React.ReactNode> = {
            experience: hasExperience && (
                <section key="experience" className="mb-5">
                    <h2 className="text-[14px] font-bold uppercase tracking-widest text-black border-b-2 border-black pb-1 mb-3">Professional Experience</h2>
                    <div className="space-y-4">
                        {data.experience.map(exp => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-[2px]">
                                    <h3 className="font-bold text-[14px] text-black">{exp.position}</h3>
                                    <span className="font-bold text-[12px] text-black">{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="italic text-gray-800">{exp.company}</span>
                                    <span className="italic text-gray-600 text-[12px]">{exp.location}</span>
                                </div>
                                <ul className="list-disc list-outside ml-4 space-y-1 text-gray-800">
                                    {exp.description.map((desc, i) => desc && <li key={i} className="pl-1">{desc}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            ),
            projects: hasProjects && (
                <section key="projects" className="mb-5">
                    <h2 className="text-[14px] font-bold uppercase tracking-widest text-black border-b-2 border-black pb-1 mb-3">Projects</h2>
                    <div className="space-y-4">
                        {data.projects.map(proj => (
                            <div key={proj.id}>
                                <div className="flex justify-between items-baseline mb-[2px]">
                                    <h3 className="font-bold text-[14px] text-black">
                                        {proj.name}
                                        {proj.technologies?.filter(t => t.trim()).length > 0 && <span className="font-normal italic text-gray-600 ml-2">({proj.technologies.map(t=>t.trim()).filter(Boolean).join(', ')})</span>}
                                    </h3>
                                    <div className="text-right italic text-gray-600 flex gap-2 text-[12px]">
                                        {proj.liveLink && <a href={proj.liveLink.startsWith('http') ? proj.liveLink : `https://${proj.liveLink}`} target="_blank" rel="noreferrer" className="hover:underline text-indigo-600">Live</a>}
                                        {proj.repoLink && <span>{proj.liveLink ? ' | ' : ''}<a href={proj.repoLink.startsWith('http') ? proj.repoLink : `https://${proj.repoLink}`} target="_blank" rel="noreferrer" className="hover:underline text-indigo-600">Repo</a></span>}
                                    </div>
                                </div>
                                <ul className="list-disc list-outside ml-4 space-y-1 text-gray-800 mt-1">
                                    {proj.description.map((desc, i) => desc && <li key={i} className="pl-1">{desc}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            ),
            education: hasEducation && (
                <section key="education" className="mb-5">
                    <h2 className="text-[14px] font-bold uppercase tracking-widest text-black border-b-2 border-black pb-1 mb-3">Education</h2>
                    <div className="space-y-3">
                        {data.education.map(edu => (
                            <div key={edu.id}>
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-[14px] text-black">{edu.institution}</h3>
                                    <span className="font-bold text-[12px] text-black">{edu.startDate} - {edu.endDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="italic text-gray-800">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</span>
                                    {edu.gpa && <span className="font-bold text-gray-600 text-[12px]">{edu.scoreType || 'GPA'}: {edu.gpa}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ),
            skills: hasSkills && (
                <section key="skills" className="mb-5">
                    <h2 className="text-[14px] font-bold uppercase tracking-widest text-black border-b-2 border-black pb-1 mb-3">Technical Skills</h2>
                    <div className="grid grid-cols-[140px_1fr] gap-y-1">
                        {data.skills.languages?.filter(s => s.trim()).length > 0 && (
                            <>
                                <div className="font-bold text-black">Languages:</div>
                                <div className="text-gray-800">{data.skills.languages.map(s=>s.trim()).filter(Boolean).join(', ')}</div>
                            </>
                        )}
                        {data.skills.frameworks?.filter(s => s.trim()).length > 0 && (
                            <>
                                <div className="font-bold text-black">Frameworks:</div>
                                <div className="text-gray-800">{data.skills.frameworks.map(s=>s.trim()).filter(Boolean).join(', ')}</div>
                            </>
                        )}
                        {data.skills.tools?.filter(s => s.trim()).length > 0 && (
                            <>
                                <div className="font-bold text-black">Developer Tools:</div>
                                <div className="text-gray-800">{data.skills.tools.map(s=>s.trim()).filter(Boolean).join(', ')}</div>
                            </>
                        )}
                    </div>
                </section>
            ),
            custom: hasCustom && (
                <section key="custom" className="mb-5">
                    <h2 className="text-[14px] font-bold uppercase tracking-widest text-black border-b-2 border-black pb-1 mb-3">{data.customSection?.title || 'Certifications & Awards'}</h2>
                    <div className="space-y-4">
                        {data.customSection?.items.map(item => (
                            <div key={item.id}>
                                <div className="flex justify-between items-baseline mb-[2px]">
                                    <h3 className="font-bold text-[14px] text-black">{item.title}</h3>
                                    {item.date && <span className="font-bold text-[12px] text-black">{item.date}</span>}
                                </div>
                                {(item.subtitle || item.location) && (
                                    <div className="flex justify-between mb-2">
                                        <span className="italic text-gray-800">{item.subtitle}</span>
                                        <span className="italic text-gray-600 text-[12px]">{item.location}</span>
                                    </div>
                                )}
                                {item.description && item.description.some(d => d.trim()) && (
                                    <ul className="list-disc list-outside ml-4 space-y-1 text-gray-800 mt-1">
                                        {item.description.map((desc, i) => desc.trim() && <li key={i} className="pl-1">{desc}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )
        };

        return (
            <div className="mx-auto bg-white p-[50px] w-[210mm] min-h-[297mm] leading-[1.4] font-sans text-[13.5px] text-gray-800 shadow-sm relative">
                <header className="text-center mb-6">
                    <h1 className="text-4xl font-black mb-2 text-black tracking-tight">{data.personalInfo.fullName}</h1>
                    <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[12px] text-gray-600">
                        {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                        {data.personalInfo.phone && <span className="text-gray-400">•</span>}
                        {data.personalInfo.email && <a href={`mailto:${data.personalInfo.email}`} className="hover:underline text-indigo-600">{data.personalInfo.email}</a>}
                        {data.personalInfo.linkedin && <><span className="text-gray-400">•</span><a href={`https://${data.personalInfo.linkedin.replace('https://', '').replace('www.', '')}`} target="_blank" rel="noreferrer" className="hover:underline text-indigo-600">{data.personalInfo.linkedin.replace('https://', '').replace('www.', '')}</a></>}
                        {data.personalInfo.github && <><span className="text-gray-400">•</span><a href={`https://${data.personalInfo.github.replace('https://', '').replace('www.', '')}`} target="_blank" rel="noreferrer" className="hover:underline text-indigo-600">{data.personalInfo.github.replace('https://', '').replace('www.', '')}</a></>}
                        {data.personalInfo.portfolio && <><span className="text-gray-400">•</span><a href={`https://${data.personalInfo.portfolio.replace('https://', '').replace('www.', '')}`} target="_blank" rel="noreferrer" className="hover:underline text-indigo-600">{data.personalInfo.portfolio.replace('https://', '').replace('www.', '')}</a></>}
                        {data.personalInfo.location && <><span className="text-gray-400">•</span><span>{data.personalInfo.location}</span></>}
                    </div>
                </header>

                {data.personalInfo.summary && (
                    <div className="mb-5">
                        <p className="text-slate-700">{data.personalInfo.summary}</p>
                    </div>
                )}

                {sectionOrder.map(section => sections[section])}
            </div>
        );
    };

    // --- TEMPLATE: STARTUP CLEAN ---
    // Modern SaaS vibe, accent colored headers, left aligned, subtle badges
    const renderStartupClean = () => {
        const sections: Record<string, React.ReactNode> = {
            experience: hasExperience && (
                <section key="experience" className="mb-8 w-full">
                    <div className="flex items-center gap-3 mb-5">
                        <div className={`w-8 h-[3px] rounded-full ${accentBg}`} />
                        <h2 className="text-[16px] font-black uppercase tracking-widest text-slate-900">Experience</h2>
                    </div>
                    <div className="space-y-6">
                        {data.experience.map(exp => (
                            <div key={exp.id} className="relative pl-5 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-[2px] before:bg-slate-100">
                                <div className={`absolute left-[-3px] top-2.5 w-2 h-2 rounded-full ${accentBg} ring-4 ring-white`}></div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-lg text-slate-900 leading-tight">{exp.position}</h3>
                                    <span className="text-[12px] font-bold tracking-wide text-slate-500 bg-slate-100/80 border border-slate-200 px-2.5 py-1 rounded-md">{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <div className="text-[14px] font-medium text-slate-600 mb-2">
                                    <span className={accentText}>{exp.company}</span> • {exp.location}
                                </div>
                                <ul className="list-disc list-outside ml-4 space-y-1.5 text-slate-600">
                                    {exp.description.map((desc, i) => desc && <li key={i} className="pl-2 leading-relaxed">{desc}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            ),
            projects: hasProjects && (
                <section key="projects" className="mb-8 w-full">
                    <div className="flex items-center gap-3 mb-5">
                        <div className={`w-8 h-[3px] rounded-full ${accentBg}`} />
                        <h2 className="text-[16px] font-black uppercase tracking-widest text-slate-900">Featured Projects</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        {data.projects.map(proj => (
                            <div key={proj.id} className="border border-slate-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="font-bold text-slate-900 text-[15px] mb-2 flex justify-between items-start">
                                    {proj.name}
                                    {proj.repoLink && <a href={proj.repoLink.startsWith('http') ? proj.repoLink : `https://${proj.repoLink}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-600"><Github size={16} /></a>}
                                </h3>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {proj.technologies.map(t=>t.trim()).filter(Boolean).slice(0, 4).map(tech => (
                                        <span key={tech} className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${accentText} bg-slate-50 border border-slate-100`}>{tech}</span>
                                    ))}
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-[13px] text-slate-600 leading-relaxed">
                                    {proj.description.slice(0, 2).map((desc, i) => desc && <li key={i} className="truncate">{desc}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            ),
            education: hasEducation && (
                <section key="education" className="mb-8 w-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-6 h-[2px] ${accentBg}`} />
                        <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900">Education</h2>
                    </div>
                    <div className="space-y-4">
                        {data.education.map(edu => (
                            <div key={edu.id}>
                                <h3 className="font-bold text-slate-900">{edu.institution}</h3>
                                <div className="text-sm text-slate-600">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
                                <div className="text-xs text-slate-400 mt-1">{edu.startDate} - {edu.endDate} {edu.gpa && `| ${edu.scoreType || 'GPA'}: ${edu.gpa}`}</div>
                            </div>
                        ))}
                    </div>
                </section>
            ),
            skills: hasSkills && (
                <section key="skills" className="mb-8 w-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-6 h-[2px] ${accentBg}`} />
                        <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900">Skills Core</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[...(data.skills.languages || []), ...(data.skills.frameworks || []), ...(data.skills.tools || [])]
                            .map(s => s.trim())
                            .filter(Boolean)
                            .map(skill => (
                                <span key={skill} className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">{skill}</span>
                            ))}
                    </div>
                </section>
            ),
            custom: hasCustom && (
                <section key="custom" className="mb-8 w-full">
                    <div className="flex items-center gap-3 mb-5">
                        <div className={`w-8 h-[3px] rounded-full ${accentBg}`} />
                        <h2 className="text-[16px] font-black uppercase tracking-widest text-slate-900">{data.customSection?.title || 'Certifications & Awards'}</h2>
                    </div>
                    <div className="space-y-6">
                        {data.customSection?.items.map(item => (
                            <div key={item.id} className="relative pl-5 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-[2px] before:bg-slate-100">
                                <div className={`absolute left-[-3px] top-2.5 w-2 h-2 rounded-full ${accentBg} ring-4 ring-white`}></div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-lg text-slate-900 leading-tight">{item.title}</h3>
                                    {item.date && <span className="text-[12px] font-bold tracking-wide text-slate-500 bg-slate-100/80 border border-slate-200 px-2.5 py-1 rounded-md">{item.date}</span>}
                                </div>
                                {(item.subtitle || item.location) && (
                                    <div className="text-[14px] font-medium text-slate-600 mb-2">
                                        {item.subtitle && <span className={accentText}>{item.subtitle}</span>}
                                        {item.subtitle && item.location && ' • '}
                                        {item.location}
                                    </div>
                                )}
                                {item.description && item.description.some(d => d.trim()) && (
                                    <ul className="list-disc list-outside ml-4 space-y-1.5 text-slate-600 mt-1">
                                        {item.description.map((desc, i) => desc.trim() && <li key={i} className="pl-2 leading-relaxed">{desc}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )
        };

        return (
            <div className="mx-auto bg-white p-[50px] w-[210mm] min-h-[297mm] leading-relaxed font-sans text-[14px] text-slate-800 shadow-sm relative flex flex-col">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className={`text-5xl font-extrabold tracking-tight mb-2 ${accentText}`}>{data.personalInfo.fullName}</h1>
                        <div className="text-[15px] text-slate-500 font-medium">Software Engineer based in {data.personalInfo.location || 'Unknown'}</div>
                    </div>
                    <div className="text-right text-xs space-y-1 text-slate-500 flex flex-col items-end">
                        {data.personalInfo.email && <div className="flex items-center gap-2"><Mail size={12} /> {data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div className="flex items-center gap-2"><Phone size={12} /> {data.personalInfo.phone}</div>}
                        {data.personalInfo.linkedin && <div className="flex items-center gap-2"><Linkedin size={12} /> {data.personalInfo.linkedin.replace('https://', '')}</div>}
                        {data.personalInfo.github && <div className="flex items-center gap-2"><Github size={12} /> {data.personalInfo.github.replace('https://', '')}</div>}
                    </div>
                </header>

                {data.personalInfo.summary && (
                    <section className="mb-8 w-full">
                        <p className="text-slate-600 font-medium leading-relaxed">{data.personalInfo.summary}</p>
                    </section>
                )}
                
                <div className="flex flex-col w-full columns-1">
                    {sectionOrder.map(section => sections[section])}
                </div>
            </div>
        );
    };

    // --- TEMPLATE: CREATIVE PRO ---
    // Split layout (sidebar + main content), heavy on accents, highly stylized
    const renderCreativePro = () => (
        <div className="mx-auto bg-slate-50 w-[210mm] min-h-[297mm] leading-relaxed font-sans text-[14px] text-slate-800 shadow-sm relative flex overflow-hidden">
            {/* Sidebar */}
            <div className={`w-[32%] ${accentBg} text-white p-8 flex flex-col`}>
                <div className="mb-10 text-center">
                    {/* Placeholder for Photo if needed */}
                    <div className="w-24 h-24 rounded-full bg-white/20 mx-auto mb-4 border-2 border-white/50 flex items-center justify-center font-bold text-2xl tracking-widest">
                        {data.personalInfo.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-widest mb-1">{data.personalInfo.fullName}</h1>
                    <div className="text-[12px] font-medium text-white/70 uppercase tracking-widest">Software Professional</div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h2 className="text-[13px] font-bold uppercase tracking-widest mb-4 border-b border-white/20 pb-2">Contact</h2>
                        <div className="space-y-3 text-[12px] font-medium text-white/90">
                            {data.personalInfo.email && <div className="flex gap-3"><Mail size={14} className="opacity-70" /><span className="truncate">{data.personalInfo.email}</span></div>}
                            {data.personalInfo.phone && <div className="flex gap-3"><Phone size={14} className="opacity-70" /><span>{data.personalInfo.phone}</span></div>}
                            {data.personalInfo.location && <div className="flex gap-3"><MapPin size={14} className="opacity-70" /><span>{data.personalInfo.location}</span></div>}
                            {data.personalInfo.linkedin && <div className="flex gap-3"><Linkedin size={14} className="opacity-70" /><span className="truncate">{data.personalInfo.linkedin.replace('https://', '')}</span></div>}
                        </div>
                    </div>

                    {hasEducation && (
                        <div>
                            <h2 className="text-[13px] font-bold uppercase tracking-widest mb-4 border-b border-white/20 pb-2">Education</h2>
                            <div className="space-y-5">
                                {data.education.map(edu => (
                                    <div key={edu.id}>
                                        <div className="text-[10.5px] font-black tracking-widest text-white/50 mb-1 uppercase">{edu.startDate.slice(-4)} - {edu.endDate.slice(-4)}</div>
                                        <div className="font-bold text-[14px] leading-tight mb-1">{edu.degree}</div>
                                        <div className="text-[12px] text-white/80">{edu.institution}</div>
                                        {edu.gpa && <div className="text-[11px] font-medium text-white/70 mt-1">{edu.scoreType || 'GPA'}: {edu.gpa}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {hasSkills && (
                        <div>
                            <h2 className="text-[13px] font-bold uppercase tracking-widest mb-4 border-b border-white/20 pb-2">Expertise</h2>
                            <div className="flex flex-wrap gap-2">
                                {[...(data.skills.languages || []), ...(data.skills.frameworks || [])]
                                    .filter(Boolean)
                                    .slice(0, 10)
                                    .map(skill => (
                                        <span key={skill} className="text-[11px] font-bold px-2 py-1 bg-white/10 rounded-md border border-white/20">{skill}</span>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="w-[68%] p-8 bg-white flex flex-col">
                {data.personalInfo.summary && (
                    <section className="mb-10">
                        <h2 className={`text-2xl font-black uppercase tracking-widest mb-4 flex items-center gap-3 ${accentText}`}>
                            Profile <span className="h-[2px] flex-1 bg-slate-100"></span>
                        </h2>
                        <p className="text-slate-600 leading-relaxed font-medium text-[15px]">
                            {data.personalInfo.summary}
                        </p>
                    </section>
                )}

                {(() => {
                    const mainSections: Record<string, React.ReactNode> = {
                        experience: hasExperience && (
                            <section key="experience" className="mb-10">
                                <h2 className={`text-2xl font-black uppercase tracking-widest mb-6 flex items-center gap-3 ${accentText}`}>
                                    Experience <span className="h-[2px] flex-1 bg-slate-100"></span>
                                </h2>
                                <div className="space-y-8">
                                    {data.experience.map(exp => (
                                        <div key={exp.id} className="relative">
                                            <div className={`absolute -left-3 top-2 w-[3px] h-full ${accentBg} rounded-full opacity-30`}></div>
                                            <div className="pl-4">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-slate-900 leading-tight">{exp.position}</h3>
                                                        <div className={`text-[14px] font-bold ${accentText} mt-0.5`}>{exp.company}</div>
                                                    </div>
                                                    <div className="text-[12px] font-bold tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                                                        {exp.startDate} – {exp.endDate}
                                                    </div>
                                                </div>
                                                <ul className="list-disc list-outside ml-4 mt-3 space-y-1.5 text-[13.5px] text-slate-600 leading-relaxed">
                                                    {exp.description.map((desc, i) => desc && <li key={i} className="pl-2">{desc}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ),
                        projects: hasProjects && (
                            <section key="projects" className="mb-10">
                                <h2 className={`text-2xl font-black uppercase tracking-widest mb-6 flex items-center gap-3 ${accentText}`}>
                                    Portfolio <span className="h-[2px] flex-1 bg-slate-100"></span>
                                </h2>
                                <div className="space-y-6">
                                    {data.projects.map(proj => (
                                        <div key={proj.id}>
                                            <div className="flex justify-between items-baseline mb-2">
                                                <h3 className="font-bold text-slate-900 text-[16px]">
                                                    {proj.name}
                                                    {proj.repoLink && <a href={proj.repoLink.startsWith('http') ? proj.repoLink : `https://${proj.repoLink}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-600 ml-2 inline-block"><Github size={14} /></a>}
                                                </h3>
                                                <div className="text-[13px] text-slate-400 font-medium">
                                                    {proj.technologies.map(t=>t.trim()).filter(Boolean).join(' • ')}
                                                </div>
                                            </div>
                                            <ul className="list-disc list-outside ml-4 space-y-1.5 text-slate-600 text-sm">
                                                {proj.description.map((desc, i) => desc && <li key={i} className="pl-2">{desc}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ),
                        custom: hasCustom && (
                            <section key="custom" className="mb-10">
                                <h2 className={`text-2xl font-black uppercase tracking-widest mb-6 flex items-center gap-3 ${accentText}`}>
                                    {data.customSection?.title || 'Certifications'} <span className="h-[2px] flex-1 bg-slate-100"></span>
                                </h2>
                                <div className="space-y-8">
                                    {data.customSection?.items.map(item => (
                                        <div key={item.id} className="relative">
                                            <div className={`absolute -left-3 top-2 w-[3px] h-full ${accentBg} rounded-full opacity-30`}></div>
                                            <div className="pl-4">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-slate-900 leading-tight">{item.title}</h3>
                                                        {(item.subtitle || item.location) && (
                                                            <div className={`text-[14px] font-bold ${accentText} mt-0.5`}>
                                                                {item.subtitle} {item.subtitle && item.location && ' • '} {item.location}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {item.date && (
                                                        <div className="text-[12px] font-bold tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                                                            {item.date}
                                                        </div>
                                                    )}
                                                </div>
                                                {item.description && item.description.some(d => d.trim()) && (
                                                    <ul className="list-disc list-outside ml-4 mt-3 space-y-1.5 text-[13.5px] text-slate-600 leading-relaxed">
                                                        {item.description.map((desc, i) => desc.trim() && <li key={i} className="pl-2">{desc}</li>)}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )
                    };
                    return sectionOrder.filter(s => ['experience', 'projects', 'custom'].includes(s)).map(s => mainSections[s]);
                })()}
            </div>
        </div>
    );


    return (
        <div id="resume-preview-container" ref={ref} className="origin-top flex justify-center w-full shadow-2xl overflow-hidden rounded-sm">
            {template === 'google-standard' && renderGoogleStandard()}
            {template === 'startup-clean' && renderStartupClean()}
            {template === 'creative-pro' && renderCreativePro()}
        </div>
    );
});

ResumePreview.displayName = 'ResumePreview';
export default ResumePreview;
