'use client';

import { Suspense, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { companySettingsApi } from '../../lib/company-settings';

type InvitePreview = {
  valid: boolean;
  status: string;
  message?: string;
  companyName?: string;
  email?: string;
  role?: 'owner' | 'admin' | 'member';
  expiresAt?: string;
  requiresAccountSetup?: boolean;
  requiresTwoFactor?: boolean;
  dashboardPath?: string;
};

function InvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const token = searchParams.get('token') || '';
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    password: '',
    twoFactorCode: '',
  });
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(Boolean(token));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadPreview = async () => {
      if (!token) {
        setPreviewLoading(false);
        return;
      }
      setPreviewLoading(true);
      setError('');
      try {
        const result = await companySettingsApi.previewInvite(token);
        if (mounted) setPreview(result);
      } catch (err) {
        if (mounted) {
          setPreview({
            valid: false,
            status: 'invalid',
            message:
              err instanceof Error ? err.message : 'Invite link could not be loaded.',
          });
        }
      } finally {
        if (mounted) setPreviewLoading(false);
      }
    };

    loadPreview();
    return () => {
      mounted = false;
    };
  }, [token]);

  const roleLabel = useMemo(() => {
    if (preview?.role === 'admin') return 'Admin access';
    if (preview?.role === 'owner') return 'Owner access';
    return 'Member access';
  }, [preview?.role]);

  const expiresAt = useMemo(() => {
    if (!preview?.expiresAt) return null;
    return new Date(preview.expiresAt).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [preview?.expiresAt]);

  const accept = async (event: FormEvent) => {
    event.preventDefault();
    if (!preview?.valid) return;
    if (preview.requiresAccountSetup && !form.firstName.trim()) {
      setError('First name is required to create your company account.');
      return;
    }
    if (!form.password) {
      setError('Password is required to accept this invite.');
      return;
    }
    if (preview.requiresTwoFactor && !form.twoFactorCode.trim()) {
      setError('Authenticator code is required for this account.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await companySettingsApi.acceptInvite({
        token,
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        password: form.password,
        twoFactorCode: form.twoFactorCode.trim() || undefined,
      });
      if (result?.accessToken && result?.user) {
        login(result.accessToken, result.user, false, 'user');
        setAccepted(true);
        router.replace(result.dashboardPath || '/industry/dashboard');
        return;
      }
      setAccepted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invite could not be accepted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-white">
            <Building2 size={21} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-mono text-xl font-bold">
              Join Emble Company
            </h1>
            <p className="truncate text-sm text-neutral-500">
              Accept your workspace invite.
            </p>
          </div>
        </div>

        {!token ? (
          <InviteState
            tone="error"
            title="Invite token is missing."
            actionLabel="Go to company login"
            actionHref="/login/industry?next=/industry/dashboard"
          />
        ) : previewLoading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm font-semibold text-neutral-500">
            <Loader2 className="animate-spin" size={18} />
            Loading invite...
          </div>
        ) : accepted ? (
          <InviteState
            tone="success"
            title="Invite accepted. Opening your company dashboard..."
          />
        ) : !preview?.valid ? (
          <InviteState
            tone="error"
            title={preview?.message || 'Invite link is not active.'}
            description={
              preview?.status === 'accepted'
                ? 'Sign in with the account that accepted this invite.'
                : 'Ask the company owner or admin to send a fresh invite.'
            }
            actionLabel="Go to company login"
            actionHref="/login/industry?next=/industry/dashboard"
          />
        ) : (
          <form onSubmit={accept} className="space-y-5">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-900">
                  <ShieldCheck size={17} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-950">
                    {preview.companyName || 'Emble company workspace'}
                  </p>
                  <p className="mt-1 break-words text-xs text-neutral-500">
                    Invited as <span className="font-semibold text-neutral-800">{roleLabel}</span>
                    {preview.email ? ` for ${preview.email}` : ''}
                    {expiresAt ? `. Expires ${expiresAt}.` : '.'}
                  </p>
                </div>
              </div>
            </div>

            {preview.requiresAccountSetup ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="First name"
                  value={form.firstName}
                  onChange={(value) => setForm({ ...form, firstName: value })}
                  autoComplete="given-name"
                  required
                />
                <Field
                  label="Last name"
                  value={form.lastName}
                  onChange={(value) => setForm({ ...form, lastName: value })}
                  autoComplete="family-name"
                />
              </div>
            ) : null}

            <Field
              label={preview.requiresAccountSetup ? 'Create password' : 'Account password'}
              type="password"
              value={form.password}
              onChange={(value) => setForm({ ...form, password: value })}
              autoComplete={preview.requiresAccountSetup ? 'new-password' : 'current-password'}
              required
            />
            {preview.requiresAccountSetup ? (
              <p className="text-xs text-neutral-500">
                Use at least 8 characters with uppercase, lowercase, number, and symbol.
              </p>
            ) : null}

            {preview.requiresTwoFactor ? (
              <Field
                label="Authenticator code"
                value={form.twoFactorCode}
                onChange={(value) => setForm({ ...form, twoFactorCode: value })}
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={12}
                required
              />
            ) : null}

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#042614] px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-950 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : null}
              Access company dashboard
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function InviteState({
  tone,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  tone: 'success' | 'error';
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  const isSuccess = tone === 'success';
  return (
    <div className="space-y-4">
      <div
        className={`flex items-start gap-2 rounded-xl border p-4 text-sm font-semibold ${
          isSuccess
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}
      >
        {isSuccess ? <CheckCircle2 className="mt-0.5 shrink-0" size={18} /> : null}
        <div>
          <p>{title}</p>
          {description ? <p className="mt-1 text-xs font-medium opacity-80">{description}</p> : null}
        </div>
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="block rounded-xl bg-[#042614] px-4 py-3 text-center text-sm font-bold text-white"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  inputMode,
  maxLength = 100,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'search' | 'email' | 'url';
  maxLength?: number;
  required?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-semibold text-neutral-900">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        required={required}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-black"
      />
    </label>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-neutral-500">Loading invite...</div>}>
      <InvitePageContent />
    </Suspense>
  );
}
