'use client';

import { fetchApi } from '../../../lib/apiClient';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, ArrowRight, BookOpen, BriefcaseBusiness, Check, ClipboardList, Code2, FileText, Github, Loader2, Plus, ShieldCheck, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';

type WizardStageTemplate = {
    id?: string;
    order?: number;
    name: string;
    kind: 'assessment' | 'step';
    description: string;
};

type WizardRoleTemplate = {
    key: string;
    name: string;
    subtitle: string;
    defaultTitle: string;
    defaultJobProfile: string;
    defaultType: string;
    defaultWorkMode: string;
    defaultExperience: string;
    defaultSkills: string[];
    defaultLanguage: string;
    defaultTimeLimitMinutes: number;
    defaultDescription: string;
    stages: WizardStageTemplate[];
};

type WizardFormState = {
    title: string;
    jobProfile: string;
    type: string;
    workMode: string;
    description: string;
    packageOffered: string;
    salaryRange: string;
    location: string;
    experienceRequired: string;
    openings: string;
    applicationDeadline: string;
    batchEligible: string;
    applyLink: string;
    roles: string;
    skillsRequired: string;
    githubRepositoryUrl: string;
    issueTrackerUrl: string;
    documentationUrl: string;
    workContext: string;
    pipelineNotes: string;
    automationEnabled: boolean;
    companyProfileIncluded: boolean;
};

type GithubRepository = {
    id: string;
    fullName: string;
    htmlUrl: string;
    defaultBranch?: string | null;
    selectedBranch?: string | null;
    private?: boolean;
    isLinked?: boolean;
    contextStatus?: string | null;
    contextSnapshot?: Record<string, any> | null;
    contextSyncedAt?: string | null;
    contextError?: string | null;
};

type RoleIntegrationDraft = {
    id: string;
    expiresAt: number;
    form: WizardFormState;
    selectedTemplateKey: string;
    step: 0 | 1 | 2;
    selectedAssessmentId: string;
    selectedIntegratedRepoId: string;
};

