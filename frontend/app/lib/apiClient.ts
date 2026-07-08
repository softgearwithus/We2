export const SESSION_REVOKING_FLAG = 'emble.auth.revoking';
export const SESSION_REVOKED_EVENT = 'emble.auth.revoked';

const SESSION_REVOKED_CODE = 'SESSION_REVOKED';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const asString = (value: unknown) =>
  typeof value === 'string' ? value : '';

const payloadText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (!isRecord(value)) return '';

  const message = asString(value.message);
  const error = value.error;
  const nestedMessage = isRecord(error) ? asString(error.message) : asString(error);
  const nestedCode = isRecord(error) ? asString(error.code) : '';
  const messageCode = isRecord(value.message) ? asString(value.message.code) : '';

  return [message, nestedMessage, nestedCode, messageCode].filter(Boolean).join(' ');
};

export function isSessionRevokedError(status: number, payload: unknown) {
  if (status !== 401) return false;
  if (!isRecord(payload)) return false;

  const code = asString(payload.code);
  const errorCode = isRecord(payload.error) ? asString(payload.error.code) : '';
  const messageCode = isRecord(payload.message) ? asString(payload.message.code) : '';
  const text = payloadText(payload);
  const normalizedText = text.toUpperCase();

  return (
    code === SESSION_REVOKED_CODE ||
    errorCode === SESSION_REVOKED_CODE ||
    messageCode === SESSION_REVOKED_CODE ||
    normalizedText.includes(SESSION_REVOKED_CODE) ||
    text.toLowerCase().includes('logged in on another device') ||
    text.toLowerCase().includes('session revoked')
  );
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
