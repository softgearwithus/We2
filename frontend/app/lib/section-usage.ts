import { fetchPublicPlatformSettings } from './admin-settings';

export type SectionUsageState = {
    remainingSeconds: number;
    usedSeconds: number;
    limitSeconds: number;
    isLimited: boolean;
    lastResetAt: string | null;
};

type FreeTierSettings = {
    limitSeconds: number;
    resetAt: string | null;
    fetchedAt: number;
};

type UsageRecord = {
    usedSeconds: number;
    limitSeconds: number;
    lastTickAt: number | null;
    resetAt: string | null;
    tamperLocked?: boolean;
    signatureVersion?: number;
    signature: string;
};

const SETTINGS_STORAGE_KEY = 'emble.freeTier.settings';
const SECRET_STORAGE_KEY = 'emble.freeTier.secret';
const USAGE_STORAGE_PREFIX = 'emble.freeTier.usage.v2';
const USAGE_SHADOW_PREFIX = 'emble.freeTier.usage.shadow.v2';
const LOCK_STORAGE_PREFIX = 'emble.freeTier.lock';
const ACTIVE_SECTION_PREFIX = 'emble.freeTier.activeSection';
const SETTINGS_TTL_MS = 60 * 1000;
const SIGNING_SALT = 'emble_free_tier_v1';
const SIGNATURE_VERSION = 1;

const SESSION_ID = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

let settingsCache: FreeTierSettings | null = null;

const safeParse = <T>(raw: string | null): T | null => {
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
};

const hashString = (value: string) => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
};

const getSecret = () => {
    if (typeof window === 'undefined') return 'server';
    const storage = window.localStorage;
    let secret = storage.getItem(SECRET_STORAGE_KEY);
    if (!secret) {
        const bytes = new Uint8Array(16);
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            crypto.getRandomValues(bytes);
        } else {
            for (let i = 0; i < bytes.length; i += 1) {
                bytes[i] = Math.floor(Math.random() * 256);
            }
        }
        secret = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
        storage.setItem(SECRET_STORAGE_KEY, secret);
    }
    return secret;
};

const buildSignature = (
    record: Omit<UsageRecord, 'signature'>,
    sectionKey: string,
    userId?: string | null,
    signatureVersion = SIGNATURE_VERSION,
) => {
    const payload = [
        sectionKey,
        String(record.usedSeconds),
        String(record.limitSeconds),
        String(record.lastTickAt || 0),
        record.resetAt || '',
        record.tamperLocked ? '1' : '0',
        String(signatureVersion),
        userId || '',
        getSecret(),
        SIGNING_SALT,
    ].join('|');
    return hashString(payload);
};

const getUsageKey = (sectionKey: string, userId?: string | null) => `${USAGE_STORAGE_PREFIX}.${sectionKey}.${userId || 'guest'}`;
const getUsageShadowKey = (sectionKey: string, userId?: string | null) => `${USAGE_SHADOW_PREFIX}.${sectionKey}.${userId || 'guest'}`;
const getLockKey = (sectionKey: string, userId?: string | null) => `${LOCK_STORAGE_PREFIX}.${sectionKey}.${userId || 'guest'}`;
const getActiveSectionKey = (userId?: string | null) => `${ACTIVE_SECTION_PREFIX}.${userId || 'guest'}`;

const setActiveSection = (sectionKey: string, userId?: string | null) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(getActiveSectionKey(userId), JSON.stringify({ sectionKey, updatedAt: Date.now() }));
};

const getActiveSection = (userId?: string | null) => {
    if (typeof window === 'undefined') return null;
    return safeParse<{ sectionKey: string; updatedAt: number }>(
        window.localStorage.getItem(getActiveSectionKey(userId)),
    );
};

const buildState = (record: UsageRecord): SectionUsageState => {
    const limitSeconds = record.limitSeconds;
    const usedSeconds = Math.max(0, record.usedSeconds);
    const remainingSeconds = Number.isFinite(limitSeconds)
        ? Math.max(0, limitSeconds - usedSeconds)
        : limitSeconds;
    return {
        remainingSeconds,
        usedSeconds,
        limitSeconds,
        isLimited: Number.isFinite(limitSeconds) && (remainingSeconds <= 0 || Boolean(record.tamperLocked)),
        lastResetAt: record.resetAt,
    };
};