const WIZARD_FALLBACK_TEMPLATES: WizardRoleTemplate[] = [
    {
        key: 'engineer',
        name: 'Engineer',
        subtitle: 'Backend, frontend, full-stack, data, mobile',
        defaultTitle: 'Software Engineer',
        defaultJobProfile: 'Product Engineering',
        defaultType: 'Full-Time',
        defaultWorkMode: 'Hybrid',
        defaultExperience: '0-3 years',
        defaultSkills: ['TypeScript', 'React', 'Node.js', 'SQL', 'Testing'],
        defaultLanguage: 'typescript',
        defaultTimeLimitMinutes: 90,
        defaultDescription: 'Build, debug, and ship product features with clear ownership, tests, and practical tradeoff reasoning.',
        stages: [
            { name: 'Take-home assessment', kind: 'assessment', description: 'Coding exercise or feature build from role context' },
            { name: 'Debugging assessment', kind: 'assessment', description: 'Bugfix or code-review exercise against realistic code' },
            { name: 'Take-home walkthrough', kind: 'step', description: 'Candidate explains design choices, tests, and tradeoffs' },
            { name: 'On-site', kind: 'step', description: 'Live technical and collaboration discussion' },
            { name: 'Final debrief', kind: 'step', description: 'Hiring team decision and offer calibration' },
        ],
    },
    {
        key: 'senior_staff_engineer',
        name: 'Senior / Staff Engineer',
        subtitle: 'ML, DevOps, platform, security',
        defaultTitle: 'Senior Software Engineer',
        defaultJobProfile: 'Senior Engineering',
        defaultType: 'Full-Time',
        defaultWorkMode: 'Hybrid',
        defaultExperience: '4+ years',
        defaultSkills: ['System Design', 'Architecture', 'Reliability', 'Mentoring'],
        defaultLanguage: 'typescript',
        defaultTimeLimitMinutes: 120,
        defaultDescription: 'Own ambiguous technical work, improve systems, mentor engineers, and make high-quality architecture decisions.',
        stages: [
            { name: 'Architecture assessment', kind: 'assessment', description: 'Design or refactor a system slice using real product context' },
            { name: 'Production debugging', kind: 'assessment', description: 'Investigate a realistic incident, bottleneck, or reliability issue' },
            { name: 'Technical walkthrough', kind: 'step', description: 'Deep-dive on tradeoffs, quality, and maintainability' },
            { name: 'Cross-functional round', kind: 'step', description: 'Product, delivery, and communication calibration' },
            { name: 'Leadership panel', kind: 'step', description: 'Scope, influence, mentoring, and judgment' },
            { name: 'Final debrief', kind: 'step', description: 'Team decision and leveling discussion' },
        ],
    },
    {
        key: 'engineering_manager',
        name: 'Engineering Manager',
        subtitle: 'People leadership, delivery, cross-functional',
        defaultTitle: 'Engineering Manager',
        defaultJobProfile: 'Engineering Leadership',
        defaultType: 'Full-Time',
        defaultWorkMode: 'Hybrid',
        defaultExperience: '5+ years',
        defaultSkills: ['People Management', 'Delivery', 'Hiring', 'Stakeholders'],
        defaultLanguage: 'markdown',
        defaultTimeLimitMinutes: 75,
        defaultDescription: 'Lead engineering teams, create execution clarity, coach engineers, and partner across product and business.',
        stages: [
            { name: 'Manager case study', kind: 'assessment', description: 'Written response to a delivery, people, or prioritization scenario' },
            { name: 'People leadership round', kind: 'step', description: 'Coaching, feedback, conflict, and hiring signal' },
            { name: 'Execution round', kind: 'step', description: 'Planning, metrics, and stakeholder alignment' },
            { name: 'Cross-functional panel', kind: 'step', description: 'Product, design, business, and communication depth' },
            { name: 'Final debrief', kind: 'step', description: 'Offer decision and leadership calibration' },
        ],
    },
    {
        key: 'intern_new_grad',
        name: 'Intern / New Grad',
        subtitle: 'Early-career, internship scope',
        defaultTitle: 'Software Engineering Intern',
        defaultJobProfile: 'Early Career Engineering',
        defaultType: 'Internship',
        defaultWorkMode: 'Hybrid',
        defaultExperience: '0-1 years',
        defaultSkills: ['DSA', 'JavaScript', 'Python', 'Projects', 'Communication'],
        defaultLanguage: 'javascript',
        defaultTimeLimitMinutes: 75,
        defaultDescription: 'Assess fundamentals, learning speed, project ownership, and practical implementation ability.',
        stages: [
            { name: 'Fundamentals assessment', kind: 'assessment', description: 'Small coding task with tests and explanation' },
            { name: 'Project walkthrough', kind: 'assessment', description: 'Resume/project discussion with technical questions' },
            { name: 'Technical screen', kind: 'step', description: 'Live fundamentals and communication round' },
            { name: 'Final debrief', kind: 'step', description: 'Team decision and internship matching' },
        ],
    },
    {
        key: 'forward_deployed_gtm',
        name: 'Forward-deployed / GTM',
        subtitle: 'Sales engineering, solutions, customer success',
        defaultTitle: 'Forward Deployed Engineer',
        defaultJobProfile: 'Solutions Engineering',
        defaultType: 'Full-Time',
        defaultWorkMode: 'Remote',
        defaultExperience: '1-4 years',
        defaultSkills: ['APIs', 'Customer Discovery', 'Demos', 'SQL', 'Writing'],
        defaultLanguage: 'typescript',
        defaultTimeLimitMinutes: 90,
        defaultDescription: 'Solve customer problems with technical judgment, communication, product thinking, and fast implementation.',
        stages: [
            { name: 'Customer scenario assessment', kind: 'assessment', description: 'Technical solution and written customer response' },
            { name: 'Demo walkthrough', kind: 'step', description: 'Present the solution and handle constraints' },
            { name: 'Technical screen', kind: 'step', description: 'APIs, debugging, and integration fluency' },
            { name: 'Final debrief', kind: 'step', description: 'Role fit and customer-facing calibration' },
        ],
    },
    {
        key: 'data_ml_engineer',
        name: 'Data / ML Engineer',
        subtitle: 'Pipelines, modeling, analytics, ML systems',
        defaultTitle: 'Data Engineer',
        defaultJobProfile: 'Data and ML Engineering',
        defaultType: 'Full-Time',
        defaultWorkMode: 'Hybrid',
        defaultExperience: '1-4 years',
        defaultSkills: ['Python', 'SQL', 'Pipelines', 'ML', 'Data Quality'],
        defaultLanguage: 'python',
        defaultTimeLimitMinutes: 90,
        defaultDescription: 'Build reliable data products, reason about quality, model tradeoffs, and operationalize data workflows.',
        stages: [
            { name: 'Data task assessment', kind: 'assessment', description: 'Pipeline, analysis, or ML task with quality checks' },
            { name: 'Debugging assessment', kind: 'assessment', description: 'Find data quality, performance, or modeling issues' },
            { name: 'Technical walkthrough', kind: 'step', description: 'Explain assumptions, metrics, and deployment tradeoffs' },
            { name: 'Stakeholder round', kind: 'step', description: 'Translate technical work into product and business outcomes' },
            { name: 'Final debrief', kind: 'step', description: 'Hiring decision and team matching' },
        ],
    },
];

const WIZARD_INITIAL_FORM: WizardFormState = {
    title: '',
    jobProfile: '',
    type: 'Full-Time',
    workMode: 'Hybrid',
    description: '',
    packageOffered: '',
    salaryRange: '',
    location: '',
    experienceRequired: '',
    openings: '',
    applicationDeadline: '',
    batchEligible: '',
    applyLink: '',
    roles: '',
    skillsRequired: '',
    githubRepositoryUrl: '',
    issueTrackerUrl: '',
    documentationUrl: '',
    workContext: '',
    pipelineNotes: '',
    automationEnabled: true,
    companyProfileIncluded: true,
};

