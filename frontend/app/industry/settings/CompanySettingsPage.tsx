'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  FileText,
  Key,
  Loader2,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getActiveToken } from '../../lib/auth-storage';
import { companySettingsApi } from '../../lib/company-settings';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type TabId = 'individual' | 'team' | 'billing' | 'profile' | 'api-keys' | 'audit-log';

const tabs: Array<{ id: TabId; label: string; icon: any }> = [
  { id: 'individual', label: 'Individual', icon: User },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'profile', label: 'Profile', icon: Building2 },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'audit-log', label: 'Audit Log', icon: FileText },
];

const apiScopes = [
  'assessments:read',
  'assessments:write',
  'candidates:read',
  'candidates:write',
  'reports:read',
];

const formatDate = (value?: string | null) => {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const personName = (user: any) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
  user?.email ||
  'Company admin';

export default function CompanySettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('individual');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [individual, setIndividual] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [twoFactor, setTwoFactor] = useState({
    enabled: false,
    setupSecret: '',
    setupUrl: '',
    setupCode: '',
    disablePassword: '',
    disableCode: '',
  });
  const [deletePassword, setDeletePassword] = useState('');

  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [profileForm, setProfileForm] = useState<Record<string, any>>({});
  const [team, setTeam] = useState<any>({ currentRole: 'member', members: [], invites: [] });
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'member' });
  const [lastInviteUrl, setLastInviteUrl] = useState('');
  const [billing, setBilling] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [apiKeyForm, setApiKeyForm] = useState({
    name: '',
    scopes: ['assessments:read', 'reports:read'],
  });
  const [newApiKey, setNewApiKey] = useState('');
  const [auditLog, setAuditLog] = useState<any[]>([]);

  const token = useMemo(() => getActiveToken(), []);
  const canManage = team.currentRole === 'owner' || team.currentRole === 'admin';
  const isOwner = team.currentRole === 'owner';

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 4500);
  }, []);

  const loadSettings = useCallback(async () => {
    if (!token || !user?.id) return;
    setLoading(true);
    try {
      const [profileData, teamData, billingData, keysData, auditData] = await Promise.all([
        companySettingsApi.getProfile(token),
        companySettingsApi.getTeam(token),
        companySettingsApi.getBilling(token),
        companySettingsApi.listApiKeys(token),
        companySettingsApi.listAuditLog(token),
      ]);

      setCompanyProfile(profileData);
      setProfileForm({
        displayName: profileData.displayName || '',
        legalName: profileData.legalName || '',
        slug: profileData.slug || '',
        website: profileData.website || '',
        supportEmail: profileData.supportEmail || '',
        verificationEmail: profileData.verificationEmail || '',
        logoUrl: profileData.logoUrl || '',
        description: profileData.description || '',
        industry: profileData.industry || '',
        productType: profileData.productType || '',
        domain: profileData.domain || '',
        companyContext: profileData.companyContext || '',
      });
      setTeam(teamData);
      setBilling(billingData);
      setApiKeys(Array.isArray(keysData) ? keysData : []);
      setAuditLog(Array.isArray(auditData) ? auditData : []);
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, [showMessage, token, user?.id]);

  useEffect(() => {
    setIndividual({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
    setTwoFactor((current) => ({
      ...current,
      enabled: Boolean((user as any)?.isTwoFactorEnabled),
    }));
  }, [user]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const withSaving = async <T,>(
    action: () => Promise<T>,
    success: string | ((result: T) => string),
  ) => {
    if (!token) return;
    setSaving(true);
    try {
      const result = await action();
      showMessage(
        'success',
        typeof success === 'function' ? success(result) : success,
      );
      return result;
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Action failed.');
    } finally {
      setSaving(false);
    }
  };

  const copyText = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1800);
  };

  const saveIndividual = () =>
    withSaving(async () => {
      const updated = await companySettingsApi.updateUserProfile(token!, individual);
      updateUser(updated);
    }, 'Individual settings saved.');

  const changePassword = () =>
    withSaving(async () => {
      if (passwords.newPassword !== passwords.confirmPassword) {
        throw new Error('New passwords do not match.');
      }
      await companySettingsApi.changePassword(token!, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 'Password changed. Please sign in again on other devices.');

  const setupTwoFactor = () =>
    withSaving(async () => {
      const setup = await companySettingsApi.setupTwoFactor(token!);
      setTwoFactor((current) => ({
        ...current,
        setupSecret: setup.secret || '',
        setupUrl: setup.otpauthUrl || '',
      }));
    }, 'Two-factor setup started.');

  const enableTwoFactor = () =>
    withSaving(async () => {
      await companySettingsApi.enableTwoFactor(token!, twoFactor.setupCode);
      setTwoFactor((current) => ({ ...current, enabled: true, setupCode: '' }));
      updateUser({ ...(user as any), isTwoFactorEnabled: true });
    }, 'Two-factor authentication enabled.');

  const disableTwoFactor = () =>
    withSaving(async () => {
      await companySettingsApi.disableTwoFactor(token!, {
        currentPassword: twoFactor.disablePassword,
        code: twoFactor.disableCode || undefined,
      });
      setTwoFactor({
        enabled: false,
        setupSecret: '',
        setupUrl: '',
        setupCode: '',
        disablePassword: '',
        disableCode: '',
      });
      updateUser({ ...(user as any), isTwoFactorEnabled: false });
    }, 'Two-factor authentication disabled.');

  const deactivateCompany = () =>
    withSaving(async () => {
      await companySettingsApi.deactivateAccount(token!, deletePassword);
      logout();
    }, 'Company account deactivated.');

  const saveCompanyProfile = () =>
    withSaving(async () => {
      await companySettingsApi.updateProfile(token!, profileForm);
      await loadSettings();
    }, 'Company profile saved.');

  const inviteMember = () =>
    withSaving(async () => {
      const invite = await companySettingsApi.inviteMember(token!, inviteForm);
      setInviteForm({ email: '', role: 'member' });
      setLastInviteUrl(invite.inviteUrl || '');
      await loadSettings();
      return invite;
    }, (invite: any) =>
      invite?.emailDeliveryStatus === 'failed'
        ? 'Invite created, but email delivery failed. Copy the invite link below.'
        : 'Invite created and email delivery was accepted.',
    );

  const resendInvite = (id: string) =>
    withSaving(async () => {
      const invite = await companySettingsApi.resendInvite(token!, id);
      setLastInviteUrl(invite.inviteUrl || '');
      await loadSettings();
      return invite;
    }, (invite: any) =>
      invite?.emailDeliveryStatus === 'failed'
        ? 'Invite resent, but email delivery failed. Copy the invite link below.'
        : 'Invite resent and email delivery was accepted.',
    );

  const revokeInvite = (id: string) =>
    withSaving(async () => {
      await companySettingsApi.revokeInvite(token!, id);
      await loadSettings();
    }, 'Invite revoked.');

  const updateMemberRole = (id: string, role: string) =>
    withSaving(async () => {
      await companySettingsApi.updateMember(token!, id, role);
      await loadSettings();
    }, 'Team member updated.');

  const removeMember = (id: string) =>
    withSaving(async () => {
      await companySettingsApi.removeMember(token!, id);
      await loadSettings();
    }, 'Team member removed.');

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const upgradeBilling = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId) throw new Error('NEXT_PUBLIC_RAZORPAY_KEY_ID is not configured.');
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded || !window.Razorpay) throw new Error('Razorpay checkout could not load.');
      const order = await companySettingsApi.createBillingOrder(token);
      const checkout = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Emble Company',
        description: 'Company Pro monthly plan',
        order_id: order.orderId,
        prefill: { email: user?.email || '' },
        handler: async (response: any) => {
          await companySettingsApi.verifyBilling(token, {
            plan: 'company_pro_1m',
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });
          await loadSettings();
          showMessage('success', 'Billing upgraded.');
        },
      });
      checkout.open();
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Payment failed.');
    } finally {
      setSaving(false);
    }
  };

  const createApiKey = () =>
    withSaving(async () => {
      const created = await companySettingsApi.createApiKey(token!, apiKeyForm);
      setNewApiKey(created.key || '');
      setApiKeyForm({ name: '', scopes: ['assessments:read', 'reports:read'] });
      await loadSettings();
    }, 'API key created.');

  const revokeApiKey = (id: string) =>
    withSaving(async () => {
      await companySettingsApi.revokeApiKey(token!, id);
      await loadSettings();
    }, 'API key revoked.');

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-emerald-900" size={30} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl text-neutral-950">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-mono text-2xl font-bold">Settings</h1>
        <button
          type="button"
          onClick={loadSettings}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold hover:bg-neutral-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      <div className="mt-6 flex items-center gap-2 overflow-x-auto border-b border-neutral-200 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border border-neutral-200 bg-white text-black shadow-sm'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {message && (
        <div
          className={`mt-4 rounded-md border px-4 py-3 text-sm font-semibold ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {activeTab === 'individual' && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Section title="Profile">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5967c5] text-xl font-bold text-white">
                {(user?.firstName || user?.email || 'C')[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold uppercase">{personName(user)}</div>
                <div className="text-xs text-neutral-500">{user?.email}</div>
              </div>
            </div>
            <Field label="First Name" value={individual.firstName} onChange={(value) => setIndividual({ ...individual, firstName: value })} />
            <Field label="Last Name" value={individual.lastName} onChange={(value) => setIndividual({ ...individual, lastName: value })} />
            <Field label="Contact Email" type="email" value={individual.email} onChange={(value) => setIndividual({ ...individual, email: value })} />
            <div className="flex justify-end">
              <PrimaryButton onClick={saveIndividual} disabled={saving}>Save Settings</PrimaryButton>
            </div>
          </Section>

          <Section title="Security">
            <div className="rounded-md border border-neutral-200 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold"><Mail size={16} /> Change Password</div>
              <PasswordField label="Current Password" value={passwords.currentPassword} onChange={(value) => setPasswords({ ...passwords, currentPassword: value })} />
              <PasswordField label="New Password" value={passwords.newPassword} onChange={(value) => setPasswords({ ...passwords, newPassword: value })} />
              <PasswordField label="Confirm New Password" value={passwords.confirmPassword} onChange={(value) => setPasswords({ ...passwords, confirmPassword: value })} />
              <PrimaryButton onClick={changePassword} disabled={saving || !passwords.currentPassword || !passwords.newPassword}>Update Password</PrimaryButton>
            </div>

            <div className="rounded-md border border-neutral-200 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold"><Shield size={16} /> Two-Factor Authentication</div>
                <span className={`rounded px-2 py-1 text-[11px] font-bold ${twoFactor.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>
                  {twoFactor.enabled ? 'Enabled' : 'Off'}
                </span>
              </div>
              {!twoFactor.enabled && !twoFactor.setupSecret && (
                <PrimaryButton onClick={setupTwoFactor} disabled={saving}>Start Setup</PrimaryButton>
              )}
              {!twoFactor.enabled && twoFactor.setupSecret && (
                <div className="space-y-3">
                  <p className="text-xs text-neutral-500">Add this current secret to Google Authenticator, then enter the 6-digit code. If a code is rejected, make sure your phone time is set to automatic.</p>
                  <div className="rounded bg-neutral-50 p-3 font-mono text-xs break-all">{twoFactor.setupSecret}</div>
                  <button type="button" onClick={() => copyText(twoFactor.setupUrl, '2fa')} className="text-xs font-bold text-neutral-700 hover:underline">
                    {copied === '2fa' ? 'Copied setup URL' : 'Copy setup URL'}
                  </button>
                  <Field label="Authenticator Code" value={twoFactor.setupCode} onChange={(value) => setTwoFactor({ ...twoFactor, setupCode: value })} />
                  <PrimaryButton onClick={enableTwoFactor} disabled={saving || !twoFactor.setupCode}>Enable 2FA</PrimaryButton>
                </div>
              )}
              {twoFactor.enabled && (
                <div className="space-y-3">
                  <PasswordField label="Current Password" value={twoFactor.disablePassword} onChange={(value) => setTwoFactor({ ...twoFactor, disablePassword: value })} />
                  <Field label="Authenticator Code" value={twoFactor.disableCode} onChange={(value) => setTwoFactor({ ...twoFactor, disableCode: value })} />
                  <DangerButton onClick={disableTwoFactor} disabled={saving || !twoFactor.disablePassword}>Disable 2FA</DangerButton>
                </div>
              )}
            </div>

            <button onClick={logout} className="flex w-full items-center gap-3 rounded-md border border-neutral-200 px-3 py-2.5 text-left text-sm font-medium hover:bg-neutral-50">
              <LogOut size={16} className="text-neutral-500" /> Log out
            </button>
            {isOwner && (
              <div className="rounded-md border border-red-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-red-600"><Trash2 size={16} /> Delete Account</div>
                <PasswordField label="Confirm Password" value={deletePassword} onChange={setDeletePassword} />
                <DangerButton onClick={deactivateCompany} disabled={saving || !deletePassword}>Delete Account</DangerButton>
              </div>
            )}
          </Section>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Section title="Team Members">
            <div className="divide-y divide-neutral-100">
              {team.members.map((member: any) => (
                <div key={member.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-bold">{personName(member)}</div>
                    <div className="text-xs text-neutral-500">{member.email} - Joined {formatDate(member.joinedAt)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      disabled={!canManage || member.role === 'owner'}
                      onChange={(event) => updateMemberRole(member.id, event.target.value)}
                      className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                    {canManage && member.role !== 'owner' && (
                      <button onClick={() => removeMember(member.id)} className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <div className="space-y-6">
            <Section title="Invite Teammate">
              <Field label="Email" type="email" value={inviteForm.email} onChange={(value) => setInviteForm({ ...inviteForm, email: value })} />
              <label className="block text-xs font-semibold text-neutral-900">Role</label>
              <select value={inviteForm.role} onChange={(event) => setInviteForm({ ...inviteForm, role: event.target.value })} className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <PrimaryButton onClick={inviteMember} disabled={saving || !canManage || !inviteForm.email}>
                <Plus size={15} /> Send Invite
              </PrimaryButton>
              {lastInviteUrl && (
                <button type="button" onClick={() => copyText(lastInviteUrl, 'invite')} className="flex items-center gap-2 text-xs font-bold text-neutral-700 hover:underline">
                  <Copy size={13} /> {copied === 'invite' ? 'Copied invite link' : 'Copy latest invite link'}
                </button>
              )}
            </Section>

            <Section title="Pending Invites">
              {team.invites.length === 0 ? (
                <p className="text-sm text-neutral-500">No pending invites.</p>
              ) : (
                <div className="space-y-3">
                  {team.invites.map((invite: any) => (
                    <div key={invite.id} className="rounded-md border border-neutral-200 p-3">
                      <div className="text-sm font-bold">{invite.email}</div>
                      <div className="text-xs text-neutral-500">{invite.role} - expires {formatDate(invite.expiresAt)}</div>
                      <div className="mt-2">
                        <InviteDeliveryBadge invite={invite} />
                      </div>
                      {invite.emailDeliveryError && (
                        <div className="mt-2 rounded-md border border-red-100 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700">
                          {invite.emailDeliveryError}
                        </div>
                      )}
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => resendInvite(invite.id)} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-bold hover:bg-neutral-50">Resend</button>
                        <button onClick={() => revokeInvite(invite.id)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Revoke</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="mt-6 space-y-6">
          <Section title="Current Plan">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Metric label="Plan" value={billing?.plan === 'company_pro' ? 'Company Pro' : 'Free'} />
              <Metric label="Status" value={billing?.status || 'inactive'} />
              <Metric label="Renews / Ends" value={formatDate(billing?.subscriptionEndDate)} />
              <Metric label="Candidates" value={String(billing?.usage?.candidates || 0)} />
            </div>
            <div className="flex flex-wrap gap-2 pt-3">
              <PrimaryButton onClick={upgradeBilling} disabled={saving || !canManage}>
                <CreditCard size={15} /> Upgrade Company Pro
              </PrimaryButton>
            </div>
          </Section>
          <Section title="Usage">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Metric label="Roles" value={String(billing?.usage?.roles || 0)} />
              <Metric label="Assessments" value={String(billing?.usage?.assessments || 0)} />
              <Metric label="Linked Repos" value={String(billing?.usage?.linkedRepos || 0)} />
              <Metric label="Candidates" value={String(billing?.usage?.candidates || 0)} />
            </div>
          </Section>
          <Section title="Billing History">
            {billing?.invoices?.length ? (
              <Table
                headers={['Date', 'Plan', 'Amount', 'Payment ID']}
                rows={billing.invoices.map((invoice: any) => [
                  formatDate(invoice.paidAt || invoice.createdAt),
                  invoice.plan,
                  `${invoice.currency} ${(invoice.amountInPaise / 100).toFixed(2)}`,
                  invoice.paymentId || 'N/A',
                ])}
              />
            ) : (
              <p className="text-sm text-neutral-500">No invoices yet.</p>
            )}
          </Section>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="mt-6 space-y-6">
          <Section title="Company Profile" description="This context is used when generating roles and assessments.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Display Name" value={profileForm.displayName || ''} onChange={(value) => setProfileForm({ ...profileForm, displayName: value })} />
              <Field label="Legal Name" value={profileForm.legalName || ''} onChange={(value) => setProfileForm({ ...profileForm, legalName: value })} />
              <Field label="Slug" value={profileForm.slug || ''} onChange={(value) => setProfileForm({ ...profileForm, slug: value })} />
              <Field label="Website" value={profileForm.website || ''} onChange={(value) => setProfileForm({ ...profileForm, website: value })} />
              <Field label="Support Email" value={profileForm.supportEmail || ''} onChange={(value) => setProfileForm({ ...profileForm, supportEmail: value })} />
              <Field label="Verification Email" value={profileForm.verificationEmail || ''} onChange={(value) => setProfileForm({ ...profileForm, verificationEmail: value })} />
              <Field label="Industry" value={profileForm.industry || ''} onChange={(value) => setProfileForm({ ...profileForm, industry: value })} />
              <Field label="Product Type" value={profileForm.productType || ''} onChange={(value) => setProfileForm({ ...profileForm, productType: value })} />
              <Field label="Domain" value={profileForm.domain || ''} onChange={(value) => setProfileForm({ ...profileForm, domain: value })} />
              <Field label="Logo URL" value={profileForm.logoUrl || ''} onChange={(value) => setProfileForm({ ...profileForm, logoUrl: value })} />
            </div>
            <TextArea label="What you do" value={profileForm.description || ''} onChange={(value) => setProfileForm({ ...profileForm, description: value })} />
            <TextArea label="Hiring Context" value={profileForm.companyContext || ''} onChange={(value) => setProfileForm({ ...profileForm, companyContext: value })} />
            <div className="flex justify-end">
              <PrimaryButton onClick={saveCompanyProfile} disabled={saving || !canManage}>Save Company Profile</PrimaryButton>
            </div>
          </Section>
          <Section title="Tech Stack From Integrations">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TagBlock title="Languages" values={companyProfile?.techContext?.languages || []} />
              <TagBlock title="Role-Relevant Skills" values={companyProfile?.techContext?.frameworks || []} />
              <TagBlock title="Infrastructure" values={companyProfile?.techContext?.infrastructure || []} />
              <TagBlock title="Architecture Patterns" values={companyProfile?.techContext?.architecturePatterns || []} />
            </div>
          </Section>
        </div>
      )}

      {activeTab === 'api-keys' && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Section title="Create API Key">
            <Field label="Key Name" value={apiKeyForm.name} onChange={(value) => setApiKeyForm({ ...apiKeyForm, name: value })} />
            <div className="space-y-2">
              <div className="text-xs font-semibold text-neutral-900">Scopes</div>
              {apiScopes.map((scope) => (
                <label key={scope} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={apiKeyForm.scopes.includes(scope)}
                    onChange={(event) => {
                      const scopes = event.target.checked
                        ? [...apiKeyForm.scopes, scope]
                        : apiKeyForm.scopes.filter((item) => item !== scope);
                      setApiKeyForm({ ...apiKeyForm, scopes });
                    }}
                  />
                  {scope}
                </label>
              ))}
            </div>
            <PrimaryButton onClick={createApiKey} disabled={saving || !canManage || !apiKeyForm.name || !apiKeyForm.scopes.length}>
              <Key size={15} /> Create Key
            </PrimaryButton>
            {newApiKey && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold text-amber-800"><AlertTriangle size={14} /> Copy this key now. It will not be shown again.</div>
                <div className="break-all rounded bg-white p-2 font-mono text-xs">{newApiKey}</div>
                <button type="button" onClick={() => copyText(newApiKey, 'api')} className="mt-2 text-xs font-bold text-amber-800 hover:underline">
                  {copied === 'api' ? 'Copied key' : 'Copy key'}
                </button>
              </div>
            )}
          </Section>
          <Section title="API Keys">
            {apiKeys.length === 0 ? (
              <p className="text-sm text-neutral-500">No API keys created yet.</p>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key: any) => (
                  <div key={key.id} className="rounded-md border border-neutral-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-sm font-bold">{key.name}</div>
                        <div className="mt-1 font-mono text-xs text-neutral-500">{key.prefix}... - Created {formatDate(key.createdAt)}</div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {key.scopes.map((scope: string) => <Tag key={scope}>{scope}</Tag>)}
                        </div>
                      </div>
                      {key.revokedAt ? (
                        <span className="rounded bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-500">Revoked</span>
                      ) : (
                        <button onClick={() => revokeApiKey(key.id)} className="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Revoke</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {activeTab === 'audit-log' && (
        <div className="mt-6">
          <Section title="Audit Log">
            {auditLog.length ? (
              <Table
                headers={['Time', 'Action', 'Actor', 'Target', 'Severity']}
                rows={auditLog.map((row) => [
                  new Date(row.createdAt).toLocaleString(),
                  row.action,
                  row.actorEmail || row.actorId || 'System',
                  row.target || 'N/A',
                  row.severity,
                ])}
              />
            ) : (
              <p className="text-sm text-neutral-500">No audit events yet.</p>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white">
      <div className="border-b border-neutral-100 p-5">
        <h2 className="font-mono text-lg font-bold">{title}</h2>
        {description && <p className="mt-1 text-xs text-neutral-500">{description}</p>}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-900">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-black"
      />
    </label>
  );
}

function PasswordField(props: { label: string; value: string; onChange: (value: string) => void }) {
  return <Field {...props} type="password" />;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-900">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-black"
      />
    </label>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-[#042614] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#031d0f] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function DangerButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-lg font-bold text-neutral-950">{value}</div>
    </div>
  );
}

function TagBlock({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="rounded-md border border-neutral-100 p-4">
      <div className="mb-2 text-xs font-semibold text-neutral-700">{title}</div>
      {values.length ? (
        <div className="flex flex-wrap gap-2">{values.map((value) => <Tag key={value}>{value}</Tag>)}</div>
      ) : (
        <div className="text-sm italic text-neutral-400">Not inferred</div>
      )}
    </div>
  );
}

function InviteDeliveryBadge({ invite }: { invite: any }) {
  const status = invite.emailDeliveryStatus || 'pending';
  if (status === 'sent') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
        <CheckCircle2 size={13} />
        Email sent
        {invite.emailSentAt ? ` ${formatDate(invite.emailSentAt)}` : ''}
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700">
        <AlertTriangle size={13} />
        Email failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
      <Loader2 size={13} className="animate-spin" />
      Email pending
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-medium text-neutral-700">{children}</span>;
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-500">
            {headers.map((header) => <th key={header} className="px-3 py-2">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-neutral-100">
              {row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`} className="px-3 py-3 align-top">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