const persistRecord = (sectionKey: string, record: Omit<UsageRecord, 'signature'>, userId?: string | null) => {
    if (typeof window === 'undefined') return;
    const storage = window.localStorage;
    const withSignature: UsageRecord = {
        ...record,
        signatureVersion: SIGNATURE_VERSION,
        signature: buildSignature(record, sectionKey, userId, SIGNATURE_VERSION),
    };
    storage.setItem(getUsageKey(sectionKey, userId), JSON.stringify(withSignature));
    storage.setItem(getUsageShadowKey(sectionKey, userId), JSON.stringify(withSignature));
};

const loadSettings = async (): Promise<FreeTierSettings> => {
    if (typeof window === 'undefined') {
        return { limitSeconds: 10 * 60, resetAt: null, fetchedAt: Date.now() };
    }
    const now = Date.now();
    if (settingsCache && now - settingsCache.fetchedAt < SETTINGS_TTL_MS) {
        return settingsCache;
    }
    try {
        const data = await fetchPublicPlatformSettings();
        const limitMinutes = Number.isFinite(data.freeTierLimitMinutes)
            ? Number(data.freeTierLimitMinutes)
            : 10;
        const limitSeconds = Math.max(0, limitMinutes * 60);
        const resetAt = data.freeTierResetAt ? new Date(data.freeTierResetAt).toISOString() : null;
        settingsCache = { limitSeconds, resetAt, fetchedAt: now };
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsCache));
        return settingsCache;
    } catch {
        const stored = safeParse<FreeTierSettings>(window.localStorage.getItem(SETTINGS_STORAGE_KEY));
        if (stored) {
            settingsCache = { ...stored, fetchedAt: now };
            return settingsCache;
        }
        settingsCache = { limitSeconds: 10 * 60, resetAt: null, fetchedAt: now };
        return settingsCache;
    }
};

const fetchLatestSettings = async (): Promise<FreeTierSettings> => {
    if (typeof window === 'undefined') {
        return { limitSeconds: 10 * 60, resetAt: null, fetchedAt: Date.now() };
    }
    const now = Date.now();
    try {
        const data = await fetchPublicPlatformSettings();
        const limitMinutes = Number.isFinite(data.freeTierLimitMinutes)
            ? Number(data.freeTierLimitMinutes)
            : 10;
        const limitSeconds = Math.max(0, limitMinutes * 60);
        const resetAt = data.freeTierResetAt ? new Date(data.freeTierResetAt).toISOString() : null;
        const latest = { limitSeconds, resetAt, fetchedAt: now };
        settingsCache = latest;
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(latest));
        return latest;
    } catch {
        return loadSettings();
    }
};

const refreshSettingsIfNeeded = async () => {
    if (typeof window === 'undefined') return;
    const latest = await fetchLatestSettings();
    const stored = safeParse<FreeTierSettings>(window.localStorage.getItem(SETTINGS_STORAGE_KEY));
    if (!stored || latest.resetAt !== stored.resetAt || latest.limitSeconds !== stored.limitSeconds) {
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(latest));
    }
};

