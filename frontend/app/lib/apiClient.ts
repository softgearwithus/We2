export const SESSION_REVOKING_FLAG = 'emble.auth.revoking';
export const SESSION_REVOKED_EVENT = 'emble.auth.revoked';

function isSessionRevokedError(status: number, payload: any) {
  if (status !== 401) return false;
  return payload?.code === 'SESSION_REVOKED' || payload?.message === 'Session revoked';
}

export async function fetchApi(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);

  if (typeof window !== 'undefined' && response.status === 401) {
    try {
      const payload = await response.clone().json();
      if (isSessionRevokedError(response.status, payload)) {
        const url = typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString();
        if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
          if (sessionStorage.getItem(SESSION_REVOKING_FLAG) !== '1') {
            sessionStorage.setItem(SESSION_REVOKING_FLAG, '1');
            window.dispatchEvent(new Event(SESSION_REVOKED_EVENT));
          }
        }
      }
    } catch (err) {
      // Ignored: clone().json() failed or could not be parsed
    }
  }

  return response;
}
