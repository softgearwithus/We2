'use client';

import { fetchApi } from '../../lib/apiClient';
import IntegrationCenteredPage from './IntegrationCenteredPage';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Code2,
    ExternalLink,
    FileText,
    Github,
    Loader2,
    Plug,
    RefreshCcw,
    Sparkles,
    TriangleAlert,
} from 'lucide-react';

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

export default function IndustryIntegrationsPage() {
    return <IntegrationCenteredPage />;
}

function LegacyIndustryIntegrationsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [repos, setRepos] = useState<GithubRepository[]>([]);
    const [selectedRepoId, setSelectedRepoId] = useState('');
    const [installUrl, setInstallUrl] = useState<string | null>(null);
    const [configured, setConfigured] = useState(true);
    const [setupMessage, setSetupMessage] = useState<string | null>(null);
    const [missingConfig, setMissingConfig] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [refreshingRepoId, setRefreshingRepoId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const selectedRepo = useMemo(
        () => repos.find((repo) => repo.id === selectedRepoId) || repos[0] || null,
        [repos, selectedRepoId],
    );

    const readyRepos = repos.filter((repo) => repo.contextStatus === 'ready').length;
    const readme = selectedRepo?.contextSnapshot?.readme as
        | { path?: string; content?: string; truncated?: boolean }
        | undefined;
    const manifests = Array.isArray(selectedRepo?.contextSnapshot?.manifests)
        ? selectedRepo?.contextSnapshot?.manifests as Array<{ path?: string; content?: string; truncated?: boolean }>
        : [];

    useEffect(() => {
        void loadIntegration(searchParams.get('github') === 'connected');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const loadIntegration = async (forceSync = false) => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const next = '/industry/integrations';
            const [reposRes, installRes] = await Promise.all([
                fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/repositories${forceSync ? '?sync=true' : ''}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/install-url?next=${encodeURIComponent(next)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (reposRes.status === 401 || installRes.status === 401) {
                router.push('/login/industry?next=%2Findustry%2Fintegrations');
                return;
            }
            if (!reposRes.ok) {
                throw new Error(await readApiError(reposRes, 'Unable to load GitHub repositories.'));
            }

            const repoPayload = await reposRes.json();
            setRepos(Array.isArray(repoPayload) ? repoPayload : []);
            setSelectedRepoId((current) => current || repoPayload?.[0]?.id || '');

            if (installRes.ok) {
                const payload = await installRes.json();
                setInstallUrl(payload.installUrl || null);
                setConfigured(payload.configured !== false);
                setSetupMessage(payload.message || null);
                setMissingConfig(Array.isArray(payload.missing) ? payload.missing : []);
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Unable to load integrations.');
        } finally {
            setLoading(false);
        }
    };

    const connectGithub = async () => {
        setConnecting(true);
        setErrorMessage(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const next = '/industry/integrations';
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/install-url?next=${encodeURIComponent(next)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                throw new Error(await readApiError(res, 'Unable to start GitHub connection.'));
            }
            const payload = await res.json();
            setInstallUrl(payload.installUrl || null);
            setConfigured(payload.configured !== false);
            setSetupMessage(payload.message || null);
            setMissingConfig(Array.isArray(payload.missing) ? payload.missing : []);
            if (payload.configured === false || !payload.installUrl) {
                throw new Error(payload.message || 'GitHub App setup is required.');
            }
            window.location.href = payload.installUrl;
        } catch (error: any) {
            setErrorMessage(error.message || 'Unable to start GitHub connection.');
            setConnecting(false);
        }
    };

    const syncRepositories = async () => {
        setSyncing(true);
        setErrorMessage(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/repositories?sync=true`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                throw new Error(await readApiError(res, 'Unable to sync repositories.'));
            }
            const payload = await res.json();
            setRepos(Array.isArray(payload) ? payload : []);
            setSelectedRepoId((current) => current || payload?.[0]?.id || '');
        } catch (error: any) {
            setErrorMessage(error.message || 'Unable to sync repositories.');
        } finally {
            setSyncing(false);
        }
    };

    const refreshRepository = async (repo: GithubRepository) => {
        setRefreshingRepoId(repo.id);
        setErrorMessage(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/repositories/${repo.id}/refresh`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                throw new Error(await readApiError(res, 'Unable to parse repository context.'));
            }
            const updated = await res.json();
            setRepos((current) => current.map((item) => item.id === repo.id ? updated : item));
            setSelectedRepoId(repo.id);
        } catch (error: any) {
            setErrorMessage(error.message || 'Unable to parse repository context.');
        } finally {
            setRefreshingRepoId(null);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6 pb-12">
            <header className="flex flex-col gap-4 border-b border-neutral-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Company integrations</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">Knowledge sources</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                        Connect read-only repositories once, parse the README and project shape, then reuse that context in roles and assessments.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={connectGithub}
                        disabled={!configured || connecting}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
                    >
                        {connecting ? <Loader2 size={16} className="animate-spin" /> : <Github size={16} />}
                        {connecting ? 'Connecting...' : 'Connect GitHub'}
                    </button>
                    <button
                        type="button"
                        onClick={syncRepositories}
                        disabled={syncing}
                        className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-60"
                    >
                        {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                        Sync repos
                    </button>
                </div>
            </header>

            {!configured ? (
                <Notice tone="amber" icon={<TriangleAlert size={18} />}>
                    {setupMessage || 'GitHub App setup is required.'}
                    {missingConfig.length ? <span className="mt-1 block font-mono text-xs">Missing: {missingConfig.join(', ')}</span> : null}
                </Notice>
            ) : null}

            {errorMessage ? (
                <Notice tone="rose" icon={<TriangleAlert size={18} />}>{errorMessage}</Notice>
            ) : null}

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Metric label="Repositories" value={String(repos.length)} />
                <Metric label="Parsed context" value={String(readyRepos)} />
                <Metric label="Primary source" value={selectedRepo?.fullName || 'Not connected'} />
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
                <aside className="rounded-xl border border-neutral-200 bg-white">
                    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-950">
                            <Plug size={16} />
                            GitHub repositories
                        </div>
                        {loading || syncing ? <Loader2 size={16} className="animate-spin text-emerald-800" /> : null}
                    </div>

                    {repos.length ? (
                        <div className="max-h-[620px] divide-y divide-neutral-100 overflow-auto">
                            {repos.map((repo) => {
                                const active = selectedRepo?.id === repo.id;
                                return (
                                    <button
                                        type="button"
                                        key={repo.id}
                                        onClick={() => setSelectedRepoId(repo.id)}
                                        className={`w-full px-4 py-3 text-left transition ${active ? 'bg-emerald-50' : 'hover:bg-neutral-50'}`}
                                    >
                                        <span className="block truncate text-sm font-semibold text-neutral-950">{repo.fullName}</span>
                                        <span className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                                            <RepoStatus repo={repo} />
                                            <span>{repo.selectedBranch || repo.defaultBranch || 'main'}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="px-4 py-10 text-sm text-neutral-500">
                            {loading ? 'Loading repositories...' : 'No repositories yet. Connect GitHub and grant at least one repo.'}
                        </div>
                    )}
                </aside>

                <main className="min-w-0 rounded-xl border border-neutral-200 bg-white">
                    {selectedRepo ? (
                        <div>
                            <div className="flex flex-col gap-4 border-b border-neutral-200 px-5 py-5 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="truncate text-xl font-semibold text-neutral-950">{selectedRepo.fullName}</h2>
                                        <RepoStatus repo={selectedRepo} />
                                    </div>
                                    <p className="mt-2 text-sm text-neutral-500">
                                        {selectedRepo.private ? 'Private' : 'Public'} repo on {selectedRepo.selectedBranch || selectedRepo.defaultBranch || 'main'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <a href={selectedRepo.htmlUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
                                        <ExternalLink size={15} />
                                        GitHub
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => refreshRepository(selectedRepo)}
                                        disabled={refreshingRepoId === selectedRepo.id}
                                        className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
                                    >
                                        {refreshingRepoId === selectedRepo.id ? <Loader2 size={15} className="animate-spin" /> : <RefreshCcw size={15} />}
                                        Parse context
                                    </button>
                                    <Link href={`/industry/assessments/new?flow=new&step=context&panel=repos&repoId=${selectedRepo.id}`} className="inline-flex items-center gap-2 rounded-lg bg-emerald-950 px-3 py-2 text-sm font-semibold text-white">
                                        <Sparkles size={15} />
                                        Use in assessment
                                    </Link>
                                    <Link href={`/industry/drives/new?repoId=${selectedRepo.id}`} className="inline-flex items-center gap-2 rounded-lg bg-neutral-950 px-3 py-2 text-sm font-semibold text-white">
                                        <ArrowRight size={15} />
                                        Use in role
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[1fr_300px]">
                                <div className="space-y-5">
                                    <ContextBlock
                                        icon={<BookOpen size={16} />}
                                        title={readme?.path || 'README'}
                                        empty="No README parsed yet. Parse context to store it."
                                        content={readme?.content}
                                        truncated={readme?.truncated}
                                    />
                                    {manifests.slice(0, 3).map((file) => (
                                        <ContextBlock
                                            key={file.path}
                                            icon={<FileText size={16} />}
                                            title={file.path || 'Project file'}
                                            empty="No content"
                                            content={file.content}
                                            truncated={file.truncated}
                                        />
                                    ))}
                                </div>

                                <aside className="space-y-4">
                                    <ContextSummary repo={selectedRepo} />
                                </aside>
                            </div>
                        </div>
                    ) : (
                        <div className="flex min-h-[420px] items-center justify-center px-6 text-center">
                            <div>
                                <Github size={34} className="mx-auto text-neutral-300" />
                                <h2 className="mt-4 text-lg font-semibold text-neutral-950">Connect GitHub</h2>
                                <p className="mt-2 max-w-sm text-sm text-neutral-500">Install the read-only app, sync repositories, then parse README and project files for hiring context.</p>
                            </div>
                        </div>
                    )}
                </main>
            </section>
        </div>
    );
}

function RepoStatus({ repo }: { repo: GithubRepository }) {
    if (repo.contextStatus === 'ready') {
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"><CheckCircle2 size={12} /> Parsed</span>;
    }
    if (repo.contextStatus === 'failed') {
        return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700"><TriangleAlert size={12} /> Failed</span>;
    }
    if (repo.contextStatus === 'syncing') {
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700"><Loader2 size={12} className="animate-spin" /> Parsing</span>;
    }
    return <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">Synced</span>;
}

function ContextSummary({ repo }: { repo: GithubRepository }) {
    const snapshot = repo.contextSnapshot || {};
    const tree = snapshot.tree as Record<string, any> | undefined;
    const languages = snapshot.languages as Record<string, number> | undefined;
    const languageRows = languages
        ? Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 5)
        : [];

    return (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-950">
                <Code2 size={16} />
                Parsed shape
            </div>
            <div className="mt-4 space-y-3 text-sm">
                <SummaryLine label="Files" value={tree?.totalFiles !== undefined ? String(tree.totalFiles) : 'Not parsed'} />
                <SummaryLine label="Directories" value={tree?.totalDirectories !== undefined ? String(tree.totalDirectories) : 'Not parsed'} />
                <SummaryLine label="Primary" value={String(snapshot.primaryLanguage || 'Unknown')} />
                <SummaryLine label="Synced" value={repo.contextSyncedAt ? new Date(repo.contextSyncedAt).toLocaleString() : 'Never'} />
            </div>
            {languageRows.length ? (
                <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Languages</p>
                    <div className="mt-2 space-y-2">
                        {languageRows.map(([language, bytes]) => (
                            <div key={language} className="flex items-center justify-between gap-3 text-xs text-neutral-600">
                                <span>{language}</span>
                                <span className="font-mono">{bytes}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
            {repo.contextError ? <p className="mt-4 text-xs font-semibold text-rose-600">{repo.contextError}</p> : null}
        </div>
    );
}

function ContextBlock({
    icon,
    title,
    content,
    empty,
    truncated,
}: {
    icon: ReactNode;
    title: string;
    content?: string;
    empty: string;
    truncated?: boolean;
}) {
    return (
        <section className="rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                <div className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-neutral-950">
                    {icon}
                    <span className="truncate">{title}</span>
                </div>
                {truncated ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">Truncated</span> : null}
            </div>
            <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap px-4 py-4 text-xs leading-5 text-neutral-700">
                {content || empty}
            </pre>
        </section>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-neutral-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{label}</p>
            <p className="mt-2 truncate text-xl font-semibold text-neutral-950">{value}</p>
        </div>
    );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-2 last:border-b-0 last:pb-0">
            <span className="text-neutral-500">{label}</span>
            <span className="text-right font-semibold text-neutral-900">{value}</span>
        </div>
    );
}

function Notice({ tone, icon, children }: { tone: 'amber' | 'rose'; icon: ReactNode; children: ReactNode }) {
    const classes = tone === 'amber'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-rose-200 bg-rose-50 text-rose-700';
    return (
        <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${classes}`}>
            <span className="mt-0.5">{icon}</span>
            <div>{children}</div>
        </div>
    );
}

async function readApiError(response: Response, fallback: string) {
    const payload = await response.json().catch(() => null);
    if (Array.isArray(payload?.message)) return payload.message.join(', ');
    if (typeof payload?.message === 'string') return payload.message;
    return fallback;
}