const sanitizeRecord = (
    sectionKey: string,
    raw: UsageRecord | null,
    settings: FreeTierSettings,
    userId?: string | null,
) => {
    const now = Date.now();
    const limitSeconds = settings.limitSeconds;

    if (!raw) {
        const fresh = {
            usedSeconds: 0,
            limitSeconds,
            lastTickAt: now,
            resetAt: settings.resetAt,
            tamperLocked: false,
        };
        persistRecord(sectionKey, fresh, userId);
        return fresh;
    }

    const { signature, signatureVersion, ...rest } = raw;
    if (!signatureVersion) {
        const legacyPayload = [
            sectionKey,
            String(rest.usedSeconds),
            String(rest.limitSeconds),
            String(rest.lastTickAt || 0),
            rest.resetAt || '',
            rest.tamperLocked ? '1' : '0',
            userId || '',
            SIGNING_SALT,
        ].join('|');
        const legacyHash = hashString(legacyPayload);
        if (signature !== legacyHash) {
            const locked = {
                usedSeconds: limitSeconds,
                limitSeconds,
                lastTickAt: now,
                resetAt: settings.resetAt,
                tamperLocked: true,
            };
            persistRecord(sectionKey, locked, userId);
            return locked;
        }
        const upgraded = {
            ...rest,
            limitSeconds,
        };
        persistRecord(sectionKey, upgraded, userId);
        return upgraded;
    }
    if (signatureVersion !== SIGNATURE_VERSION) {
        const fresh = {
            usedSeconds: 0,
            limitSeconds,
            lastTickAt: now,
            resetAt: settings.resetAt,
            tamperLocked: false,
        };
        persistRecord(sectionKey, fresh, userId);
        return fresh;
    }
    const expected = buildSignature(rest, sectionKey, userId, signatureVersion);
    const invalidValues =
        !Number.isFinite(rest.usedSeconds) ||
        rest.usedSeconds < 0 ||
        !Number.isFinite(rest.limitSeconds) ||
        rest.limitSeconds < 0 ||
        (rest.lastTickAt !== null && !Number.isFinite(rest.lastTickAt));

    if (rest.lastTickAt && rest.lastTickAt > now + 2000) {
        const locked = {
            usedSeconds: limitSeconds,
            limitSeconds,
            lastTickAt: now,
            resetAt: settings.resetAt,
            tamperLocked: true,
        };
        persistRecord(sectionKey, locked, userId);
        return locked;
    }

    if (signature !== expected || invalidValues) {
        const locked = {
            usedSeconds: limitSeconds,
            limitSeconds,
            lastTickAt: now,
            resetAt: settings.resetAt,
            tamperLocked: true,
        };
        persistRecord(sectionKey, locked, userId);
        return locked;
    }

    const next = { ...rest };
    if (settings.resetAt && next.resetAt !== settings.resetAt) {
        next.usedSeconds = 0;
        next.lastTickAt = now;
        next.resetAt = settings.resetAt;
        next.tamperLocked = false;
    }

    next.limitSeconds = limitSeconds;
    if (next.usedSeconds > limitSeconds) {
        next.usedSeconds = limitSeconds;
    }

    persistRecord(sectionKey, next, userId);
    return next;
};

const shouldTick = (sectionKey: string, userId?: string | null) => {
    if (typeof window === 'undefined') return false;
    const storage = window.localStorage;
    const now = Date.now();
    const lockKey = getLockKey(sectionKey, userId);
    const lock = safeParse<{ sessionId: string; lastSeenAt: number }>(storage.getItem(lockKey));
    if (!lock || lock.sessionId === SESSION_ID || now - lock.lastSeenAt > 4000) {
        storage.setItem(lockKey, JSON.stringify({ sessionId: SESSION_ID, lastSeenAt: now }));
        return true;
    }
    return false;
};

const tickRecord = (
    sectionKey: string,
    record: UsageRecord,
    settings: FreeTierSettings,
    userId?: string | null,
) => {
    if (typeof window === 'undefined') return record;
    if (record.tamperLocked) return record;
    const now = Date.now();
    const isVisible = document.visibilityState === 'visible' && document.hasFocus();
    const lastTick = record.lastTickAt ?? now;

    if (!isVisible) {
        const updated = { ...record, lastTickAt: now };
        persistRecord(sectionKey, updated, userId);
        return updated;
    }

    const deltaMs = Math.max(0, now - lastTick);
    const deltaSeconds = Math.floor(deltaMs / 1000);
    if (deltaSeconds <= 0) {
        return record;
    }

    if (deltaSeconds > 300) {
        const updated = {
            ...record,
            lastTickAt: now,
        };
        persistRecord(sectionKey, updated, userId);
        return updated;
    }

    const nextUsed = Math.min(settings.limitSeconds, record.usedSeconds + deltaSeconds);
    const updated = {
        ...record,
        usedSeconds: nextUsed,
        lastTickAt: lastTick + deltaSeconds * 1000,
    };
    persistRecord(sectionKey, updated, userId);
    return updated;
};

const activeTimers = new Map<string, { refs: number; timerId: number }>();

