import API_BASE_URL from './api-config';
import { fetchApi } from './apiClient';

const jsonHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

async function parseResponse(response: Response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error?.message ||
      payload?.error ||
      'Request failed.';
    throw new Error(Array.isArray(message) ? message.join(', ') : String(message));
  }
  return payload;
}

export const companySettingsApi = {
  getProfile: (token: string) =>
    fetchApi(`${API_BASE_URL}/company-settings/profile`, {
      headers: authHeaders(token),
    }).then(parseResponse),

  updateProfile: (token: string, payload: Record<string, any>) =>
    fetchApi(`${API_BASE_URL}/company-settings/profile`, {
      method: 'PATCH',
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    }).then(parseResponse),

  getTeam: (token: string) =>
    fetchApi(`${API_BASE_URL}/company-settings/team`, {
      headers: authHeaders(token),
    }).then(parseResponse),

  inviteMember: (token: string, payload: { email: string; role: string }) =>
    fetchApi(`${API_BASE_URL}/company-settings/team/invites`, {
      method: 'POST',
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    }).then(parseResponse),

  resendInvite: (token: string, id: string) =>
    fetchApi(`${API_BASE_URL}/company-settings/team/invites/${id}/resend`, {
      method: 'POST',
      headers: authHeaders(token),
    }).then(parseResponse),

  revokeInvite: (token: string, id: string) =>
    fetchApi(`${API_BASE_URL}/company-settings/team/invites/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }).then(parseResponse),

  updateMember: (token: string, id: string, role: string) =>
    fetchApi(`${API_BASE_URL}/company-settings/team/members/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders(token),
      body: JSON.stringify({ role }),
    }).then(parseResponse),

  removeMember: (token: string, id: string) =>
    fetchApi(`${API_BASE_URL}/company-settings/team/members/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }).then(parseResponse),

  getBilling: (token: string) =>
    fetchApi(`${API_BASE_URL}/company-settings/billing`, {
      headers: authHeaders(token),
    }).then(parseResponse),

  createBillingOrder: (token: string, plan = 'company_pro_1m') =>
    fetchApi(`${API_BASE_URL}/company-settings/billing/order`, {
      method: 'POST',
      headers: jsonHeaders(token),
      body: JSON.stringify({ plan }),
    }).then(parseResponse),

  verifyBilling: (token: string, payload: Record<string, string>) =>
    fetchApi(`${API_BASE_URL}/company-settings/billing/verify`, {
      method: 'POST',
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    }).then(parseResponse),

  listApiKeys: (token: string) =>
    fetchApi(`${API_BASE_URL}/company-settings/api-keys`, {
      headers: authHeaders(token),
    }).then(parseResponse),

  createApiKey: (token: string, payload: { name: string; scopes: string[] }) =>
    fetchApi(`${API_BASE_URL}/company-settings/api-keys`, {
      method: 'POST',
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    }).then(parseResponse),

  revokeApiKey: (token: string, id: string) =>
    fetchApi(`${API_BASE_URL}/company-settings/api-keys/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }).then(parseResponse),

  listAuditLog: (token: string) =>
    fetchApi(`${API_BASE_URL}/company-settings/audit-log`, {
      headers: authHeaders(token),
    }).then(parseResponse),

  deactivateAccount: (token: string, password: string) =>
    fetchApi(`${API_BASE_URL}/company-settings/account/deactivate`, {
      method: 'POST',
      headers: jsonHeaders(token),
      body: JSON.stringify({ password }),
    }).then(parseResponse),

  changePassword: (
    token: string,
    payload: { currentPassword: string; newPassword: string },
  ) =>
    fetchApi(`${API_BASE_URL}/users/security/password`, {
      method: 'POST',
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    }).then(parseResponse),

  setupTwoFactor: (token: string) =>
    fetchApi(`${API_BASE_URL}/users/security/2fa/setup`, {
      method: 'POST',
      headers: authHeaders(token),
    }).then(parseResponse),

  enableTwoFactor: (token: string, code: string) =>
    fetchApi(`${API_BASE_URL}/users/security/2fa/enable`, {
      method: 'POST',
      headers: jsonHeaders(token),
      body: JSON.stringify({ code }),
    }).then(parseResponse),

  disableTwoFactor: (
    token: string,
    payload: { currentPassword: string; code?: string },
  ) =>
    fetchApi(`${API_BASE_URL}/users/security/2fa/disable`, {
      method: 'POST',
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    }).then(parseResponse),

  previewInvite: (token: string) =>
    fetchApi(
      `${API_BASE_URL}/company-settings/team/invites/preview?token=${encodeURIComponent(token)}`,
    ).then(parseResponse),

  acceptInvite: (payload: {
    token: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    twoFactorCode?: string;
  }) =>
    fetchApi(`${API_BASE_URL}/company-settings/team/invites/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(parseResponse),

  updateUserProfile: (token: string, payload: Record<string, any>) =>
    fetchApi(`${API_BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    }).then(parseResponse),
};