const wizardSteps = ['Context', 'Pipeline', 'Review'] as const;
const wizardInputClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';
const roleIntegrationDraftPrefix = 'emble.role.integration-return.';
const roleIntegrationDraftTtlMs = 30 * 60 * 1000;

export default function CreateDrivePage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [templates, setTemplates] = useState<WizardRoleTemplate[]>(WIZARD_FALLBACK_TEMPLATES);
    const [selectedTemplateKey, setSelectedTemplateKey] = useState(WIZARD_FALLBACK_TEMPLATES[0].key);
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [form, setForm] = useState<WizardFormState>(() => applyWizardTemplate(WIZARD_INITIAL_FORM, WIZARD_FALLBACK_TEMPLATES[0]));
    const [assessmentLibrary, setAssessmentLibrary] = useState<Array<{ id: string; name: string }>>([]);
    const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
    const [integratedRepos, setIntegratedRepos] = useState<GithubRepository[]>([]);
    const [selectedIntegratedRepoId, setSelectedIntegratedRepoId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const { getActiveToken } = await import('@/app/lib/auth-storage');
                const token = getActiveToken();
                const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements/templates/role-pipelines`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return;
                const payload = await res.json();
                if (Array.isArray(payload) && payload.length) {
                    setTemplates(payload);
                    setSelectedTemplateKey(payload[0].key);
                    if (!searchParams.get('draftId')) {
                        setForm((prev) => applyWizardTemplate(prev, payload[0]));
                    }
                }
            } catch {
                setTemplates(WIZARD_FALLBACK_TEMPLATES);
            }
        };

        loadTemplates();
    }, [searchParams]);

    useEffect(() => {
        const loadAssessments = async () => {
            try {
                const { getActiveToken } = await import('@/app/lib/auth-storage');
                const token = getActiveToken();
                const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/assessments`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setAssessmentLibrary(await res.json());
            } catch {
                setAssessmentLibrary([]);
            }
        };

        loadAssessments();
    }, []);

    useEffect(() => {
        const draft = readRoleIntegrationDraft(searchParams.get('draftId'));
        if (draft) {
            setForm(draft.form);
            setSelectedTemplateKey(draft.selectedTemplateKey);
            setStep(draft.step);
            setSelectedAssessmentId(draft.selectedAssessmentId || '');
            setSelectedIntegratedRepoId(draft.selectedIntegratedRepoId || '');
        }

        const loadIntegratedRepos = async () => {
            try {
                const { getActiveToken } = await import('@/app/lib/auth-storage');
                const token = getActiveToken();
                const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/repositories?linked=true`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return;
                const payload = await res.json();
                const repos = Array.isArray(payload) ? payload : [];
                setIntegratedRepos(repos);

                const requestedRepoId = searchParams.get('repoId');
                const requestedRepo = repos.find((repo: GithubRepository) => repo.id === requestedRepoId);
                if (requestedRepo && isParsedRepo(requestedRepo)) {
                    setSelectedIntegratedRepoId(requestedRepo.id);
                    setForm((prev) => applyIntegratedRepoToRoleForm(prev, requestedRepo));
                } else if (requestedRepo) {
                    setErrorMessage(`Parse ${requestedRepo.fullName} in Integrations before using it in a role.`);
                }
            } catch {
                setIntegratedRepos([]);
            }
        };

        loadIntegratedRepos();
    }, [searchParams]);

    const selectedTemplate = useMemo(
        () => templates.find((template) => template.key === selectedTemplateKey) || templates[0],
        [selectedTemplateKey, templates],
    );

    const connectedCount = [
        form.githubRepositoryUrl,
        form.issueTrackerUrl,
        form.documentationUrl,
        form.description,
        form.workContext,
    ].filter((value) => value.trim()).length;

    const updateField = <K extends keyof WizardFormState>(field: K, value: WizardFormState[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const selectIntegratedRepo = (repoId: string) => {
        setSelectedIntegratedRepoId(repoId);
        if (!repoId) {
            setForm((prev) => ({
                ...prev,
                githubRepositoryUrl: '',
                workContext: stripIntegratedRepoContext(prev.workContext),
            }));
            return;
        }
        const repo = integratedRepos.find((item) => item.id === repoId);
        if (repo) {
            if (!isParsedRepo(repo)) {
                setErrorMessage(`Parse ${repo.fullName} in Integrations before using it in a role.`);
                return;
            }
            setErrorMessage(null);
            setForm((prev) => applyIntegratedRepoToRoleForm(prev, repo));
        }
    };

    const openIntegrationsForRepo = () => {
        const draftId = createRoleIntegrationDraftId();
        writeRoleIntegrationDraft({
            id: draftId,
            expiresAt: Date.now() + roleIntegrationDraftTtlMs,
            form,
            selectedTemplateKey,
            step,
            selectedAssessmentId,
            selectedIntegratedRepoId,
        });
        router.push(`/industry/integrations?returnTo=role&draftId=${encodeURIComponent(draftId)}`);
    };

    const selectTemplate = (template: WizardRoleTemplate) => {
        setSelectedTemplateKey(template.key);
        setForm((prev) => applyWizardTemplate(prev, template));
    };

    const validateCurrentStep = () => {
        if (step === 0 && (!form.title.trim() || !form.description.trim())) {
            setErrorMessage('Add a role title and job description before continuing.');
            return false;
        }

        if (step === 2 && (!form.packageOffered.trim() || !form.location.trim())) {
            setErrorMessage('Add compensation and location before creating the role.');
            return false;
        }

        setErrorMessage(null);
        return true;
    };

    const parseCsv = (value: string) =>
        value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

    const goNext = () => {
        if (!validateCurrentStep()) return;
        setStep((prev) => Math.min(2, prev + 1) as 0 | 1 | 2);
    };

    const onSubmit = async () => {
        if (!validateCurrentStep()) return;

        setSubmitting(true);
        setErrorMessage(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const pipelineStages = selectedTemplate.stages.map((stageItem, index) => ({
                id: `${selectedTemplate.key}-${index + 1}`,
                order: index + 1,
                name: stageItem.name,
                kind: stageItem.kind,
                description: stageItem.description,
            }));

            const payload = {
                title: form.title.trim(),
                jobProfile: form.jobProfile.trim(),
                type: form.type,
                workMode: form.workMode,
                description: form.description.trim(),
                roles: parseCsv(form.roles).length ? parseCsv(form.roles) : [selectedTemplate.name],
                skillsRequired: parseCsv(form.skillsRequired),
                experienceRequired: form.experienceRequired.trim() || undefined,
                openings: form.openings ? Number(form.openings) : undefined,
                applicationDeadline: form.applicationDeadline || undefined,
                applyLink: form.applyLink.trim() || undefined,
                batchEligible: form.batchEligible.trim() || undefined,
                packageOffered: form.packageOffered.trim(),
                salaryRange: form.salaryRange.trim() || form.packageOffered.trim(),
                location: form.location.trim(),
                githubRepositoryUrl: form.githubRepositoryUrl.trim() || undefined,
                issueTrackerUrl: form.issueTrackerUrl.trim() || undefined,
                documentationUrl: form.documentationUrl.trim() || undefined,
                workContext: form.workContext.trim() || undefined,
                pipelineNotes: form.pipelineNotes.trim() || undefined,
                pipelineTemplateKey: selectedTemplate.key,
                pipelineStages,
                repositoryIds: selectedIntegratedRepoId ? [selectedIntegratedRepoId] : undefined,
                automationEnabled: form.automationEnabled,
                companyProfileIncluded: form.companyProfileIncluded,
                companyName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Corporate Partner',
            };

            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(Array.isArray(errData?.message) ? errData.message.join(', ') : errData?.message || 'Server error');
            }

            const created = await res.json();
            if (selectedAssessmentId) {
                const attachRes = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements/${created.id}/assessments/${selectedAssessmentId}/attach`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ isPrimary: true }),
                });
                if (!attachRes.ok) {
                    const attachError = await attachRes.json().catch(() => null);
                    throw new Error(attachError?.message || 'Role created, but assessment attachment failed.');
                }
            }
            router.push(`/industry/drives/${created.id}/ats`);
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to create role.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6 pb-10">
            <Link href="/industry/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600">
                <ArrowLeft size={16} />
                Back to dashboard
            </Link>

            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">Company hiring setup</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Create a context-aware role</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                        Attach the real work first, choose a proven pipeline, then let Emble automate assessment and interview handoff.
                    </p>
                </div>
                <Link
                    href="/industry/assessments/new"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50"
                >
                    <Sparkles size={17} />
                    New Assessment Agent
                </Link>
            </header>

            <div className="flex items-center justify-center gap-3">
                {wizardSteps.map((label, index) => {
                    const active = step === index;
                    const done = step > index;
                    return (
                        <div key={label} className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setStep(index as 0 | 1 | 2)}
                                className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-bold transition ${active || done
                                    ? 'border-emerald-700 bg-emerald-950 text-white'
                                    : 'border-slate-200 bg-white text-slate-500'
                                    }`}
                                aria-label={`Go to ${label}`}
                            >
                                {done ? <Check size={17} /> : index + 1}
                            </button>
                            <span className={`hidden text-sm font-bold sm:inline ${active ? 'text-slate-950' : 'text-slate-500'}`}>{label}</span>
                            {index < wizardSteps.length - 1 ? <div className="h-px w-14 bg-slate-200 md:w-28" /> : null}
                        </div>
                    );
                })}
            </div>

            {errorMessage ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {errorMessage}
                </div>
            ) : null}

            {step === 0 ? (
                <WizardContextStep
                    form={form}
                    updateField={updateField}
                    connectedCount={connectedCount}
                    integratedRepos={integratedRepos}
                    selectedIntegratedRepoId={selectedIntegratedRepoId}
                    onSelectIntegratedRepo={selectIntegratedRepo}
                    onOpenIntegrations={openIntegrationsForRepo}
                />
            ) : null}
            {step === 1 ? <WizardPipelineStep templates={templates} selectedTemplate={selectedTemplate} onSelectTemplate={selectTemplate} /> : null}
            {step === 2 ? (
                <WizardReviewStep
                    form={form}
                    selectedTemplate={selectedTemplate}
                    updateField={updateField}
                    connectedCount={connectedCount}
                    assessmentLibrary={assessmentLibrary}
                    selectedAssessmentId={selectedAssessmentId}
                    setSelectedAssessmentId={setSelectedAssessmentId}
                />
            ) : null}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                    type="button"
                    onClick={() => setStep((prev) => Math.max(0, prev - 1) as 0 | 1 | 2)}
                    disabled={step === 0 || submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                {step < 2 ? (
                    <button
                        type="button"
                        onClick={goNext}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-900"
                    >
                        Continue
                        <ArrowRight size={16} />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={submitting}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                        Create role and open ATS
                    </button>
                )}
            </div>
        </div>
    );
}

function applyWizardTemplate(form: WizardFormState, template: WizardRoleTemplate): WizardFormState {
    return {
        ...form,
        title: template.defaultTitle,
        jobProfile: template.defaultJobProfile,
        type: template.defaultType || form.type,
        workMode: template.defaultWorkMode || form.workMode,
        description: template.defaultDescription,
        experienceRequired: template.defaultExperience,
        roles: template.name,
        skillsRequired: template.defaultSkills.join(', '),
        pipelineNotes: `${template.name} pipeline with ${template.stages.filter((stageItem) => stageItem.kind === 'assessment').length} assessment stage(s).`,
    };
}

function buildIntegratedRepoRoleContext(repo: GithubRepository) {
    const snapshot = repo.contextSnapshot || {};
    const readme = snapshot.readme as { path?: string; content?: string; truncated?: boolean } | undefined;
    const tree = snapshot.tree as
        | {
            totalFiles?: number;
            totalDirectories?: number;
            truncated?: boolean;
            importantPaths?: string[];
            samplePaths?: string[];
        }
        | undefined;
    const manifests = Array.isArray(snapshot.manifests)
        ? snapshot.manifests as Array<{ path?: string; content?: string; truncated?: boolean }>
        : [];
    const languages = snapshot.languages as Record<string, number> | undefined;
    const languageSummary = languages
        ? Object.entries(languages)
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .slice(0, 6)
            .map(([language, bytes]) => `${language} (${bytes} bytes)`)
            .join(', ')
        : '';
    const importantPaths = Array.isArray(tree?.importantPaths) && tree.importantPaths.length
        ? tree.importantPaths.slice(0, 60).join('\n')
        : Array.isArray(tree?.samplePaths)
            ? tree.samplePaths.slice(0, 40).join('\n')
            : '';
    const manifestSummary = manifests
        .filter((file) => file.path)
        .slice(0, 5)
        .map((file) => {
            const content = file.content ? `\n${file.content.slice(0, 2500)}` : '';
            return `### ${file.path}${file.truncated ? ' (truncated)' : ''}${content}`;
        })
        .join('\n\n');

    return [
        `Integrated GitHub repo: ${repo.fullName}`,
        `Repository URL: ${repo.htmlUrl}`,
        `Branch: ${repo.selectedBranch || repo.defaultBranch || 'main'}`,
        `Visibility: ${repo.private ? 'private' : 'public'}`,
        snapshot.primaryLanguage ? `Primary language: ${String(snapshot.primaryLanguage)}` : '',
        languageSummary ? `Languages: ${languageSummary}` : '',
        Array.isArray(snapshot.topics) && snapshot.topics.length ? `Topics: ${snapshot.topics.join(', ')}` : '',
        typeof tree?.totalFiles === 'number'
            ? `Repository shape: ${tree.totalFiles} files, ${tree.totalDirectories || 0} directories${tree.truncated ? ', tree truncated by GitHub' : ''}.`
            : '',
        importantPaths ? `Important paths:\n${importantPaths}` : '',
        readme?.content
            ? `README context (${readme.path || 'README'}${readme.truncated ? ', truncated' : ''}):\n${readme.content.slice(0, 7000)}`
            : repo.contextStatus === 'ready'
                ? 'README context: No README found in the parsed repository snapshot.'
                : 'README context: Parse this repository from Integrations to add README content.',
        manifestSummary ? `Project files:\n${manifestSummary}` : '',
    ].filter(Boolean).join('\n\n').slice(0, 22_000);
}