const runTick = async (sectionKey: string, userId?: string | null) => {
    if (!shouldTick(sectionKey, userId)) return;
    const active = getActiveSection(userId);
    if (!active || active.sectionKey !== sectionKey) return;
    const settings = await fetchLatestSettings();
    const storage = window.localStorage;
    const primary = safeParse<UsageRecord>(storage.getItem(getUsageKey(sectionKey, userId)));
    const shadow = safeParse<UsageRecord>(storage.getItem(getUsageShadowKey(sectionKey, userId)));
    const raw = primary && shadow && primary.signature === shadow.signature ? primary : primary || shadow;
    const record = sanitizeRecord(sectionKey, raw, settings, userId);
    tickRecord(sectionKey, record, settings, userId);
};

const touchSection = async (sectionKey: string, userId?: string | null) => {
    if (typeof window === 'undefined') return;
    const settings = await fetchLatestSettings();
    const storage = window.localStorage;
    const primary = safeParse<UsageRecord>(storage.getItem(getUsageKey(sectionKey, userId)));
    const shadow = safeParse<UsageRecord>(storage.getItem(getUsageShadowKey(sectionKey, userId)));
    const raw = primary && shadow && primary.signature === shadow.signature ? primary : primary || shadow;
    const record = sanitizeRecord(sectionKey, raw, settings, userId);
    if (record.tamperLocked) return;
    const updated = {
        ...record,
        lastTickAt: Date.now(),
    };
    persistRecord(sectionKey, updated, userId);
};

export const fetchSectionUsage = async (sectionKey: string, userId?: string | null): Promise<SectionUsageState> => {
    if (typeof window === 'undefined') {
        return {
            remainingSeconds: 0,
            usedSeconds: 0,
            limitSeconds: 0,
            isLimited: false,
            lastResetAt: null,
        };
    }
    const settings = await fetchLatestSettings();
    const storage = window.localStorage;
    const primary = safeParse<UsageRecord>(storage.getItem(getUsageKey(sectionKey, userId)));
    const shadow = safeParse<UsageRecord>(storage.getItem(getUsageShadowKey(sectionKey, userId)));
    const raw = primary && shadow && primary.signature === shadow.signature ? primary : primary || shadow;
    const record = sanitizeRecord(sectionKey, raw, settings, userId);
    return buildState(record);
};

export const startSectionUsage = async (sectionKey: string, userId?: string | null): Promise<SectionUsageState> => {
    await refreshSettingsIfNeeded();
    setActiveSection(sectionKey, userId);
    const state = await fetchSectionUsage(sectionKey, userId);
    if (state.isLimited || typeof window === 'undefined') {
        return state;
    }

    await touchSection(sectionKey, userId);

    const current = activeTimers.get(sectionKey);
    if (current) {
        current.refs += 1;
        return state;
    }

    const timerId = window.setInterval(() => {
        runTick(sectionKey, userId).catch(() => undefined);
    }, 1000);
    activeTimers.set(sectionKey, { refs: 1, timerId });
    return state;
};

export const heartbeatSectionUsage = async (sectionKey: string, userId?: string | null): Promise<SectionUsageState> => {
    if (typeof window === 'undefined') {
        return fetchSectionUsage(sectionKey, userId);
    }
    const active = getActiveSection(userId);
    if (!active || active.sectionKey !== sectionKey) {
        return fetchSectionUsage(sectionKey, userId);
    }
    await runTick(sectionKey, userId).catch(() => undefined);
    return fetchSectionUsage(sectionKey, userId);
};

export const stopSectionUsage = async (sectionKey: string, userId?: string | null): Promise<SectionUsageState> => {
    if (typeof window !== 'undefined') {
        const current = activeTimers.get(sectionKey);
        if (current) {
            current.refs -= 1;
            if (current.refs <= 0) {
                window.clearInterval(current.timerId);
                activeTimers.delete(sectionKey);
            }
        }
    }
    return fetchSectionUsage(sectionKey, userId);
};

if (typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
        refreshSettingsIfNeeded().catch(() => undefined);
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            refreshSettingsIfNeeded().catch(() => undefined);
        }
    });
}
