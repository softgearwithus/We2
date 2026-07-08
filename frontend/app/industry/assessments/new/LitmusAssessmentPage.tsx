'use client';

import { fetchApi } from '@/app/lib/apiClient';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    BriefcaseBusiness,
    Building2,
    Check,
    ChevronRight,
    ClipboardList,
    Code2,
    FileText,
    Github,
    Loader2,
    Plus,
    Search,
    Send,
    Sparkles,
    Upload,
    X,
} from 'lucide-react';

type FlowMode = 'existing' | 'new' | null;
type WizardStep = 'context' | 'pipeline' | 'review';

type PipelineStage = {
    id?: string;
    order?: number;
    name: string;
    kind: 'assessment' | 'step';
    description?: string;
};

type CompanyDrive = {
    id: string;
    title: string;
    companyName?: string;
    jobProfile?: string;
    description?: string;
    githubRepositoryUrl?: string | null;
    issueTrackerUrl?: string | null;
    documentationUrl?: string | null;
    workContext?: string | null;
    pipelineNotes?: string | null;
    pipelineTemplateKey?: string | null;
    pipelineStages?: PipelineStage[] | null;
    packageOffered?: string | null;
    salaryRange?: string | null;
    location?: string | null;
    type?: string | null;
    workMode?: string | null;
    skillsRequired?: string[] | null;
    roles?: string[] | null;
};

type GithubRepository = {
    id: string;
    fullName: string;
    htmlUrl: string;
    defaultBranch?: string | null;
    selectedBranch?: string | null;
    private?: boolean;
    isLinked?: boolean;
    contextStatus?: 'syncing' | 'ready' | 'failed' | string | null;
    contextSnapshot?: Record<string, any> | null;
    contextSyncedAt?: string | null;
    contextError?: string | null;
};

type GeneratedAssessment = {
    id: string;
    name: string;
    instructions?: string | null;
};

type AssessmentContextSource = {
    type: 'job_description' | 'repo' | 'ats' | 'role' | 'company_profile' | 'notes';
    label?: string;
    url?: string;
    content?: string;
    metadata?: Record<string, any>;
};

type HiringRoleTemplate = {
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
    stages: PipelineStage[];
};

type RoleDraft = {
    title: string;
    jobProfile: string;
    description: string;
    skills: string;
    location: string;
    type: string;
    workMode: string;
    packageOffered: string;
    salaryRange: string;
    experienceRequired: string;
    openings: string;
    applicationDeadline: string;
    batchEligible: string;
    applyLink: string;
    workContext: string;
    pipelineNotes: string;
};

type GithubReturnDraft = {
    id: string;
    expiresAt: number;
    mode: FlowMode;
    step: WizardStep;
    prompt: string;
    selectedDriveId: string;
    selectedTemplateKey: string;
    repoPanelOpen: boolean;
    selectedRepoIds: string[];
    selectedRepoBranches: Record<string, string>;
    manualRepoUrl: string;
    jobDescriptionMode: 'paste' | 'upload' | 'url';
    jobDescriptionText: string;
    jobDescriptionUrl: string;
    jobDescriptionFileName: string;
    jobDescriptionSource: AssessmentContextSource | null;
    companyProfileIncluded: boolean;
    roleDraft: RoleDraft;
};

const stepOrder: WizardStep[] = ['context', 'pipeline', 'review'];
const githubReturnDraftPrefix = 'emble.github.assessment-return.';
const githubReturnDraftTtlMs = 30 * 60 * 1000;
const assessmentAutosaveDraftKey = 'emble.assessment.new.autosave';
const emptyRoleDraft: RoleDraft = {
    title: '',
    jobProfile: '',
    description: '',
    skills: '',
    location: '',
    type: 'Full-Time',
    workMode: 'Hybrid',
    packageOffered: '',
    salaryRange: '',
    experienceRequired: '',
    openings: '',
    applicationDeadline: '',
    batchEligible: '',
    applyLink: '',
    workContext: '',
    pipelineNotes: '',
};

const fallbackTemplates: HiringRoleTemplate[] = [
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
        subtitle: 'ML, DevOps/platform, security',
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
        subtitle: 'People leadership, cross-functional',
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
            { name: 'Project walkthrough', kind: 'assessment', description: 'Resume/project discussion with practical technical questions' },
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
];

const freshTemplate: HiringRoleTemplate = {
    key: 'custom',
    name: 'Custom pipeline',
    subtitle: 'Empty pipeline, add stages later',
    defaultTitle: 'New role',
    defaultJobProfile: 'Hiring team',
    defaultType: 'Full-Time',
    defaultWorkMode: 'Hybrid',
    defaultExperience: '',
    defaultSkills: [],
    defaultLanguage: 'markdown',
    defaultTimeLimitMinutes: 90,
    defaultDescription: '',
    stages: [],
};

