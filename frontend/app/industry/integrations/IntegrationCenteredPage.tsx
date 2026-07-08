'use client';

import { fetchApi } from '../../lib/apiClient';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Code2,
    ExternalLink,
    FileText,
    Github,
    GitFork,
    Loader2,
    Plus,
    RefreshCcw,
    Search,
    Ticket,
    Trash2,
    TriangleAlert,
    X,
} from 'lucide-react';

type GithubRepository = {
    id: string;
    fullName: string;
    htmlUrl: string;
    defaultBranch?: string | null;
    selectedBranch?: string | null;
    private?: boolean;
    isLinked?: boolean;
    contextStatus?: 'synced' | 'parsing' | 'parsed' | 'syncing' | 'ready' | 'failed' | string | null;
    contextSnapshot?: Record<string, any> | null;
    contextSyncedAt?: string | null;
    contextError?: string | null;
};

type GithubStatus = {
    configured: boolean;
    missing?: string[];
    connected: boolean;
    accountLogin?: string | null;
    accountType?: string | null;
    installationCount?: number;
    repositoryCount?: number;
    availableCount?: number;
    linkedCount?: number;
    parsedCount?: number;
    lastSyncedAt?: string | null;
    syncError?: string | null;
    manageUrl?: string | null;
};

export default function IntegrationCenteredPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const draftId = searchParams.get('draftId');
    const [linkedRepos, setLinkedRepos] = useState<GithubRepository[]>([]);
    const [availableRepos, setAvailableRepos] = useState<GithubRepository[]>([]);
    const [status, setStatus] = useState<GithubStatus | null>(null);
    const [selectedRepoId, setSelectedRepoId] = useState('');
    const [pickerOpen, setPickerOpen] = useState(false);
    const [repoQuery, setRepoQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [linkingRepoId, setLinkingRepoId] = useState<string | null>(null);
    const [parsingRepoId, setParsingRepoId] = useState<string | null>(null);
    const [repoActionId, setRepoActionId] = useState<string | null>(null);
    const [branchDrafts, setBranchDrafts] = useState<Record<string, string>>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const selectedRepo = useMemo(
        () => linkedRepos.find((repo) => repo.id === selectedRepoId) || linkedRepos[0] || null,
        [linkedRepos, selectedRepoId],
    );
    const filteredAvailableRepos = useMemo(() => {
        const query = repoQuery.trim().toLowerCase();
        if (!query) return availableRepos;
        return availableRepos.filter((repo) => repo.fullName.toLowerCase().includes(query));
    }, [availableRepos, repoQuery]);
    const readme = selectedRepo?.contextSnapshot?.readme as
        | { path?: string; content?: string; truncated?: boolean }
        | undefined;
    const manifests = Array.isArray(selectedRepo?.contextSnapshot?.manifests)
        ? selectedRepo.contextSnapshot.manifests as Array<{ path?: string; content?: string; truncated?: boolean }>
        : [];
    const effectiveConnected = Boolean(status?.connected || linkedRepos.length || availableRepos.length);

    useEffect(() => {
        void loadIntegration(searchParams.get('github') === 'connected');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const integrationReturnPath = () => {
        const params = new URLSearchParams();
        if (returnTo) params.set('returnTo', returnTo);
        if (draftId) params.set('draftId', draftId);
        const query = params.toString();
        return `/industry/integrations${query ? `?${query}` : ''}`;
    };

    const loadIntegration = async (forceSync = false) => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const next = integrationReturnPath();
            const [linkedRes, availableRes, statusRes, installRes] = await Promise.all([
                fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/repositories?linked=true${forceSync ? '&sync=true' : ''}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/repositories?available=true${forceSync ? '&sync=true' : ''}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/status`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/install-url?next=${encodeURIComponent(next)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if ([linkedRes.status, availableRes.status, statusRes.status, installRes.status].includes(401)) {
                router.push('/login/industry?next=%2Findustry%2Fintegrations');
                return;
            }
            if (!linkedRes.ok) throw new Error(await readApiError(linkedRes, 'Unable to load linked repositories.'));
            if (!availableRes.ok) throw new Error(await readApiError(availableRes, 'Unable to load available repositories.'));

            const linkedPayload = await linkedRes.json();
            const availablePayload = await availableRes.json();
            const linked = Array.isArray(linkedPayload) ? linkedPayload : [];
            const available = Array.isArray(availablePayload) ? availablePayload : [];
            setLinkedRepos(linked);
            setAvailableRepos(available);
            setSelectedRepoId((current) => current || linked[0]?.id || '');

            if (statusRes.ok) {
                const payload = await statusRes.json();
                setStatus({
                    ...payload,
                    connected: Boolean(payload.connected || linked.length || available.length),
                    repositoryCount: Math.max(Number(payload.repositoryCount || 0), linked.length + available.length),
                    linkedCount: Math.max(Number(payload.linkedCount || 0), linked.length),
                    availableCount: Math.max(Number(payload.availableCount || 0), available.length),
                });
            }
            if (installRes.ok) {
                const payload = await installRes.json();
                if (payload.configured === false) {
                    setStatus((current) => ({
                        ...(current || { connected: false }),
                        configured: false,
                        missing: Array.isArray(payload.missing) ? payload.missing : [],
                    }));
                }
            }
            if (forceSync && !linked.length && available.length) {
                setPickerOpen(true);
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
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/install-url?next=${encodeURIComponent(integrationReturnPath())}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(await readApiError(res, 'Unable to start GitHub connection.'));
            const payload = await res.json();
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
            await loadIntegration(true);
        } finally {
            setSyncing(false);
        }
    };

    const linkRepository = async (repo: GithubRepository) => {
        setLinkingRepoId(repo.id);
        setErrorMessage(null);
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
                    branch: repo.selectedBranch || repo.defaultBranch || 'main',
                }),
            });
            if (!res.ok) throw new Error(await readApiError(res, 'Unable to link repository.'));
            const linked = await res.json();
            setLinkedRepos((current) => [linked, ...current.filter((item) => item.id !== linked.id)].sort((a, b) => a.fullName.localeCompare(b.fullName)));
            setAvailableRepos((current) => current.filter((item) => item.id !== linked.id));
            setSelectedRepoId(linked.id);
            setPickerOpen(false);
        } catch (error: any) {
            setErrorMessage(error.message || 'Unable to link repository.');
        } finally {
            setLinkingRepoId(null);
        }
    };

    const parseRepository = async (repo: GithubRepository) => {
        setParsingRepoId(repo.id);
        setErrorMessage(null);
        setLinkedRepos((current) => current.map((item) => item.id === repo.id ? { ...item, contextStatus: 'parsing', contextError: null } : item));
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/repositories/${repo.id}/refresh`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(await readApiError(res, 'Unable to parse repository context.'));
            const updated = await res.json();
            setLinkedRepos((current) => current.map((item) => item.id === repo.id ? updated : item));
            setSelectedRepoId(repo.id);
        } catch (error: any) {
            setErrorMessage(error.message || 'Unable to parse repository context.');
            setLinkedRepos((current) => current.map((item) => item.id === repo.id ? { ...item, contextStatus: 'failed', contextError: error.message || 'Unable to parse repository context.' } : item));
        } finally {
            setParsingRepoId(null);
        }
    };

    const replaceLinkedRepo = (updated: GithubRepository) => {
        setLinkedRepos((current) => current.map((item) => item.id === updated.id ? updated : item));
        setSelectedRepoId((current) => current || updated.id);
    };

    const saveRepositoryBranch = async (repo: GithubRepository) => {
        const branch = (branchDrafts[repo.id] || repo.selectedBranch || repo.defaultBranch || 'main').trim();
        if (!branch) return;
        setRepoActionId(repo.id);
        setErrorMessage(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/repositories/${repo.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ branch }),
            });
            if (!res.ok) throw new Error(await readApiError(res, 'Unable to update repository branch.'));
            replaceLinkedRepo(await res.json());
        } catch (error: any) {
            setErrorMessage(error.message || 'Unable to update repository branch.');
        } finally {
            setRepoActionId(null);
        }
    };

    const unlinkRepository = async (repo: GithubRepository) => {
        setRepoActionId(repo.id);
        setErrorMessage(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/repositories/${repo.id}/link`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(await readApiError(res, 'Unable to unlink repository.'));
            const payload = await res.json();
            const unlinked = payload?.repository || { ...repo, isLinked: false };
            setLinkedRepos((current) => current.filter((item) => item.id !== repo.id));
            setAvailableRepos((current) => [unlinked, ...current.filter((item) => item.id !== repo.id)].sort((a, b) => a.fullName.localeCompare(b.fullName)));
            setSelectedRepoId((current) => current === repo.id ? '' : current);
        } catch (error: any) {
            setErrorMessage(error.message || 'Unable to unlink repository.');
        } finally {
            setRepoActionId(null);
        }
    };

    const deleteRepositoryContext = async (repo: GithubRepository) => {
        setRepoActionId(repo.id);
        setErrorMessage(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/integrations/github/repositories/${repo.id}/context`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(await readApiError(res, 'Unable to delete parsed context.'));
            const payload = await res.json();
            replaceLinkedRepo(payload?.repository || { ...repo, contextSnapshot: null, contextStatus: 'synced', contextSyncedAt: null, contextError: null });
        } catch (error: any) {
            setErrorMessage(error.message || 'Unable to delete parsed context.');
        } finally {
            setRepoActionId(null);
        }
    };

    const useRepository = (repo: GithubRepository, target: 'assessment' | 'role') => {
        const params = new URLSearchParams({ repoId: repo.id });
        if (draftId) params.set('draftId', draftId);
        if (target === 'assessment') {
            params.set('flow', 'new');
            params.set('step', 'context');
            params.set('panel', 'repos');
            router.push(`/industry/assessments/new?${params.toString()}`);
            return;
        }
        router.push(`/industry/drives/new?${params.toString()}`);
    };

    const activeReturnTarget = returnTo === 'assessment' || returnTo === 'role' ? returnTo : null;

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-12">
            <nav className="inline-flex rounded-xl bg-neutral-100 p-1">
                <TabButton active icon={<Github size={15} />} label="Repositories" />
                <TabButton icon={<Code2 size={15} />} label="ATS" disabled />
                <TabButton icon={<Ticket size={15} />} label="Tickets" disabled />
            </nav>

            {errorMessage ? <Notice tone="rose" icon={<TriangleAlert size={18} />}>{errorMessage}</Notice> : null}
            {status?.syncError ? <Notice tone="rose" icon={<TriangleAlert size={18} />}>{status.syncError}</Notice> : null}
            {status?.configured === false ? (
                <Notice tone="amber" icon={<TriangleAlert size={18} />}>
                    GitHub App setup is required.
                    {status.missing?.length ? <span className="mt-1 block font-mono text-xs">Missing: {status.missing.join(', ')}</span> : null}
                </Notice>
            ) : null}

            <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <div className="flex flex-col gap-4 border-b border-neutral-200 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="inline-flex items-center gap-3 text-lg font-semibold text-black">
                        <GitFork size={20} />
                        Linked Repositories
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${effectiveConnected ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-neutral-50 text-neutral-600'}`}>
                            <Github size={13} />
                            {effectiveConnected ? `Connected${status?.accountLogin ? ` to ${status.accountLogin}` : ''}` : 'GitHub not connected'}
                        </span>
                        {effectiveConnected ? (
                            <span className="inline-flex items-center rounded-lg bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-600">
                                {status?.linkedCount ?? linkedRepos.length} linked - {status?.availableCount ?? availableRepos.length} available
                            </span>
                        ) : null}
                        {status?.manageUrl ? (
                            <a href={status.manageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-black">
                                Manage on GitHub
                                <ExternalLink size={13} />
                        </a>
                        ) : null}
                        {effectiveConnected ? (
                            <button
                                type="button"
                                onClick={syncRepositories}
                                disabled={syncing}
                                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
                            >
                                {syncing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCcw size={15} />}
                                Sync granted repos
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={effectiveConnected ? () => setPickerOpen(true) : connectGithub}
                            disabled={connecting || status?.configured === false}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
                        >
                            {connecting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                            {effectiveConnected ? 'Link Repository' : 'Connect GitHub'}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex min-h-[180px] items-center justify-center text-sm font-medium text-neutral-500">
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Loading repositories...
                    </div>
                ) : linkedRepos.length ? (
                    <div className="divide-y divide-neutral-100">
                        {linkedRepos.map((repo) => (
                            <LinkedRepoRow
                                key={repo.id}
                                repo={repo}
                                active={selectedRepo?.id === repo.id}
                                parsing={parsingRepoId === repo.id}
                                actionBusy={repoActionId === repo.id}
                                branchValue={branchDrafts[repo.id] ?? repo.selectedBranch ?? repo.defaultBranch ?? 'main'}
                                returnTarget={activeReturnTarget}
                                onSelect={() => setSelectedRepoId(repo.id)}
                                onBranchChange={(value) => setBranchDrafts((current) => ({ ...current, [repo.id]: value }))}
                                onSaveBranch={() => saveRepositoryBranch(repo)}
                                onParse={() => parseRepository(repo)}
                                onUnlink={() => unlinkRepository(repo)}
                                onDeleteContext={() => deleteRepositoryContext(repo)}
                                onUse={(target) => useRepository(repo, target)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[168px] flex-col items-center justify-center px-6 py-12 text-center">
                        <GitFork size={38} className="text-neutral-300" />
                        <p className="mt-4 text-sm text-neutral-500">No repositories linked yet</p>
                        {effectiveConnected && availableRepos.length ? (
                            <button type="button" onClick={() => setPickerOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-950 px-4 py-2 text-sm font-semibold text-white">
                                <Plus size={15} />
                                Link Repository
                            </button>
                        ) : null}
                    </div>
                )}
            </section>

            {selectedRepo ? (
                <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
                    <div className="rounded-2xl border border-neutral-200 bg-white">
                        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
                            <div className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-neutral-950">
                                <BookOpen size={16} />
                                <span className="truncate">{readme?.path || 'README context'}</span>
                            </div>
                            {readme?.truncated ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">Truncated</span> : null}
                        </div>
                        <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap px-5 py-5 text-xs leading-5 text-neutral-700">
                            {readme?.content || 'Parse this repository to store README and project context.'}
                        </pre>
                    </div>
                    <aside className="space-y-4">
                        <ContextSummary repo={selectedRepo} />
                        {manifests.slice(0, 2).map((file) => (
                            <ContextMiniFile key={file.path} file={file} />
                        ))}
                    </aside>
                </section>
            ) : null}

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={syncRepositories}
                    disabled={syncing}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-60"
                >
                    {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                    Sync granted repos
                </button>
            </div>

            {pickerOpen ? (
                <RepositoryPicker
                    repos={filteredAvailableRepos}
                    query={repoQuery}
                    setQuery={setRepoQuery}
                    loading={syncing}
                    linkingRepoId={linkingRepoId}
                    onClose={() => setPickerOpen(false)}
                    onSync={syncRepositories}
                    onLink={linkRepository}
                />
            ) : null}
        </div>
    );
}

function TabButton({ active = false, disabled = false, icon, label }: { active?: boolean; disabled?: boolean; icon: ReactNode; label: string }) {
    return (
        <button
            type="button"
            disabled={disabled}
            className={`inline-flex min-w-[160px] items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition ${active ? 'bg-white text-black shadow-sm' : 'text-neutral-600'} disabled:cursor-not-allowed disabled:text-neutral-400`}
        >
            {icon}
            {label}
        </button>
    );
}

function LinkedRepoRow({
    repo,
    active,
    parsing,
    actionBusy,
    branchValue,
    returnTarget,
    onSelect,
    onBranchChange,
    onSaveBranch,
    onParse,
    onUnlink,
    onDeleteContext,
    onUse,
}: {
    repo: GithubRepository;
    active: boolean;
    parsing: boolean;
    actionBusy: boolean;
    branchValue: string;
    returnTarget: 'assessment' | 'role' | null;
    onSelect: () => void;
    onBranchChange: (value: string) => void;
    onSaveBranch: () => void;
    onParse: () => void;
    onUnlink: () => void;
    onDeleteContext: () => void;
    onUse: (target: 'assessment' | 'role') => void;
}) {
    const parsed = isParsed(repo);
    return (
        <div className={`flex flex-col gap-4 px-6 py-4 transition lg:flex-row lg:items-center lg:justify-between ${active ? 'bg-emerald-50/40' : 'bg-white'}`}>
            <button type="button" onClick={onSelect} className="min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-semibold text-neutral-950">{repo.fullName}</span>
                    <RepoStatus repo={repo} parsing={parsing} />
                    {repo.private ? <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">Private</span> : null}
                </div>
                <p className="mt-1 truncate text-xs text-neutral-500">
                    {repo.selectedBranch || repo.defaultBranch || 'main'} - {repo.htmlUrl}
                </p>
                {repo.contextError ? <p className="mt-1 text-xs font-semibold text-rose-600">{repo.contextError}</p> : null}
            </button>
            <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-1.5">
                    <input
                        value={branchValue}
                        onChange={(event) => onBranchChange(event.target.value)}
                        className="h-7 w-28 border-0 bg-transparent text-xs font-semibold text-neutral-700 outline-none"
                        aria-label={`Branch for ${repo.fullName}`}
                    />
                    <button
                        type="button"
                        onClick={onSaveBranch}
                        disabled={actionBusy}
                        className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-700 hover:bg-neutral-200 disabled:opacity-50"
                    >
                        Save
                    </button>
                </div>
                <a href={repo.htmlUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
                    <ExternalLink size={15} />
                    GitHub
                </a>
                <button
                    type="button"
                    onClick={onParse}
                    disabled={parsing}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
                >
                    {parsing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCcw size={15} />}
                    {parsed ? 'Re-parse' : 'Parse'}
                </button>
                {parsed ? (
                    <button
                        type="button"
                        onClick={onDeleteContext}
                        disabled={actionBusy}
                        className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-60"
                    >
                        {actionBusy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        Delete context
                    </button>
                ) : null}
                <button
                    type="button"
                    onClick={onUnlink}
                    disabled={actionBusy}
                    className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                >
                    {actionBusy ? <Loader2 size={15} className="animate-spin" /> : <X size={15} />}
                    Unlink
                </button>
                {parsed ? (
                    returnTarget ? (
                        <button type="button" onClick={() => onUse(returnTarget)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-950 px-3 py-2 text-sm font-semibold text-white">
                            <ArrowRight size={15} />
                            Use in {returnTarget}
                        </button>
                    ) : (
                        <>
                            <button type="button" onClick={() => onUse('assessment')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-950 px-3 py-2 text-sm font-semibold text-white">
                                <ArrowRight size={15} />
                                Assessment
                            </button>
                            <button type="button" onClick={() => onUse('role')} className="inline-flex items-center gap-2 rounded-lg bg-neutral-950 px-3 py-2 text-sm font-semibold text-white">
                                <ArrowRight size={15} />
                                Role
                            </button>
                        </>
                    )
                ) : (
                    <span className="inline-flex items-center rounded-lg bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-500">Parse before use</span>
                )}
            </div>
        </div>
    );
}

function RepositoryPicker({
    repos,
    query,
    setQuery,
    loading,
    linkingRepoId,
    onClose,
    onSync,
    onLink,
}: {
    repos: GithubRepository[];
    query: string;
    setQuery: (value: string) => void;
    loading: boolean;
    linkingRepoId: string | null;
    onClose: () => void;
    onSync: () => void;
    onLink: (repo: GithubRepository) => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-black">Link repository</h2>
                        <p className="mt-1 text-sm text-neutral-500">Choose one of the repositories granted to the GitHub App.</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-black" aria-label="Close repository picker">
                        <X size={18} />
                    </button>
                </div>
                <div className="flex items-center gap-2 border-y border-neutral-200 px-4 py-2">
                    <Search size={17} className="text-neutral-400" />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 flex-1 border-0 text-sm outline-none placeholder:text-neutral-400" placeholder="Search repositories..." autoFocus />
                    <button type="button" onClick={onSync} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 disabled:opacity-60">
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                        Sync
                    </button>
                </div>
                <div className="max-h-[360px] overflow-auto p-2">
                    {repos.length ? repos.map((repo) => (
                        <div key={repo.id} className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 hover:bg-neutral-50">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-neutral-950">{repo.fullName}</p>
                                <p className="mt-1 text-xs text-neutral-500">{repo.defaultBranch || 'main'} - {repo.private ? 'private' : 'public'} - read-only</p>
                            </div>
                            <button type="button" onClick={() => onLink(repo)} disabled={linkingRepoId === repo.id} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-emerald-950 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
                                {linkingRepoId === repo.id ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                                Link
                            </button>
                        </div>
                    )) : (
                        <div className="px-4 py-10 text-center text-sm text-neutral-500">
                            No unlinked repositories found. Sync granted repos or manage access on GitHub.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function RepoStatus({ repo, parsing = false }: { repo: GithubRepository; parsing?: boolean }) {
    if (parsing || repo.contextStatus === 'parsing' || repo.contextStatus === 'syncing') {
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700"><Loader2 size={12} className="animate-spin" /> Parsing</span>;
    }
    if (isParsed(repo)) {
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"><CheckCircle2 size={12} /> Parsed</span>;
    }
    if (repo.contextStatus === 'failed') {
        return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700"><TriangleAlert size={12} /> Failed</span>;
    }
    return <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">Synced</span>;
}

function ContextSummary({ repo }: { repo: GithubRepository }) {
    const snapshot = repo.contextSnapshot || {};
    const tree = snapshot.tree as Record<string, any> | undefined;
    const languages = snapshot.languages as Record<string, number> | undefined;
    const intelligence = snapshot.repoIntelligence as
        | {
            stackSummary?: string;
            roleRelevantSkills?: string[];
            assessmentIdeas?: string[];
            usedFallback?: boolean;
        }
        | undefined;
    const languageRows = languages
        ? Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 5)
        : [];

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-950">
                <Code2 size={16} />
                Parsed shape
            </div>
            <div className="mt-4 space-y-3 text-sm">
                <SummaryLine label="Files" value={tree?.totalFiles !== undefined ? String(tree.totalFiles) : 'Not parsed'} />
                <SummaryLine label="Directories" value={tree?.totalDirectories !== undefined ? String(tree.totalDirectories) : 'Not parsed'} />
                <SummaryLine label="Primary" value={String(snapshot.primaryLanguage || 'Unknown')} />
                <SummaryLine label="Updated" value={repo.contextSyncedAt ? new Date(repo.contextSyncedAt).toLocaleString() : 'Never'} />
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
            {intelligence?.stackSummary ? (
                <div className="mt-5 rounded-xl bg-neutral-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">AI context</p>
                    <p className="mt-2 text-xs leading-5 text-neutral-700">{intelligence.stackSummary}</p>
                    {Array.isArray(intelligence.roleRelevantSkills) && intelligence.roleRelevantSkills.length ? (
                        <p className="mt-2 text-xs font-semibold text-neutral-700">
                            {intelligence.roleRelevantSkills.slice(0, 5).join(' - ')}
                        </p>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

function ContextMiniFile({ file }: { file: { path?: string; content?: string; truncated?: boolean } }) {
    return (
        <section className="rounded-2xl border border-neutral-200 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                <div className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-neutral-950">
                    <FileText size={16} />
                    <span className="truncate">{file.path || 'Project file'}</span>
                </div>
                {file.truncated ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">Truncated</span> : null}
            </div>
            <pre className="max-h-[220px] overflow-auto whitespace-pre-wrap px-4 py-4 text-xs leading-5 text-neutral-700">
                {file.content || 'No content stored.'}
            </pre>
        </section>
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

function isParsed(repo: GithubRepository) {
    return Boolean(repo.contextSnapshot) && (repo.contextStatus === 'parsed' || repo.contextStatus === 'ready');
}

async function readApiError(response: Response, fallback: string) {
    const payload = await response.json().catch(() => null);
    if (Array.isArray(payload?.message)) return payload.message.join(', ');
    if (typeof payload?.message === 'string') return payload.message;
    return fallback;
}