function applyIntegratedRepoToRoleForm(form: WizardFormState, repo: GithubRepository): WizardFormState {
    const cleanedWorkContext = stripIntegratedRepoContext(form.workContext);

    return {
        ...form,
        githubRepositoryUrl: repo.htmlUrl,
        workContext: cleanedWorkContext,
    };
}

function stripIntegratedRepoContext(value: string) {
    return value
        .replace(/\n*\[Integrated GitHub Context:[\s\S]*?\[\/Integrated GitHub Context\]\n*/g, '\n')
        .trim();
}

function isParsedRepo(repo: GithubRepository) {
    return Boolean(repo.contextSnapshot) && (repo.contextStatus === 'parsed' || repo.contextStatus === 'ready');
}

function createRoleIntegrationDraftId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function roleIntegrationDraftKey(id: string) {
    return `${roleIntegrationDraftPrefix}${id}`;
}

function writeRoleIntegrationDraft(draft: RoleIntegrationDraft) {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.setItem(roleIntegrationDraftKey(draft.id), JSON.stringify(draft));
    } catch {
        // The role form still works; only the return restore is skipped.
    }
}

function readRoleIntegrationDraft(id: string | null): RoleIntegrationDraft | null {
    if (!id || typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(roleIntegrationDraftKey(id));
        if (!raw) return null;
        const draft = JSON.parse(raw) as RoleIntegrationDraft;
        if (!draft?.id || draft.expiresAt < Date.now()) {
            sessionStorage.removeItem(roleIntegrationDraftKey(id));
            return null;
        }
        return draft;
    } catch {
        return null;
    }
}