export default function LitmusAssessmentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [prompt, setPrompt] = useState('');
    const [mode, setMode] = useState<FlowMode>(null);
    const [step, setStep] = useState<WizardStep>('context');
    const [drives, setDrives] = useState<CompanyDrive[]>([]);
    const [selectedDriveId, setSelectedDriveId] = useState('');
    const [templates, setTemplates] = useState<HiringRoleTemplate[]>(fallbackTemplates);
    const [selectedTemplateKey, setSelectedTemplateKey] = useState(fallbackTemplates[0].key);
    const [rolePickerOpen, setRolePickerOpen] = useState(false);
    const [roleSearch, setRoleSearch] = useState('');
    const [repoPanelOpen, setRepoPanelOpen] = useState(false);
    const [repos, setRepos] = useState<GithubRepository[]>([]);
    const [selectedRepoIds, setSelectedRepoIds] = useState<string[]>([]);
    const [selectedRepoBranches, setSelectedRepoBranches] = useState<Record<string, string>>({});
    const [repoBusyIds, setRepoBusyIds] = useState<string[]>([]);
    const [manualRepoUrl, setManualRepoUrl] = useState('');
    const [githubInstallUrl, setGithubInstallUrl] = useState<string | null>(null);
    const [githubConnecting, setGithubConnecting] = useState(false);
    const [githubRepoSyncing, setGithubRepoSyncing] = useState(false);
    const [githubRepoSyncError, setGithubRepoSyncError] = useState<string | null>(null);
    const [githubConfigured, setGithubConfigured] = useState(true);
    const [githubSetupMessage, setGithubSetupMessage] = useState<string | null>(null);
    const [githubMissingConfig, setGithubMissingConfig] = useState<string[]>([]);
    const [jobDescriptionMode, setJobDescriptionMode] = useState<'paste' | 'upload' | 'url'>('paste');
    const [jobDescriptionText, setJobDescriptionText] = useState('');
    const [jobDescriptionUrl, setJobDescriptionUrl] = useState('');
    const [jobDescriptionFileName, setJobDescriptionFileName] = useState('');
    const [jobDescriptionSource, setJobDescriptionSource] = useState<AssessmentContextSource | null>(null);
    const [contextBusy, setContextBusy] = useState<'upload' | 'url' | null>(null);
    const [contextError, setContextError] = useState<string | null>(null);
    const [companyProfileIncluded, setCompanyProfileIncluded] = useState(true);
    const [roleDraft, setRoleDraft] = useState<RoleDraft>(emptyRoleDraft);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [created, setCreated] = useState<GeneratedAssessment | null>(null);

    const restoreGithubReturnDraft = (returnId: string | null) => {
        const fallbackMode = normalizeFlowMode(searchParams.get('flow'));
        const fallbackStep = normalizeWizardStep(searchParams.get('step'));
        const shouldOpenRepos = searchParams.get('panel') === 'repos';

        if (!returnId || typeof window === 'undefined') {
            if (fallbackMode) setMode(fallbackMode);
            if (fallbackStep) setStep(fallbackStep);
            if (shouldOpenRepos) setRepoPanelOpen(true);
            return null;
        }

        const draft = readGithubReturnDraft(returnId);
        if (!draft) {
            setMode(fallbackMode || 'new');
            setStep(fallbackStep || 'context');
            setRepoPanelOpen(true);
            return null;
        }

        setMode(draft.mode || fallbackMode || 'new');
        setStep(fallbackStep || draft.step || 'context');
        setPrompt(draft.prompt || '');
        setSelectedDriveId(draft.selectedDriveId || '');
        setSelectedTemplateKey(draft.selectedTemplateKey || fallbackTemplates[0].key);
        setRepoPanelOpen(true);
        setSelectedRepoIds(Array.isArray(draft.selectedRepoIds) ? draft.selectedRepoIds : []);
        setSelectedRepoBranches(draft.selectedRepoBranches || {});
        setManualRepoUrl(draft.manualRepoUrl || '');
        setJobDescriptionMode(draft.jobDescriptionMode || 'paste');
        setJobDescriptionText(draft.jobDescriptionText || '');
        setJobDescriptionUrl(draft.jobDescriptionUrl || '');
        setJobDescriptionFileName(draft.jobDescriptionFileName || '');
        setJobDescriptionSource(draft.jobDescriptionSource || null);
        setCompanyProfileIncluded(draft.companyProfileIncluded !== false);
        setRoleDraft({ ...emptyRoleDraft, ...(draft.roleDraft || {}) });
        return draft;
    };

    const restoreAssessmentAutosaveDraft = () => {
        const draft = readAssessmentAutosaveDraft();
        if (!draft) return null;
        setMode(draft.mode || null);
        setStep(draft.step || 'context');
        setPrompt(draft.prompt || '');
        setSelectedDriveId(draft.selectedDriveId || '');
        setSelectedTemplateKey(draft.selectedTemplateKey || fallbackTemplates[0].key);
        setRepoPanelOpen(Boolean(draft.repoPanelOpen));
        setSelectedRepoIds(Array.isArray(draft.selectedRepoIds) ? draft.selectedRepoIds : []);
        setSelectedRepoBranches(draft.selectedRepoBranches || {});
        setManualRepoUrl(draft.manualRepoUrl || '');
        setJobDescriptionMode(draft.jobDescriptionMode || 'paste');
        setJobDescriptionText(draft.jobDescriptionText || '');
        setJobDescriptionUrl(draft.jobDescriptionUrl || '');
        setJobDescriptionFileName(draft.jobDescriptionFileName || '');
        setJobDescriptionSource(draft.jobDescriptionSource || null);
        setCompanyProfileIncluded(draft.companyProfileIncluded !== false);
        setRoleDraft({ ...emptyRoleDraft, ...(draft.roleDraft || {}) });
        return draft;
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setErrorMessage(null);
            setGithubRepoSyncError(null);
            const returnDraftId = searchParams.get('draftId') || searchParams.get('githubReturnId');
            const restoredDraft = restoreGithubReturnDraft(returnDraftId);
            if (!restoredDraft && !returnDraftId && !searchParams.get('repoId')) {
                restoreAssessmentAutosaveDraft();
            }
            const requestedPrompt = searchParams.get('prompt');
            if (requestedPrompt && !restoredDraft && !returnDraftId) {
                setPrompt(requestedPrompt);
            }
            try {
                const { getActiveToken } = await import('@/app/lib/auth-storage');
                const token = getActiveToken();
                const next = '/industry/assessments/new';
                const [drivesRes, reposRes, installRes, templatesRes] = await Promise.all([
                    fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements/my-drives`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/repositories?linked=true`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/install-url?next=${encodeURIComponent(next)}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements/templates/role-pipelines`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (drivesRes.status === 401) {
                    router.push('/login/industry?next=%2Findustry%2Fassessments%2Fnew');
                    return;
                }

                if (drivesRes.ok) {
                    const payload = await drivesRes.json();
                    setDrives(payload);
                    if (!restoredDraft?.selectedDriveId && payload[0]?.id) setSelectedDriveId(payload[0].id);
                }
                if (reposRes.ok) {
                    const payload = await reposRes.json();
                    setRepos(payload);
                    setSelectedRepoBranches((current) => ({ ...buildRepoBranchMap(payload), ...current }));
                    applyRequestedRepoSelection(payload, searchParams, setSelectedRepoIds, setRepoPanelOpen);
                }
                if (installRes.ok) {
                    const payload = await installRes.json();
                    setGithubInstallUrl(payload.installUrl || null);
                    setGithubConfigured(payload.configured !== false);
                    setGithubSetupMessage(payload.message || null);
                    setGithubMissingConfig(Array.isArray(payload.missing) ? payload.missing : []);
                }
                if (templatesRes.ok) {
                    const payload = await templatesRes.json();
                    if (Array.isArray(payload) && payload.length) {
                        setTemplates(payload);
                        setSelectedTemplateKey((current) => current || payload[0].key);
                    }
                }
                if (searchParams.get('github') === 'connected') {
                    setRepoPanelOpen(true);
                    setGithubRepoSyncing(true);
                    try {
                        const syncRes = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/repositories?linked=true&sync=true`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (!syncRes.ok) {
                            throw new Error(await readApiError(syncRes, 'Unable to sync GitHub repositories.'));
                        }
                        const payload = await syncRes.json();
                        setRepos(payload);
                        setSelectedRepoBranches((current) => ({ ...buildRepoBranchMap(payload), ...current }));
                        applyRequestedRepoSelection(payload, searchParams, setSelectedRepoIds, setRepoPanelOpen);
                    } catch (error: any) {
                        setGithubRepoSyncError(error.message || 'Unable to sync GitHub repositories.');
                    } finally {
                        setGithubRepoSyncing(false);
                    }
                }

                if (searchParams.get('github') === 'error') {
                    setErrorMessage(searchParams.get('reason') || 'GitHub connection failed. Try installing the app again.');
                }
            } catch (error: any) {
                setErrorMessage(error.message || 'Unable to load assessment setup.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [router, searchParams]);

    useEffect(() => {
        if (loading || created) return;
        writeAssessmentAutosaveDraft({
            mode,
            step,
            prompt,
            selectedDriveId,
            selectedTemplateKey,
            repoPanelOpen,
            selectedRepoIds,
            selectedRepoBranches,
            manualRepoUrl,
            jobDescriptionMode,
            jobDescriptionText,
            jobDescriptionUrl,
            jobDescriptionFileName,
            jobDescriptionSource,
            companyProfileIncluded,
            roleDraft,
            updatedAt: Date.now(),
        });
    }, [
        loading,
        created,
        mode,
        step,
        prompt,
        selectedDriveId,
        selectedTemplateKey,
        repoPanelOpen,
        selectedRepoIds,
        selectedRepoBranches,
        manualRepoUrl,
        jobDescriptionMode,
        jobDescriptionText,
        jobDescriptionUrl,
        jobDescriptionFileName,
        jobDescriptionSource,
        companyProfileIncluded,
        roleDraft,
    ]);

    const selectedDrive = useMemo(
        () => drives.find((drive) => drive.id === selectedDriveId) || null,
        [drives, selectedDriveId],
    );

    const selectedTemplate = useMemo(
        () => selectedTemplateKey === freshTemplate.key
            ? freshTemplate
            : templates.find((template) => template.key === selectedTemplateKey) || templates[0] || fallbackTemplates[0],
        [selectedTemplateKey, templates],
    );

    const filteredDrives = useMemo(() => {
        const query = roleSearch.trim().toLowerCase();
        if (!query) return drives;
        return drives.filter((drive) =>
            [drive.title, drive.jobProfile, drive.companyName]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(query),
        );
    }, [drives, roleSearch]);

    const selectedRepos = useMemo(
        () => repos.filter((repo) => selectedRepoIds.includes(repo.id)),
        [repos, selectedRepoIds],
    );

    const attachedCount = useMemo(() => {
        let count = companyProfileIncluded ? 1 : 0;
        if (jobDescriptionText.trim() || jobDescriptionUrl.trim() || jobDescriptionFileName) count += 1;
        if (selectedRepos.length || manualRepoUrl.trim()) count += 1;
        if (mode === 'existing' && selectedDrive) count += 1;
        return count;
    }, [companyProfileIncluded, jobDescriptionFileName, jobDescriptionText, jobDescriptionUrl, manualRepoUrl, mode, selectedDrive, selectedRepos.length]);

    const applyTemplateToDraft = (template: HiringRoleTemplate, preserveText = false) => {
        setSelectedTemplateKey(template.key);
        setRoleDraft((current) => ({
            ...current,
            title: preserveText && current.title ? current.title : template.defaultTitle,
            jobProfile: preserveText && current.jobProfile ? current.jobProfile : template.defaultJobProfile,
            description: preserveText && current.description ? current.description : template.defaultDescription,
            skills: preserveText && current.skills ? current.skills : template.defaultSkills.join(', '),
            type: template.defaultType,
            workMode: template.defaultWorkMode,
            experienceRequired: template.defaultExperience,
            pipelineNotes: `${template.name} pipeline with ${template.stages.filter((stageItem) => stageItem.kind === 'assessment').length} assessment stage(s).`,
        }));
        if (!preserveText || !jobDescriptionText.trim()) {
            setJobDescriptionText(template.defaultDescription);
            setJobDescriptionSource({
                type: 'job_description',
                label: `${template.name} role template`,
                content: template.defaultDescription,
                metadata: { source: 'template', templateKey: template.key },
            });
        }
    };

    const hydrateFromDrive = (drive: CompanyDrive) => {
        setSelectedDriveId(drive.id);
        setSelectedTemplateKey(drive.pipelineTemplateKey || selectedTemplateKey);
        setJobDescriptionText(drive.description || drive.workContext || '');
        setJobDescriptionFileName('');
        setJobDescriptionUrl('');
        setJobDescriptionSource({
            type: 'job_description',
            label: `${drive.title} role description`,
            content: drive.description || drive.workContext || '',
            metadata: { source: 'role', roleId: drive.id },
        });
        setManualRepoUrl(drive.githubRepositoryUrl || '');
        setRoleDraft({
            ...emptyRoleDraft,
            title: drive.title || '',
            jobProfile: drive.jobProfile || '',
            description: drive.description || '',
            skills: (drive.skillsRequired || drive.roles || []).join(', '),
            location: drive.location || '',
            type: drive.type || 'Full-Time',
            workMode: drive.workMode || 'Hybrid',
            packageOffered: drive.packageOffered || '',
            salaryRange: drive.salaryRange || '',
            workContext: drive.workContext || '',
            pipelineNotes: drive.pipelineNotes || '',
        });
    };

    const selectExistingRole = (drive: CompanyDrive) => {
        hydrateFromDrive(drive);
        setRolePickerOpen(false);
        beginFlow('existing');
    };

    const openExistingRolePicker = () => {
        if (!drives.length) {
            beginFlow('new');
            return;
        }
        setRolePickerOpen(true);
        setErrorMessage(null);
    };

    const beginFlow = (nextMode: FlowMode) => {
        setMode(nextMode);
        setStep('context');
        setErrorMessage(null);
        if (nextMode === 'new') {
            applyTemplateToDraft(selectedTemplate, true);
            setRoleDraft((current) => ({
                ...current,
                title: current.title || inferRoleTitle(prompt),
                jobProfile: current.jobProfile || inferRoleTitle(prompt),
            }));
        }
    };

    const linkRepository = async (repo: GithubRepository, branch: string) => {
        setRepoBusyIds((current) => Array.from(new Set([...current, repo.id])));
        setRepos((current) => current.map((item) => item.id === repo.id ? { ...item, isLinked: true, selectedBranch: branch, contextStatus: 'syncing', contextError: null } : item));
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/repositories/link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    repositoryId: repo.id,
                    branch,
                }),
            });
            if (!res.ok) {
                throw new Error(await readApiError(res, 'Unable to link this repository.'));
            }
            const linkedRepo = await res.json();
            setRepos((current) => current.map((item) => item.id === repo.id ? linkedRepo : item));
        } catch (error: any) {
            setErrorMessage(error.message || 'Unable to link this repository.');
            setRepos((current) => current.map((item) => item.id === repo.id ? { ...item, contextStatus: 'failed', contextError: error.message || 'Unable to parse repository context.' } : item));
        } finally {
            setRepoBusyIds((current) => current.filter((id) => id !== repo.id));
        }
    };

    const toggleRepo = async (repo: GithubRepository) => {
        const branch = selectedRepoBranches[repo.id] || repo.selectedBranch || repo.defaultBranch || 'main';
        const isSelected = selectedRepoIds.includes(repo.id);
        if (!isSelected && !isParsedRepo(repo)) {
            setErrorMessage(`Parse ${repo.fullName} in Integrations before using it in an assessment.`);
            return;
        }
        setSelectedRepoIds((current) =>
            isSelected
                ? current.filter((id) => id !== repo.id)
                : [...current, repo.id],
        );
        void branch;
    };

    const updateRepoBranch = (repo: GithubRepository, branch: string) => {
        setSelectedRepoBranches((current) => ({ ...current, [repo.id]: branch }));
    };

    const persistRepoBranch = async (repo: GithubRepository) => {
        if (!selectedRepoIds.includes(repo.id)) return;
        const branch = selectedRepoBranches[repo.id]?.trim() || repo.selectedBranch || repo.defaultBranch || 'main';
        await linkRepository(repo, branch);
    };

    const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setContextBusy('upload');
        setContextError(null);
        setErrorMessage(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/assessments/context/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) {
                throw new Error(await readApiError(res, 'Unable to upload job description.'));
            }
            const source = await res.json();
            setJobDescriptionSource(source);
            setJobDescriptionFileName(source.label || file.name);
            setJobDescriptionText(source.content || '');
            setJobDescriptionUrl('');
        } catch (error: any) {
            setContextError(error.message || 'Unable to upload job description.');
        } finally {
            setContextBusy(null);
        }
    };

    const fetchJobDescriptionUrl = async () => {
        if (!jobDescriptionUrl.trim()) {
            setContextError('Add a URL first.');
            return;
        }
        setContextBusy('url');
        setContextError(null);
        setErrorMessage(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/assessments/context/fetch-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ url: jobDescriptionUrl.trim() }),
            });
            if (!res.ok) {
                throw new Error(await readApiError(res, 'Unable to fetch this URL.'));
            }
            const source = await res.json();
            setJobDescriptionSource(source);
            setJobDescriptionFileName('');
            setJobDescriptionText(source.content || '');
            setJobDescriptionUrl(source.url || jobDescriptionUrl.trim());
        } catch (error: any) {
            setContextError(error.message || 'Unable to fetch this URL.');
        } finally {
            setContextBusy(null);
        }
    };

    const updateJobDescriptionText = (value: string) => {
        setJobDescriptionText(value);
        setJobDescriptionSource(null);
        setContextError(null);
    };

    const updateJobDescriptionUrl = (value: string) => {
        setJobDescriptionUrl(value);
        setJobDescriptionSource(null);
        setContextError(null);
    };

    const buildGithubReturnDraft = (returnId: string): GithubReturnDraft => ({
        id: returnId,
        expiresAt: Date.now() + githubReturnDraftTtlMs,
        mode: mode || 'new',
        step,
        prompt,
        selectedDriveId,
        selectedTemplateKey,
        repoPanelOpen: true,
        selectedRepoIds,
        selectedRepoBranches,
        manualRepoUrl,
        jobDescriptionMode,
        jobDescriptionText,
        jobDescriptionUrl,
        jobDescriptionFileName,
        jobDescriptionSource,
        companyProfileIncluded,
        roleDraft,
    });

    const connectGithub = async () => {
        if (!githubConfigured) {
            setErrorMessage(githubSetupMessage || 'GitHub App setup is required before repositories can be connected.');
            return;
        }
        setGithubConnecting(true);
        setErrorMessage(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const returnId = createGithubReturnId();
            writeGithubReturnDraft(buildGithubReturnDraft(returnId));
            const next = buildGithubReturnPath({
                mode: mode || 'new',
                step: 'context',
                panel: 'repos',
                returnId,
            });
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/install-url?next=${encodeURIComponent(next)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                throw new Error(await readApiError(res, 'Unable to start GitHub connection.'));
            }
            const payload = await res.json();
            setGithubInstallUrl(payload.installUrl || null);
            setGithubConfigured(payload.configured !== false);
            setGithubSetupMessage(payload.message || null);
            setGithubMissingConfig(Array.isArray(payload.missing) ? payload.missing : []);
            if (payload.configured === false || !payload.installUrl) {
                throw new Error(payload.message || 'GitHub App setup is required before repositories can be connected.');
            }
            window.location.href = payload.installUrl;
        } catch (error: any) {
            setErrorMessage(error.message || 'Unable to start GitHub connection.');
            setGithubConnecting(false);
        }
    };

    const openIntegrationsForRepo = () => {
        const returnId = createGithubReturnId();
        writeGithubReturnDraft(buildGithubReturnDraft(returnId));
        router.push(`/industry/integrations?returnTo=assessment&draftId=${encodeURIComponent(returnId)}`);
    };

    const nextStep = () => {
        const index = stepOrder.indexOf(step);
        if (index < stepOrder.length - 1) setStep(stepOrder[index + 1]);
    };

    const previousStep = () => {
        const index = stepOrder.indexOf(step);
        if (index > 0) setStep(stepOrder[index - 1]);
        else setMode(null);
    };

    const createRoleIfNeeded = async (token: string) => {
        if (mode !== 'new') return selectedDriveId || undefined;

        const title = roleDraft.title.trim() || inferRoleTitle(prompt);
        const description = roleDraft.description.trim() || jobDescriptionText.trim() || prompt.trim() || selectedTemplate.defaultDescription || 'Assessment-linked role created from Emble context.';
        const firstRepo = selectedRepos[0]?.htmlUrl || manualRepoUrl.trim();
        const pipelineStages = selectedTemplate.stages.map((stageItem, index) => ({
            id: `${selectedTemplate.key}-${index + 1}`,
            order: index + 1,
            name: stageItem.name,
            kind: stageItem.kind,
            description: stageItem.description,
        }));
        const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                title,
                type: roleDraft.type || selectedTemplate.defaultType || 'Full-Time',
                workMode: roleDraft.workMode || selectedTemplate.defaultWorkMode || 'Hybrid',
                description,
                jobProfile: roleDraft.jobProfile.trim() || title,
                packageOffered: roleDraft.packageOffered.trim() || 'Not disclosed',
                salaryRange: roleDraft.salaryRange.trim() || roleDraft.packageOffered.trim() || 'Not disclosed',
                roles: [roleDraft.jobProfile.trim() || selectedTemplate.name || title],
                skillsRequired: roleDraft.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
                experienceRequired: roleDraft.experienceRequired.trim() || undefined,
                openings: roleDraft.openings ? Number(roleDraft.openings) : undefined,
                applicationDeadline: roleDraft.applicationDeadline || undefined,
                applyLink: roleDraft.applyLink.trim() || undefined,
                batchEligible: roleDraft.batchEligible.trim() || undefined,
                location: roleDraft.location.trim() || 'Remote',
                githubRepositoryUrl: firstRepo || undefined,
                issueTrackerUrl: undefined,
                documentationUrl: undefined,
                workContext: roleDraft.workContext.trim() || prompt.trim() || undefined,
                pipelineNotes: roleDraft.pipelineNotes.trim() || `${selectedTemplate.name} pipeline generated from assessment context.`,
                pipelineTemplateKey: selectedTemplate.key,
                pipelineStages,
                repositoryIds: selectedRepoIds,
                automationEnabled: true,
                companyProfileIncluded,
            }),
        });

        if (!res.ok) {
            const payload = await res.json().catch(() => null);
            throw new Error(Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message || 'Unable to create role.');
        }

        const createdRole = await res.json();
        setSelectedDriveId(createdRole.id);
        return createdRole.id as string;
    };

    const generateAssessment = async () => {
        if (!prompt.trim()) {
            setErrorMessage('Describe what the assessment should test.');
            return;
        }
        if (mode === 'existing' && !selectedDriveId) {
            setErrorMessage('Choose an existing role first.');
            return;
        }

        setGenerating(true);
        setErrorMessage(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const roleId = await createRoleIfNeeded(token || '');
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/assessments/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    assessmentName: `${inferRoleTitle(prompt)} assessment`,
                    roleId,
                    mode: mode || 'standalone',
                    draftId: assessmentAutosaveDraftKey,
                    generationMode: 'balanced',
                    contextSnapshot: buildContextSnapshot(),
                    contextSources: buildContextSources(),
                    repositoryIds: selectedRepoIds,
                    timeLimitMinutes: 90,
                }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => null);
                throw new Error(Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message || 'Unable to generate assessment.');
            }

            const payload = await res.json();
            setCreated(payload);
            clearAssessmentAutosaveDraft();
        } catch (error: any) {
            setErrorMessage(error.message || 'Unable to generate assessment.');
        } finally {
            setGenerating(false);
        }
    };

    const buildContextSnapshot = () => ({
        mode,
        selectedRole: selectedDrive || null,
        roleDraft,
        selectedTemplate,
        pipelineStages: mode === 'existing'
            ? selectedDrive?.pipelineStages || []
            : selectedTemplate.stages,
        companyProfileIncluded,
        jobDescription: {
            text: jobDescriptionText,
            url: jobDescriptionUrl,
            fileName: jobDescriptionFileName,
            source: jobDescriptionSource,
        },
        repositories: selectedRepos.map((repo) => ({
            id: repo.id,
            fullName: repo.fullName,
            htmlUrl: repo.htmlUrl,
            branch: selectedRepoBranches[repo.id] || repo.selectedBranch || repo.defaultBranch,
            contextStatus: repo.contextStatus || null,
            contextSnapshot: repo.contextSnapshot || null,
        })),
        manualRepoUrl: manualRepoUrl.trim() || null,
    });

    const buildContextSources = () => {
        const sources: any[] = [];
        if (mode === 'existing' && selectedDrive) {
            sources.push({
                type: 'role',
                label: selectedDrive.title,
                content: [
                    selectedDrive.description,
                    selectedDrive.workContext ? `Role notes: ${selectedDrive.workContext}` : '',
                    selectedDrive.pipelineNotes ? `Pipeline notes: ${selectedDrive.pipelineNotes}` : '',
                ].filter(Boolean).join('\n\n'),
                metadata: {
                    ...selectedDrive,
                    pipelineStages: selectedDrive.pipelineStages || [],
                },
            });
        }
        if (mode === 'new') {
            sources.push({
                type: 'role',
                label: roleDraft.title || selectedTemplate.defaultTitle,
                content: [
                    roleDraft.description || jobDescriptionText,
                    roleDraft.workContext ? `Role notes: ${roleDraft.workContext}` : '',
                    roleDraft.pipelineNotes ? `Pipeline notes: ${roleDraft.pipelineNotes}` : '',
                ].filter(Boolean).join('\n\n'),
                metadata: {
                    draft: roleDraft,
                    templateKey: selectedTemplate.key,
                    pipelineStages: selectedTemplate.stages,
                },
            });
        }
        if (jobDescriptionText.trim() || jobDescriptionUrl.trim() || jobDescriptionFileName) {
            if (jobDescriptionSource) {
                sources.push({
                    ...jobDescriptionSource,
                    label: jobDescriptionSource.label || jobDescriptionFileName || 'Job description',
                    url: jobDescriptionSource.url || jobDescriptionUrl.trim() || undefined,
                    content: jobDescriptionText.trim() || jobDescriptionSource.content,
                    metadata: {
                        ...(jobDescriptionSource.metadata || {}),
                        mode: jobDescriptionMode,
                    },
                });
            } else {
                sources.push({
                    type: 'job_description',
                    label: jobDescriptionFileName || 'Job description',
                    url: jobDescriptionUrl.trim() || undefined,
                    content: jobDescriptionText.trim() || undefined,
                    metadata: { source: jobDescriptionMode },
                });
            }
        }
        for (const repo of selectedRepos) {
            sources.push({
                type: 'repo',
                label: repo.fullName,
                url: repo.htmlUrl,
                metadata: {
                    branch: selectedRepoBranches[repo.id] || repo.selectedBranch || repo.defaultBranch || 'main',
                    private: repo.private,
                    repositoryId: repo.id,
                    defaultBranch: repo.defaultBranch || null,
                    contextStatus: repo.contextStatus || null,
                    contextSyncedAt: repo.contextSyncedAt || null,
                    contextSnapshot: repo.contextSnapshot || null,
                },
                content: formatRepoContextForAssessment(repo),
            });
        }
        if (manualRepoUrl.trim()) {
            sources.push({ type: 'repo', label: 'Repository URL', url: manualRepoUrl.trim() });
        }
        if (companyProfileIncluded) {
            sources.push({ type: 'company_profile', label: 'Company profile', metadata: { inherited: true } });
        }
        return sources;
    };

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2 size={28} className="animate-spin text-emerald-900" />
            </div>
        );
    }

    if (!mode) {
        return (
            <div className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center pt-8">
                <h1 className="mb-10 text-center font-mono text-[32px] font-semibold tracking-tight text-black">
                    Let's build something.
                </h1>

                <div className="w-full rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-black/5">
                    <textarea
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        className="min-h-[140px] w-full resize-none border-0 bg-transparent px-4 py-3 text-[15px] leading-relaxed text-black outline-none placeholder:text-neutral-400"
                        placeholder="What assessment would you like to create? e.g. A senior frontend engineer test focused on React performance..."
                    />
                    <div className="mt-2 flex items-center justify-between border-t border-neutral-100 px-2 pt-3 pb-1">
                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={openExistingRolePicker} className="inline-flex h-9 items-center gap-2 rounded-lg bg-neutral-100 px-4 text-[13px] font-medium text-neutral-700 hover:bg-neutral-200 hover:text-black transition-colors">
                                <BriefcaseBusiness size={15} />
                                Existing role
                            </button>
                            <button type="button" onClick={() => beginFlow('new')} className="inline-flex h-9 items-center gap-2 rounded-lg bg-neutral-100 px-4 text-[13px] font-medium text-neutral-700 hover:bg-neutral-200 hover:text-black transition-colors">
                                <Plus size={15} />
                                New role
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => (drives.length ? openExistingRolePicker() : beginFlow('new'))}
                            className="inline-flex h-9 items-center justify-center rounded-lg bg-black px-4 text-[13px] font-semibold text-white transition-colors hover:bg-neutral-800"
                        >
                            Continue
                            <Send size={14} className="ml-2" />
                        </button>
                    </div>
                </div>
                {errorMessage ? <p className="mt-4 w-full text-center text-sm font-medium text-rose-600">{errorMessage}</p> : null}
                {rolePickerOpen ? (
                    <RolePickerModal
                        drives={filteredDrives}
                        search={roleSearch}
                        setSearch={setRoleSearch}
                        onClose={() => setRolePickerOpen(false)}
                        onCreateNew={() => {
                            setRolePickerOpen(false);
                            beginFlow('new');
                        }}
                        onSelect={selectExistingRole}
                    />
                ) : null}
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl pb-14 pt-6">
            <Stepper activeStep={step} />

            {created ? (
                <section className="mt-8">
                    <p className="font-mono text-2xl font-semibold tracking-tight text-black">Assessment created</p>
                    <div className="mt-6 rounded-[14px] border border-neutral-200 bg-white p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900">
                                    <Check size={17} /> Saved draft
                                </div>
                                <h2 className="mt-3 text-xl font-semibold text-black">{created.name}</h2>
                                <p className="mt-2 text-sm leading-6 text-neutral-600">
                                    {created.instructions || 'The assessment is ready for candidate invites.'}
                                </p>
                            </div>
                            <Link href={selectedDriveId ? `/industry/drives/${selectedDriveId}/ats` : '/industry/assessments'} className="rounded-lg bg-emerald-950 px-4 py-2 text-sm font-semibold text-white">
                                Open
                            </Link>
                        </div>
                    </div>
                </section>
            ) : (
                <>
                    {step === 'context' ? (
                        <section className="mt-8">
                            <h1 className="text-[25px] font-semibold tracking-tight text-black">Tell us about this role</h1>
                            <p className="mt-2 text-sm text-neutral-600">Context you add here helps us build your posting. Optional now, editable anytime.</p>

                            <PromptPanel prompt={prompt} setPrompt={setPrompt} mode={mode} selectedDrive={selectedDrive} selectedTemplate={selectedTemplate} />

                            <div className="mt-6 text-xs font-medium text-neutral-700">Add context</div>
                            <div className="mt-3 overflow-hidden rounded-[14px] border border-neutral-200 bg-white">
                                <ContextRow icon={<ClipboardList size={19} />} title="ATS job" subtitle="Integration not connected yet" action="Phase 2" disabled />
                                <button type="button" onClick={() => setJobDescriptionMode('paste')} className="flex w-full items-center justify-between border-t border-neutral-200 px-4 py-4 text-left hover:bg-neutral-50">
                                    <span className="flex items-center gap-4">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700"><FileText size={18} /></span>
                                        <span>
                                            <span className="block text-sm font-semibold text-black">Job description</span>
                                            <span className="block text-xs text-neutral-600">Paste, upload, or link a URL</span>
                                        </span>
                                    </span>
                                    <ChevronRight size={18} className="text-neutral-500" />
                                </button>
                                <div onClick={() => setRepoPanelOpen((value) => !value)} className="flex w-full cursor-pointer items-center justify-between border-t border-neutral-200 px-4 py-4 text-left hover:bg-neutral-50">
                                    <span className="flex items-center gap-4">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700"><Code2 size={18} /></span>
                                        <span>
                                            <span className="block text-sm font-semibold text-black">Repos</span>
                                            <span className="block text-xs text-neutral-600">Codebase context for assessments</span>
                                        </span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={(event) => { event.stopPropagation(); openIntegrationsForRepo(); }}
                                        className="text-xs font-medium text-neutral-700 hover:text-black disabled:cursor-not-allowed disabled:text-neutral-400"
                                    >
                                        Link repo
                                    </button>
                                </div>
                            </div>

                            {repoPanelOpen ? (
                                <RepositoryContextPanel
                                    repos={repos}
                                    selectedRepoIds={selectedRepoIds}
                                    selectedRepoBranches={selectedRepoBranches}
                                    repoBusyIds={repoBusyIds}
                                    manualRepoUrl={manualRepoUrl}
                                    githubConfigured={githubConfigured}
                                    githubInstallUrl={githubInstallUrl}
                                    githubConnecting={githubConnecting}
                                    githubRepoSyncing={githubRepoSyncing}
                                    githubRepoSyncError={githubRepoSyncError}
                                    githubSetupMessage={githubSetupMessage}
                                    githubMissingConfig={githubMissingConfig}
                                    onOpenIntegrations={openIntegrationsForRepo}
                                    onToggleRepo={toggleRepo}
                                    onUpdateBranch={updateRepoBranch}
                                    onPersistBranch={persistRepoBranch}
                                    setManualRepoUrl={setManualRepoUrl}
                                />
                            ) : null}

                            <div className="mt-5 text-xs font-medium text-neutral-700">Attached - {attachedCount}</div>
                            <div className="mt-3 flex items-center justify-between rounded-[14px] border border-neutral-200 bg-neutral-50 px-4 py-3">
                                <span className="flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dde6da] text-emerald-950"><Building2 size={17} /></span>
                                    <span className="text-sm font-semibold text-black">Company profile</span>
                                </span>
                                <button type="button" onClick={() => setCompanyProfileIncluded((value) => !value)} className={`relative h-7 w-12 rounded-full transition ${companyProfileIncluded ? 'bg-emerald-950' : 'bg-neutral-300'}`}>
                                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${companyProfileIncluded ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>

                            <JobDescriptionPanel
                                mode={jobDescriptionMode}
                                setMode={setJobDescriptionMode}
                                text={jobDescriptionText}
                                setText={updateJobDescriptionText}
                                url={jobDescriptionUrl}
                                setUrl={updateJobDescriptionUrl}
                                fileName={jobDescriptionFileName}
                                onUpload={handleFileUpload}
                                onFetchUrl={fetchJobDescriptionUrl}
                                loading={contextBusy}
                                error={contextError}
                            />

                            {mode === 'existing' ? (
                                <ExistingRoleContextCard selectedDrive={selectedDrive} onChangeRole={openExistingRolePicker} />
                            ) : (
                                <NewRoleFields roleDraft={roleDraft} setRoleDraft={setRoleDraft} selectedTemplate={selectedTemplate} jobDescriptionText={jobDescriptionText} />
                            )}
                        </section>
                    ) : null}

                    {step === 'pipeline' ? (
                        <section className="mt-8">
                            <h1 className="text-[25px] font-semibold tracking-tight text-black">How do you want to build the pipeline?</h1>
                            <p className="mt-2 text-sm text-neutral-600">{mode === 'existing' ? 'This role already has a pipeline. We will attach the assessment to that role.' : 'Pick a template or start fresh. These stages become the new role pipeline.'}</p>

                            {mode === 'existing' ? (
                                <ExistingPipelinePanel selectedDrive={selectedDrive} />
                            ) : (
                                <PipelineTemplateChooser
                                    templates={templates}
                                    selectedTemplateKey={selectedTemplateKey}
                                    onSelectTemplate={(template) => applyTemplateToDraft(template, true)}
                                />
                            )}
                        </section>
                    ) : null}

                    {step === 'review' ? (
                        <section className="mt-8">
                            <h1 className="text-[25px] font-semibold tracking-tight text-black">Review and create</h1>
                            <p className="mt-2 text-sm text-neutral-600">{mode === 'existing' ? 'We will generate a reusable assessment and attach it to this role.' : 'Details are inferred from your context. Everything here is editable before the role is created.'}</p>

                            <ReviewCreatePanel
                                mode={mode}
                                selectedDrive={selectedDrive}
                                roleDraft={roleDraft}
                                setRoleDraft={setRoleDraft}
                                selectedTemplate={selectedTemplate}
                                prompt={prompt}
                                jobDescriptionText={jobDescriptionText}
                                repos={[...selectedRepos.map((repo) => repo.fullName), manualRepoUrl].filter(Boolean)}
                                companyProfileIncluded={companyProfileIncluded}
                            />
                        </section>
                    ) : null}

                    {errorMessage ? <p className="mt-5 text-sm font-semibold text-rose-600">{errorMessage}</p> : null}

                    <div className="mt-8 flex items-center justify-between">
                        <button type="button" onClick={previousStep} className="px-4 py-2 text-sm font-semibold text-black">Back</button>
                        {step === 'review' ? (
                            <button type="button" onClick={generateAssessment} disabled={generating} className="inline-flex items-center gap-2 rounded-lg bg-emerald-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                                {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                Generate assessment
                            </button>
                        ) : (
                            <button type="button" onClick={nextStep} className="rounded-lg bg-emerald-950 px-5 py-3 text-sm font-semibold text-white">Continue -&gt;</button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function Stepper({ activeStep }: { activeStep: WizardStep }) {
    const labels: Record<WizardStep, string> = { context: 'Context', pipeline: 'Pipeline', review: 'Review' };
    const activeIndex = stepOrder.indexOf(activeStep);
    return (
        <div className="mx-auto flex max-w-[520px] items-start justify-center gap-4 pt-5">
            {stepOrder.map((step, index) => (
                <div key={step} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold ${index <= activeIndex ? 'border-[#d8e1d4] bg-emerald-950 text-white' : 'border-neutral-200 bg-white text-neutral-500'}`}>
                            {index + 1}
                        </div>
                        <span className={`mt-2 text-xs ${index <= activeIndex ? 'font-semibold text-black' : 'text-neutral-500'}`}>{labels[step]}</span>
                    </div>
                    {index < stepOrder.length - 1 ? <div className="mt-5 h-px w-32 bg-neutral-200" /> : null}
                </div>
            ))}
        </div>
    );
}

function ContextRow({ icon, title, subtitle, action, disabled }: { icon: React.ReactNode; title: string; subtitle: string; action: string; disabled?: boolean }) {
    return (
        <div className="flex items-center justify-between px-4 py-4">
            <span className="flex items-center gap-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">{icon}</span>
                <span>
                    <span className="block text-sm font-semibold text-black">{title}</span>
                    <span className="block text-xs text-neutral-600">{subtitle}</span>
                </span>
            </span>
            <span className={`text-xs font-medium ${disabled ? 'text-neutral-500' : 'text-neutral-900'}`}>{action}</span>
        </div>
    );
}

function JobDescriptionPanel(props: {
    mode: 'paste' | 'upload' | 'url';
    setMode: (mode: 'paste' | 'upload' | 'url') => void;
    text: string;
    setText: (value: string) => void;
    url: string;
    setUrl: (value: string) => void;
    fileName: string;
    onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
    onFetchUrl: () => void;
    loading: 'upload' | 'url' | null;
    error: string | null;
}) {
    return (
        <div className="mt-6">
            <h2 className="text-lg font-semibold text-black">Add a job description</h2>
            <div className="mt-4 inline-flex overflow-hidden rounded-lg border border-neutral-200 bg-white">
                {(['paste', 'upload', 'url'] as const).map((mode) => (
                    <button key={mode} type="button" onClick={() => props.setMode(mode)} className={`px-4 py-2 text-sm font-medium ${props.mode === mode ? 'bg-neutral-100 text-black' : 'text-neutral-600'}`}>
                        {mode === 'paste' ? 'Paste text' : mode === 'upload' ? 'Upload a file' : 'Fetch a URL'}
                    </button>
                ))}
            </div>
            {props.mode === 'paste' ? (
                <textarea value={props.text} onChange={(event) => props.setText(event.target.value)} className="mt-4 min-h-[70px] w-full rounded-[10px] border border-[#8fc58e] px-4 py-3 text-sm outline-none ring-2 ring-[#8fc58e]/30" placeholder="Paste the job description here..." />
            ) : null}
            {props.mode === 'upload' ? (
                <div className="mt-4">
                    <label className="flex cursor-pointer items-center justify-between rounded-[10px] border border-dashed border-neutral-300 px-4 py-5 text-sm text-neutral-700 hover:bg-neutral-50">
                        <span className="inline-flex items-center gap-2">
                            {props.loading === 'upload' ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}
                            {props.fileName || 'Upload txt, md, or pdf'}
                        </span>
                        <input type="file" accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf" className="hidden" onChange={props.onUpload} disabled={props.loading === 'upload'} />
                    </label>
                </div>
            ) : null}
            {props.mode === 'url' ? (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input value={props.url} onChange={(event) => props.setUrl(event.target.value)} className="w-full rounded-[10px] border border-[#8fc58e] px-4 py-3 text-sm outline-none ring-2 ring-[#8fc58e]/30" placeholder="https://company.com/jobs/product-engineer" />
                    <button type="button" onClick={props.onFetchUrl} disabled={props.loading === 'url'} className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-emerald-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
                        {props.loading === 'url' ? <Loader2 size={16} className="animate-spin" /> : null}
                        Fetch
                    </button>
                </div>
            ) : null}
            {props.error ? <p className="mt-3 text-sm font-semibold text-rose-600">{props.error}</p> : null}
            {props.text && props.mode !== 'paste' ? (
                <div className="mt-3 rounded-[10px] border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs leading-5 text-neutral-600">
                    {props.text.slice(0, 260)}{props.text.length > 260 ? '...' : ''}
                </div>
            ) : null}
        </div>
    );
}

function PromptPanel({ prompt, setPrompt, mode, selectedDrive, selectedTemplate }: { prompt: string; setPrompt: (value: string) => void; mode: FlowMode; selectedDrive: CompanyDrive | null; selectedTemplate: HiringRoleTemplate }) {
    const hint = mode === 'existing'
        ? `Example: Create a TypeScript interview for ${selectedDrive?.title || 'this role'} focused on production debugging and code quality.`
        : `Example: Create an interview for a ${selectedTemplate.defaultTitle} focused on ${selectedTemplate.defaultSkills.slice(0, 3).join(', ')}.`;

    return (
        <div className="mt-6 rounded-[14px] border border-neutral-200 bg-white p-4">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Assessment prompt</label>
            <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="mt-3 min-h-[92px] w-full resize-y rounded-[10px] border border-neutral-200 px-4 py-3 text-sm leading-6 text-black outline-none focus:border-emerald-900"
                placeholder={hint}
            />
        </div>
    );
}

function RolePickerModal({
    drives,
    search,
    setSearch,
    onClose,
    onCreateNew,
    onSelect,
}: {
    drives: CompanyDrive[];
    search: string;
    setSearch: (value: string) => void;
    onClose: () => void;
    onCreateNew: () => void;
    onSelect: (drive: CompanyDrive) => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between px-4 py-4">
                    <h2 className="text-base font-semibold text-black">Select a role</h2>
                    <button type="button" onClick={onClose} className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-black" aria-label="Close role selector">
                        <X size={18} />
                    </button>
                </div>
                <div className="flex items-center gap-2 border-y border-neutral-200 px-4 py-2">
                    <Search size={17} className="text-neutral-400" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 flex-1 border-0 text-sm outline-none placeholder:text-neutral-400" placeholder="Search roles..." autoFocus />
                </div>
                <div className="max-h-64 overflow-auto p-2">
                    {drives.length ? drives.map((drive) => {
                        const assessments = (drive.pipelineStages || []).filter((stage) => stage.kind === 'assessment').length;
                        return (
                            <button key={drive.id} type="button" onClick={() => onSelect(drive)} className="group flex w-full items-center justify-between rounded-[10px] px-3 py-3 text-left hover:bg-[#8fc58e]">
                                <span className="flex min-w-0 items-center gap-3">
                                    <BriefcaseBusiness size={17} className="shrink-0 text-neutral-500 group-hover:text-neutral-700" />
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-medium text-black">{drive.title}</span>
                                        {drive.jobProfile || drive.location ? (
                                            <span className="block truncate text-xs text-neutral-500 group-hover:text-neutral-700">{drive.jobProfile || drive.location}</span>
                                        ) : null}
                                    </span>
                                </span>
                                <span className="text-xs text-neutral-500 group-hover:text-neutral-700">{assessments || 1} assessment{assessments === 1 ? '' : 's'}</span>
                            </button>
                        );
                    }) : (
                        <div className="px-4 py-8 text-center text-sm text-neutral-500">No roles found</div>
                    )}
                </div>
                <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3">
                    <span className="text-sm text-neutral-500">Need a new one?</span>
                    <button type="button" onClick={onCreateNew} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-50">
                        <Plus size={15} />
                        Create new role
                    </button>
                </div>
            </div>
        </div>
    );
}

function ExistingRoleContextCard({ selectedDrive, onChangeRole }: { selectedDrive: CompanyDrive | null; onChangeRole: () => void }) {
    if (!selectedDrive) return null;
    const contextItems = [
        selectedDrive.description ? 'Job description' : null,
        selectedDrive.githubRepositoryUrl ? 'Repo URL' : null,
        selectedDrive.documentationUrl ? 'Docs' : null,
        selectedDrive.workContext ? 'Role notes' : null,
    ].filter(Boolean);

    return (
        <div className="mt-8 rounded-[14px] border border-neutral-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Existing role context</p>
                    <h2 className="mt-2 text-lg font-semibold text-black">{selectedDrive.title}</h2>
                    <p className="mt-1 text-sm text-neutral-600">{selectedDrive.jobProfile || selectedDrive.companyName || 'Role context pulled from your drive.'}</p>
                </div>
                <button type="button" onClick={onChangeRole} className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">Change</button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                {contextItems.length ? contextItems.map((item) => (
                    <span key={item} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">{item}</span>
                )) : <span className="text-sm text-neutral-500">No saved context yet. Add details above.</span>}
            </div>
        </div>
    );
}

function RepositoryContextPanel(props: {
    repos: GithubRepository[];
    selectedRepoIds: string[];
    selectedRepoBranches: Record<string, string>;
    repoBusyIds: string[];
    manualRepoUrl: string;
    githubConfigured: boolean;
    githubInstallUrl: string | null;
    githubConnecting: boolean;
    githubRepoSyncing: boolean;
    githubRepoSyncError: string | null;
    githubSetupMessage: string | null;
    githubMissingConfig: string[];
    onOpenIntegrations: () => void;
    onToggleRepo: (repo: GithubRepository) => void;
    onUpdateBranch: (repo: GithubRepository, branch: string) => void;
    onPersistBranch: (repo: GithubRepository) => void;
    setManualRepoUrl: (value: string) => void;
}) {
    return (
        <div className="mt-4 rounded-[14px] border border-neutral-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-sm font-semibold text-black">
                    <Github size={18} /> Repository context
                </div>
                <button type="button" onClick={props.onOpenIntegrations} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-950 px-4 py-2 text-sm font-semibold text-white">
                    Manage in Integrations
                </button>
            </div>
            {!props.githubConfigured ? (
                <div className="border-b border-neutral-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                    {props.githubSetupMessage || 'GitHub App env config is missing.'}
                    {props.githubMissingConfig.length ? <span className="mt-1 block font-mono text-xs">Missing: {props.githubMissingConfig.join(', ')}</span> : null}
                </div>
            ) : null}
            {props.githubRepoSyncing ? (
                <div className="flex items-center gap-2 border-b border-neutral-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                    <Loader2 size={15} className="animate-spin" />
                    Syncing repositories from GitHub...
                </div>
            ) : null}
            {props.githubRepoSyncError ? (
                <div className="border-b border-neutral-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {props.githubRepoSyncError}
                </div>
            ) : null}
            {props.repos.length ? (
                <div className="divide-y divide-neutral-200">
                    {props.repos.map((repo) => {
                        const busy = props.repoBusyIds.includes(repo.id);
                        const branch = props.selectedRepoBranches[repo.id] || repo.selectedBranch || repo.defaultBranch || 'main';
                        const summary = summarizeRepoContext(repo);
                        const parsed = isParsedRepo(repo);
                        return (
                            <label key={repo.id} className="flex cursor-pointer flex-col gap-3 px-4 py-3 hover:bg-neutral-50 sm:flex-row sm:items-center sm:justify-between">
                                <span className="min-w-0">
                                    <span className="flex items-center gap-2 text-sm font-semibold text-black">
                                        {repo.fullName}
                                        {busy ? <Loader2 size={14} className="animate-spin text-emerald-800" /> : null}
                                    </span>
                                    <span className="block text-xs text-neutral-500">{branch} - {repo.private ? 'private' : 'public'} - read-only</span>
                                    <span className={`mt-1 block text-xs ${repo.contextStatus === 'failed' ? 'text-rose-600' : parsed ? 'text-emerald-700' : 'text-neutral-500'}`}>
                                        {summary}
                                    </span>
                                </span>
                                <span className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                                    {props.selectedRepoIds.includes(repo.id) ? (
                                        <input value={branch} onClick={(event) => event.stopPropagation()} onChange={(event) => props.onUpdateBranch(repo, event.target.value)} onBlur={() => props.onPersistBranch(repo)} className="h-9 w-36 rounded-lg border border-neutral-200 px-3 font-mono text-xs text-neutral-800 outline-none focus:border-emerald-800" aria-label={`Branch for ${repo.fullName}`} />
                                    ) : null}
                                    {parsed ? (
                                        <input type="checkbox" checked={props.selectedRepoIds.includes(repo.id)} onChange={() => props.onToggleRepo(repo)} disabled={busy} className="h-4 w-4 accent-emerald-950 disabled:opacity-50" />
                                    ) : (
                                        <button type="button" onClick={(event) => { event.preventDefault(); props.onOpenIntegrations(); }} className="rounded-lg bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-200">
                                            Parse in Integrations
                                        </button>
                                    )}
                                </span>
                            </label>
                        );
                    })}
                </div>
            ) : (
                <div className="px-4 py-8 text-center text-sm text-neutral-500">
                    {props.githubRepoSyncing
                        ? 'Waiting for GitHub repositories...'
                        : props.githubRepoSyncError
                            ? 'Repository sync failed. Try installing or updating GitHub access again.'
                            : props.githubConfigured
                                ? 'No linked repositories yet. Add and parse repositories from Integrations.'
                                : 'GitHub setup is required before repositories can appear here.'}
                </div>
            )}
            <div className="border-t border-neutral-200 px-4 py-4">
                <label className="text-xs font-medium text-neutral-700">Or paste a repository URL</label>
                <input value={props.manualRepoUrl} onChange={(event) => props.setManualRepoUrl(event.target.value)} className="mt-2 w-full rounded-[12px] border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-emerald-800" placeholder="https://github.com/acme/product" />
            </div>
        </div>
    );
}

function NewRoleFields({ roleDraft, setRoleDraft, selectedTemplate, jobDescriptionText }: { roleDraft: RoleDraft; setRoleDraft: (value: any) => void; selectedTemplate: HiringRoleTemplate; jobDescriptionText: string }) {
    const update = (field: keyof RoleDraft, value: string) => setRoleDraft((current: RoleDraft) => ({ ...current, [field]: value }));
    return (
        <div className="mt-8 rounded-[14px] border border-neutral-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">New role context</p>
                    <h2 className="mt-2 text-lg font-semibold text-black">{roleDraft.title || selectedTemplate.defaultTitle}</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{selectedTemplate.name}</span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <LabeledInput label="Role title" value={roleDraft.title} onChange={(value) => update('title', value)} placeholder={selectedTemplate.defaultTitle} />
                <LabeledInput label="Team" value={roleDraft.jobProfile} onChange={(value) => update('jobProfile', value)} placeholder={selectedTemplate.defaultJobProfile} />
                <LabeledInput label="Skills" value={roleDraft.skills} onChange={(value) => update('skills', value)} placeholder={selectedTemplate.defaultSkills.join(', ')} />
                <LabeledInput label="Location" value={roleDraft.location} onChange={(value) => update('location', value)} placeholder="Remote, Bengaluru, or hybrid" />
            </div>
            <label className="mt-4 block">
                <span className="mb-2 block text-sm font-semibold text-neutral-800">Role notes</span>
                <textarea value={roleDraft.workContext} onChange={(event) => update('workContext', event.target.value)} className="min-h-[92px] w-full rounded-[10px] border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-emerald-900" placeholder={jobDescriptionText ? 'Add product, codebase, or team context not in the job description.' : selectedTemplate.defaultDescription} />
            </label>
        </div>
    );
}

function PipelineTemplateChooser({ templates, selectedTemplateKey, onSelectTemplate }: { templates: HiringRoleTemplate[]; selectedTemplateKey: string; onSelectTemplate: (template: HiringRoleTemplate) => void }) {
    const customActive = selectedTemplateKey === freshTemplate.key;
    return (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <button type="button" onClick={() => onSelectTemplate(freshTemplate)} className={`rounded-[14px] border border-dashed p-5 text-left hover:bg-neutral-50 ${customActive ? 'border-emerald-300 bg-emerald-50' : 'border-neutral-300 bg-white'}`}>
                <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500"><Plus size={20} /></span>
                    <span>
                        <span className="block text-sm font-semibold text-black">Start fresh</span>
                        <span className="mt-1 block text-xs text-neutral-500">Empty pipeline, add stages yourself</span>
                    </span>
                </div>
            </button>
            {templates.map((template) => {
                const active = template.key === selectedTemplateKey;
                const assessmentCount = template.stages.filter((stage) => stage.kind === 'assessment').length;
                return (
                    <button key={template.key} type="button" onClick={() => onSelectTemplate(template)} className={`rounded-[14px] border p-5 text-left transition ${active ? 'border-emerald-200 bg-emerald-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
                        <div className="flex items-start gap-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800"><Code2 size={19} /></span>
                            <span>
                                <span className="block text-sm font-semibold text-black">{template.name}</span>
                                <span className="mt-1 block text-xs text-neutral-500">{template.subtitle}</span>
                                <span className="mt-3 block text-xs text-neutral-500">{template.stages.length} stages - {assessmentCount} assessment{assessmentCount === 1 ? '' : 's'}</span>
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

function ExistingPipelinePanel({ selectedDrive }: { selectedDrive: CompanyDrive | null }) {
    const stages = selectedDrive?.pipelineStages?.length ? selectedDrive.pipelineStages : [
        { name: 'Take-home assessment', kind: 'assessment', description: 'Assessment generated from role context' },
        { name: 'Review', kind: 'step', description: 'Hiring team review' },
    ];
    return (
        <div className="mt-6 space-y-3">
            {stages.map((stage, index) => (
                <div key={`${stage.name}-${index}`} className="flex items-center justify-between rounded-[12px] border border-neutral-200 bg-white px-4 py-3">
                    <span>
                        <span className="block text-sm font-semibold text-black">{index + 1}. {stage.name}</span>
                        {stage.description ? <span className="mt-1 block text-xs text-neutral-500">{stage.description}</span> : null}
                    </span>
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">{stage.kind}</span>
                </div>
            ))}
        </div>
    );
}

function ReviewCreatePanel(props: {
    mode: FlowMode;
    selectedDrive: CompanyDrive | null;
    roleDraft: RoleDraft;
    setRoleDraft: (value: any) => void;
    selectedTemplate: HiringRoleTemplate;
    prompt: string;
    jobDescriptionText: string;
    repos: string[];
    companyProfileIncluded: boolean;
}) {
    const update = (field: keyof RoleDraft, value: string) => props.setRoleDraft((current: RoleDraft) => ({ ...current, [field]: value }));
    const stages = props.mode === 'existing' ? props.selectedDrive?.pipelineStages || [] : props.selectedTemplate.stages;

    return (
        <div className="mt-6 space-y-5">
            {props.mode === 'new' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <LabeledInput label="Title *" value={props.roleDraft.title} onChange={(value) => update('title', value)} placeholder="Title" />
                    <LabeledInput label="Team" value={props.roleDraft.jobProfile} onChange={(value) => update('jobProfile', value)} placeholder="Team" />
                    <LabeledInput label="Location" value={props.roleDraft.location} onChange={(value) => update('location', value)} placeholder="Location" />
                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-neutral-800">Employment</span>
                        <select value={props.roleDraft.type} onChange={(event) => update('type', event.target.value)} className="h-10 w-full rounded-[10px] border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-900">
                            <option value="Full-Time">Full Time</option>
                            <option value="Internship">Internship</option>
                            <option value="Contract">Contract</option>
                            <option value="Part-Time">Part Time</option>
                        </select>
                    </label>
                    <LabeledInput label="Compensation" value={props.roleDraft.packageOffered} onChange={(value) => update('packageOffered', value)} placeholder="Not disclosed" />
                    <LabeledInput label="Experience" value={props.roleDraft.experienceRequired} onChange={(value) => update('experienceRequired', value)} placeholder={props.selectedTemplate.defaultExperience} />
                </div>
            ) : (
                <div className="rounded-[14px] border border-neutral-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Selected role</p>
                    <h2 className="mt-2 text-lg font-semibold text-black">{props.selectedDrive?.title || 'Existing role'}</h2>
                    <p className="mt-1 text-sm text-neutral-600">{props.selectedDrive?.jobProfile || 'Assessment will attach to this role.'}</p>
                </div>
            )}

            <div className="rounded-[14px] border border-neutral-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Context</p>
                <ReviewLine label="Prompt" value={props.prompt || 'No prompt added'} />
                <ReviewLine label="Job description" value={props.jobDescriptionText ? 'Added' : 'Missing'} />
                <ReviewLine label="Repos" value={props.repos.join(', ') || 'None'} />
                <ReviewLine label="Company profile" value={props.companyProfileIncluded ? 'Inherited' : 'Not included'} />
            </div>

            <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Pipeline</p>
                {stages.map((stage, index) => (
                    <div key={`${stage.name}-${index}`} className="flex items-center justify-between rounded-[10px] border border-neutral-200 bg-white px-4 py-3">
                        <span className="text-sm font-semibold text-black">{index + 1}. {stage.name}</span>
                        <span className="text-xs text-neutral-500">{stage.kind === 'assessment' ? 'assessment - author later' : 'step'}</span>
                    </div>
                ))}
                {!stages.length ? (
                    <div className="rounded-[10px] border border-dashed border-neutral-300 bg-white px-4 py-5 text-sm font-medium text-neutral-500">
                        No stages yet. The role will open in ATS with an empty pipeline you can build.
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function LabeledInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-neutral-800">{label}</span>
            <input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-[10px] border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-900" placeholder={placeholder} />
        </label>
    );
}

function ReviewLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="mt-3 flex items-start justify-between gap-5 border-t border-neutral-100 pt-3 first:border-t-0 first:pt-0">
            <span className="text-sm font-medium text-neutral-500">{label}</span>
            <span className="max-w-[420px] text-right text-sm font-semibold text-black">{value}</span>
        </div>
    );
}

function normalizeFlowMode(value: string | null): FlowMode {
    return value === 'existing' || value === 'new' ? value : null;
}

function normalizeWizardStep(value: string | null): WizardStep | null {
    return value === 'context' || value === 'pipeline' || value === 'review' ? value : null;
}

function createGithubReturnId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function githubReturnDraftKey(id: string) {
    return `${githubReturnDraftPrefix}${id}`;
}

function writeGithubReturnDraft(draft: GithubReturnDraft) {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.setItem(githubReturnDraftKey(draft.id), JSON.stringify(draft));
    } catch {
        // If storage is unavailable, the URL fallback still opens the repo context step.
    }
}

function readGithubReturnDraft(id: string): GithubReturnDraft | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(githubReturnDraftKey(id));
        if (!raw) return null;
        const draft = JSON.parse(raw) as GithubReturnDraft;
        if (!draft?.id || draft.expiresAt < Date.now()) {
            sessionStorage.removeItem(githubReturnDraftKey(id));
            return null;
        }
        return draft;
    } catch {
        return null;
    }
}

function writeAssessmentAutosaveDraft(draft: Omit<GithubReturnDraft, 'id' | 'expiresAt'> & { updatedAt: number }) {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.setItem(assessmentAutosaveDraftKey, JSON.stringify(draft));
    } catch {
        // Draft recovery is helpful, but storage failures should not block editing.
    }
}

function readAssessmentAutosaveDraft(): (Omit<GithubReturnDraft, 'id' | 'expiresAt'> & { updatedAt: number }) | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(assessmentAutosaveDraftKey);
        if (!raw) return null;
        const draft = JSON.parse(raw) as Omit<GithubReturnDraft, 'id' | 'expiresAt'> & { updatedAt: number };
        if (!draft?.updatedAt || Date.now() - draft.updatedAt > 24 * 60 * 60 * 1000) {
            sessionStorage.removeItem(assessmentAutosaveDraftKey);
            return null;
        }
        return draft;
    } catch {
        return null;
    }
}

function clearAssessmentAutosaveDraft() {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.removeItem(assessmentAutosaveDraftKey);
    } catch {
        // Ignore storage cleanup failures.
    }
}

function buildGithubReturnPath(input: {
    mode: FlowMode;
    step: WizardStep;
    panel: 'repos';
    returnId: string;
}) {
    const params = new URLSearchParams({
        flow: input.mode || 'new',
        step: input.step,
        panel: input.panel,
        githubReturnId: input.returnId,
    });
    return `/industry/assessments/new?${params.toString()}`;
}

function applyRequestedRepoSelection(
    repos: GithubRepository[],
    searchParams: URLSearchParams,
    setSelectedRepoIds: (updater: (current: string[]) => string[]) => void,
    setRepoPanelOpen: (value: boolean) => void,
) {
    const repoId = searchParams.get('repoId');
    const repo = repos.find((item) => item.id === repoId);
    if (!repoId || !repo || !isParsedRepo(repo)) return;
    setSelectedRepoIds((current) => current.includes(repoId) ? current : [...current, repoId]);
    setRepoPanelOpen(true);
}

function summarizeRepoContext(repo: GithubRepository) {
    if (repo.contextStatus === 'syncing') return 'Parsing repository context...';
    if (repo.contextStatus === 'failed') return repo.contextError || 'Repository linked, context parsing failed.';

    const snapshot = repo.contextSnapshot || {};
    const tree = snapshot.tree || {};
    const intelligence = snapshot.repoIntelligence as { stackSummary?: string } | undefined;
    const language = snapshot.primaryLanguage;
    const fileCount = typeof tree.totalFiles === 'number' ? `${tree.totalFiles} files` : '';
    const manifestCount = Array.isArray(snapshot.manifests) ? snapshot.manifests.length : 0;
    const readme = snapshot.readme?.content ? 'README' : '';
    const parts = [language, fileCount, readme, manifestCount ? `${manifestCount} project files` : ''].filter(Boolean);

    if (isParsedRepo(repo) && intelligence?.stackSummary) {
        return `Parsed: ${intelligence.stackSummary}`;
    }
    if (isParsedRepo(repo) && parts.length) {
        return `Parsed: ${parts.join(' - ')}`;
    }
    if (repo.isLinked) return 'Linked. Select again or change branch to refresh context.';
    return 'Install app, then select this repo to parse context.';
}

function isParsedRepo(repo: GithubRepository) {
    return Boolean(repo.contextSnapshot) && (repo.contextStatus === 'parsed' || repo.contextStatus === 'ready');
}

function formatRepoContextForAssessment(repo: GithubRepository) {
    const snapshot = repo.contextSnapshot || {};
    const tree = snapshot.tree || {};
    const languages = snapshot.languages
        ? Object.entries(snapshot.languages as Record<string, number>)
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .slice(0, 8)
            .map(([language, bytes]) => `${language} (${bytes} bytes)`)
            .join(', ')
        : '';
    const topExtensions = Array.isArray(tree.topExtensions)
        ? tree.topExtensions.slice(0, 10).map((item: any) => `${item.extension}: ${item.count}`).join(', ')
        : '';
    const importantPaths = Array.isArray(tree.importantPaths)
        ? tree.importantPaths.slice(0, 80).join('\n')
        : '';
    const readme = snapshot.readme?.content
        ? `README (${snapshot.readme.path || 'README'}${snapshot.readme.truncated ? ', truncated' : ''}):\n${snapshot.readme.content}`
        : '';
    const manifests = Array.isArray(snapshot.manifests)
        ? snapshot.manifests
            .filter((file: any) => file?.content)
            .map((file: any) => `### ${file.path}${file.truncated ? ' (truncated)' : ''}\n${file.content}`)
            .join('\n\n')
        : '';
    const intelligence = snapshot.repoIntelligence || {};

    return [
        `Repository: ${repo.fullName}`,
        `URL: ${repo.htmlUrl}`,
        `Branch: ${repo.selectedBranch || repo.defaultBranch || 'main'}`,
        repo.contextStatus ? `Context status: ${repo.contextStatus}` : '',
        languages ? `Languages: ${languages}` : '',
        Array.isArray(snapshot.topics) && snapshot.topics.length ? `Topics: ${snapshot.topics.join(', ')}` : '',
        typeof tree.totalFiles === 'number' ? `Tree summary: ${tree.totalFiles} files, ${tree.totalDirectories || 0} directories${tree.truncated ? ', truncated by GitHub' : ''}.` : '',
        topExtensions ? `Top extensions: ${topExtensions}` : '',
        importantPaths ? `Important paths:\n${importantPaths}` : '',
        intelligence.stackSummary ? `Repo intelligence: ${intelligence.stackSummary}` : '',
        Array.isArray(intelligence.roleRelevantSkills) && intelligence.roleRelevantSkills.length ? `Role-relevant skills: ${intelligence.roleRelevantSkills.join(', ')}` : '',
        Array.isArray(intelligence.assessmentIdeas) && intelligence.assessmentIdeas.length ? `Assessment ideas:\n${intelligence.assessmentIdeas.map((item: string) => `- ${item}`).join('\n')}` : '',
        readme,
        manifests ? `Project files:\n${manifests}` : '',
    ].filter(Boolean).join('\n\n').slice(0, 45_000);
}

function buildRepoBranchMap(repos: GithubRepository[]) {
    return repos.reduce<Record<string, string>>((acc, repo) => {
        acc[repo.id] = repo.selectedBranch || repo.defaultBranch || 'main';
        return acc;
    }, {});
}

async function readApiError(response: Response, fallback: string) {
    const payload = await response.json().catch(() => null);
    if (Array.isArray(payload?.message)) return payload.message.join(', ');
    if (typeof payload?.message === 'string') return payload.message;
    return fallback;
}

function inferRoleTitle(prompt: string) {
    const normalized = prompt.trim();
    if (!normalized) return 'New role';
    const match = normalized.match(/(?:for|as)\s+([A-Za-z0-9 /+-]+?)(?:\.|,|$)/i);
    return (match?.[1] || normalized.split(/\s+/).slice(0, 5).join(' ')).slice(0, 80);
}