function WizardContextStep({
    form,
    updateField,
    connectedCount,
    integratedRepos,
    selectedIntegratedRepoId,
    onSelectIntegratedRepo,
    onOpenIntegrations,
}: {
    form: WizardFormState;
    updateField: <K extends keyof WizardFormState>(field: K, value: WizardFormState[K]) => void;
    connectedCount: number;
    integratedRepos: GithubRepository[];
    selectedIntegratedRepoId: string;
    onSelectIntegratedRepo: (repoId: string) => void;
    onOpenIntegrations: () => void;
}) {
    const selectedRepo = integratedRepos.find((repo) => repo.id === selectedIntegratedRepoId) || null;
    const selectedSnapshot = selectedRepo?.contextSnapshot || {};
    const selectedTree = selectedSnapshot.tree as { totalFiles?: number; totalDirectories?: number } | undefined;
    const selectedReadme = selectedSnapshot.readme as { path?: string; content?: string } | undefined;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Context</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">Tell us about this role</h2>
                <p className="mt-1 text-sm text-slate-500">Context added here becomes the knowledge base for assessments and interview focus.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-[1fr_340px]">
                <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <WizardField label="Role title">
                            <input value={form.title} onChange={(event) => updateField('title', event.target.value)} className={wizardInputClass} placeholder="Software Engineer" />
                        </WizardField>
                        <WizardField label="Job profile">
                            <input value={form.jobProfile} onChange={(event) => updateField('jobProfile', event.target.value)} className={wizardInputClass} placeholder="Product Engineering" />
                        </WizardField>
                    </div>

                    <WizardField label="Job description">
                        <textarea
                            value={form.description}
                            onChange={(event) => updateField('description', event.target.value)}
                            className={`${wizardInputClass} min-h-[150px] resize-y`}
                            placeholder="Paste the role brief, responsibilities, and requirements."
                        />
                    </WizardField>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                                    <Github size={16} />
                                    Integrated GitHub repository
                                </div>
                                <p className="mt-1 text-sm text-emerald-900/70">
                                    Reuse a connected repo as role context. Parsed README and project files are copied into the role notes.
                                </p>
                            </div>
                            <button type="button" onClick={onOpenIntegrations} className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-bold text-emerald-900 shadow-sm hover:bg-emerald-100">
                                Manage integrations
                            </button>
                        </div>

                        {integratedRepos.length ? (
                            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
                                <select
                                    value={selectedIntegratedRepoId}
                                    onChange={(event) => onSelectIntegratedRepo(event.target.value)}
                                    className={wizardInputClass}
                                >
                                    <option value="">Select a parsed repository</option>
                                    {integratedRepos.map((repo) => (
                                        <option key={repo.id} value={repo.id} disabled={!isParsedRepo(repo)}>
                                            {repo.fullName} - {isParsedRepo(repo) ? 'parsed' : 'parse in Integrations'}
                                        </option>
                                    ))}
                                </select>
                                <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs text-slate-600">
                                    {selectedRepo ? (
                                        <>
                                            <div className="font-bold text-slate-950">{isParsedRepo(selectedRepo) ? 'Parsed context ready' : selectedRepo.contextStatus === 'failed' ? 'Parse failed' : 'Parse before use'}</div>
                                            <div className="mt-1">
                                                {selectedReadme?.path || 'README'}{typeof selectedTree?.totalFiles === 'number' ? ` - ${selectedTree.totalFiles} files` : ''}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="font-bold text-slate-950">No repo selected</div>
                                            <div className="mt-1">Choose a repo to attach codebase context.</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 rounded-xl border border-dashed border-emerald-200 bg-white px-4 py-3 text-sm text-slate-600">
                                No linked repositories yet. Add and parse repos from Integrations, then return here.
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <WizardContextInput icon={<Github size={16} />} label="Repos" value={form.githubRepositoryUrl} placeholder="https://github.com/acme/app" onChange={(value) => updateField('githubRepositoryUrl', value)} />
                        <WizardContextInput icon={<ClipboardList size={16} />} label="Tickets" value={form.issueTrackerUrl} placeholder="https://linear.app/acme/..." onChange={(value) => updateField('issueTrackerUrl', value)} />
                        <WizardContextInput icon={<BookOpen size={16} />} label="Docs" value={form.documentationUrl} placeholder="https://docs.acme.com" onChange={(value) => updateField('documentationUrl', value)} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <WizardField label="Product and codebase notes">
                            <textarea value={form.workContext} onChange={(event) => updateField('workContext', event.target.value)} className={`${wizardInputClass} min-h-[120px]`} placeholder="Mention services, modules, customer flows, failure modes, or tickets candidates should reason about." />
                        </WizardField>
                        <WizardField label="Pipeline notes">
                            <textarea value={form.pipelineNotes} onChange={(event) => updateField('pipelineNotes', event.target.value)} className={`${wizardInputClass} min-h-[120px]`} placeholder="Example: take-home, walkthrough, then final debrief." />
                        </WizardField>
                    </div>
                </div>

                <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-white p-2 text-emerald-700 shadow-sm">
                                <FileText size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-950">Attached context</h3>
                                <p className="text-sm text-slate-500">{connectedCount} source(s) connected</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-slate-600">
                            <WizardContextStatus active={Boolean(form.description.trim())} label="Job description" />
                            <WizardContextStatus active={Boolean(selectedIntegratedRepoId || form.githubRepositoryUrl.trim())} label="GitHub repository" />
                            <WizardContextStatus active={Boolean(form.issueTrackerUrl.trim())} label="Tickets or issues" />
                            <WizardContextStatus active={Boolean(form.documentationUrl.trim())} label="Documentation" />
                            <WizardContextStatus active={form.companyProfileIncluded} label="Company profile" />
                        </div>
                    </div>

                    <WizardToggle
                        checked={form.companyProfileIncluded}
                        label="Inherit company profile"
                        description="Use account-level company context when generating tasks."
                        onChange={(checked) => updateField('companyProfileIncluded', checked)}
                    />
                    <WizardToggle
                        checked={form.automationEnabled}
                        label="Automate candidate handoff"
                        description="Applications try to create and email interview links."
                        onChange={(checked) => updateField('automationEnabled', checked)}
                    />
                </aside>
            </div>
        </section>
    );
}

function WizardPipelineStep({
    templates,
    selectedTemplate,
    onSelectTemplate,
}: {
    templates: WizardRoleTemplate[];
    selectedTemplate: WizardRoleTemplate;
    onSelectTemplate: (template: WizardRoleTemplate) => void;
}) {
    return (
        <section className="space-y-5">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Pipeline</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">How do you want to build the pipeline?</h2>
                <p className="mt-1 text-sm text-slate-500">Pick a template. Assessment stages start as placeholders you can generate or edit from ATS.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {templates.map((template) => {
                    const active = selectedTemplate.key === template.key;
                    return (
                        <button
                            key={template.key}
                            type="button"
                            onClick={() => onSelectTemplate(template)}
                            className={`rounded-2xl border p-5 text-left transition ${active ? 'border-emerald-200 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`rounded-xl p-3 ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {template.key.includes('manager') ? <Users size={20} /> : <Code2 size={20} />}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-950">{template.name}</h3>
                                    <p className="mt-1 text-sm text-slate-500">{template.subtitle}</p>
                                    <p className="mt-3 text-xs font-bold text-slate-500">
                                        {template.stages.length} stages - {template.stages.filter((stageItem) => stageItem.kind === 'assessment').length} assessment(s)
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-950">{selectedTemplate.name}</h3>
                        <p className="text-sm text-slate-500">Assessment stages can be generated from the role context after creation.</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{selectedTemplate.defaultTimeLimitMinutes} min default</span>
                </div>
                <div className="mt-5 space-y-3">
                    {selectedTemplate.stages.map((stageItem, index) => (
                        <div key={`${stageItem.name}-${index}`} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-500">{index + 1}</div>
                            <div className="min-w-0 flex-1">
                                <div className="font-bold text-slate-950">{stageItem.name}</div>
                                <div className="text-sm text-slate-500">{stageItem.description}</div>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${stageItem.kind === 'assessment' ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-500'}`}>
                                {stageItem.kind}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function WizardReviewStep({
    form,
    selectedTemplate,
    updateField,
    connectedCount,
    assessmentLibrary,
    selectedAssessmentId,
    setSelectedAssessmentId,
}: {
    form: WizardFormState;
    selectedTemplate: WizardRoleTemplate;
    updateField: <K extends keyof WizardFormState>(field: K, value: WizardFormState[K]) => void;
    connectedCount: number;
    assessmentLibrary: Array<{ id: string; name: string }>;
    selectedAssessmentId: string;
    setSelectedAssessmentId: (id: string) => void;
}) {
    return (
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Review</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">Confirm launch details</h2>
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <WizardField label="Compensation">
                        <input value={form.packageOffered} onChange={(event) => updateField('packageOffered', event.target.value)} className={wizardInputClass} placeholder="14 LPA or 40000/month stipend" />
                    </WizardField>
                    <WizardField label="Salary range / stipend">
                        <input value={form.salaryRange} onChange={(event) => updateField('salaryRange', event.target.value)} className={wizardInputClass} placeholder="12-18 LPA" />
                    </WizardField>
                    <WizardField label="Location">
                        <input value={form.location} onChange={(event) => updateField('location', event.target.value)} className={wizardInputClass} placeholder="Bengaluru, India" />
                    </WizardField>
                    <WizardField label="Openings">
                        <input type="number" min={1} value={form.openings} onChange={(event) => updateField('openings', event.target.value)} className={wizardInputClass} placeholder="6" />
                    </WizardField>
                    <WizardField label="Batch eligible">
                        <input value={form.batchEligible} onChange={(event) => updateField('batchEligible', event.target.value)} className={wizardInputClass} placeholder="2025, 2026" />
                    </WizardField>
                    <WizardField label="Application deadline">
                        <input type="date" value={form.applicationDeadline} onChange={(event) => updateField('applicationDeadline', event.target.value)} className={wizardInputClass} />
                    </WizardField>
                    <WizardField label="Employment type">
                        <select value={form.type} onChange={(event) => updateField('type', event.target.value)} className={wizardInputClass}>
                            <option value="Full-Time">Full-Time</option>
                            <option value="Internship">Internship</option>
                            <option value="Part-Time">Part-Time</option>
                            <option value="Contract">Contract</option>
                            <option value="Remote">Remote</option>
                        </select>
                    </WizardField>
                    <WizardField label="Work mode">
                        <select value={form.workMode} onChange={(event) => updateField('workMode', event.target.value)} className={wizardInputClass}>
                            <option value="Offline">Offline</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Remote">Remote</option>
                        </select>
                    </WizardField>
                    <WizardField label="External application link">
                        <input value={form.applyLink} onChange={(event) => updateField('applyLink', event.target.value)} className={wizardInputClass} placeholder="https://company.careers/role" />
                    </WizardField>
                    <WizardField label="Experience">
                        <input value={form.experienceRequired} onChange={(event) => updateField('experienceRequired', event.target.value)} className={wizardInputClass} placeholder="0-3 years" />
                    </WizardField>
                    <WizardField label="Attach assessment">
                        <select value={selectedAssessmentId} onChange={(event) => setSelectedAssessmentId(event.target.value)} className={wizardInputClass}>
                            <option value="">Create role without an assessment</option>
                            {assessmentLibrary.map((assessment) => (
                                <option key={assessment.id} value={assessment.id}>{assessment.name}</option>
                            ))}
                        </select>
                    </WizardField>
                </div>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/10 p-3 text-blue-200">
                        <BriefcaseBusiness size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold">{form.title}</h3>
                        <p className="text-sm text-slate-400">{selectedTemplate.name}</p>
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                    <WizardSummaryStat label="Stages" value={String(selectedTemplate.stages.length)} />
                    <WizardSummaryStat label="Assessments" value={String(selectedTemplate.stages.filter((stageItem) => stageItem.kind === 'assessment').length)} />
                    <WizardSummaryStat label="Context" value={String(connectedCount)} />
                    <WizardSummaryStat label="Automation" value={form.automationEnabled ? 'On' : 'Off'} />
                </div>
                <div className="mt-6 space-y-2 text-sm text-slate-300">
                    <WizardContextStatus active={Boolean(form.githubRepositoryUrl.trim())} label="Repo as knowledge base" dark />
                    <WizardContextStatus active={Boolean(form.issueTrackerUrl.trim())} label="Tickets attached" dark />
                    <WizardContextStatus active={Boolean(form.documentationUrl.trim())} label="Docs attached" dark />
                    <WizardContextStatus active={form.companyProfileIncluded} label="Company profile inherited" dark />
                </div>
            </aside>
        </section>
    );
}

function WizardField({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
            {children}
        </label>
    );
}

function WizardContextInput({
    icon,
    label,
    value,
    placeholder,
    onChange,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                {icon}
                {label}
            </span>
            <input value={value} onChange={(event) => onChange(event.target.value)} className={`${wizardInputClass} font-mono`} placeholder={placeholder} />
        </label>
    );
}

function WizardContextStatus({ active, label, dark = false }: { active: boolean; label: string; dark?: boolean }) {
    return (
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${dark ? 'bg-white/5 text-slate-300' : 'bg-white text-slate-600'}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${active ? 'bg-emerald-600 text-white' : dark ? 'bg-white/10 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                {active ? <Check size={13} /> : <Plus size={13} />}
            </span>
            <span className="text-sm font-semibold">{label}</span>
        </div>
    );
}

function WizardToggle({
    checked,
    label,
    description,
    onChange,
}: {
    checked: boolean;
    label: string;
    description: string;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <span>
                <span className="block text-sm font-bold text-slate-950">{label}</span>
                <span className="block text-xs text-slate-500">{description}</span>
            </span>
            <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-emerald-700" />
        </label>
    );
}

function WizardSummaryStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="mt-1 text-xs font-semibold text-slate-400">{label}</div>
        </div>
    );
}
