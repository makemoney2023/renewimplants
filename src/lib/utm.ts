const STORAGE_KEY = "renew:attribution";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

type UtmKey = (typeof UTM_KEYS)[number];
export type Utm = Partial<Record<UtmKey, string>>;
export type Attribution = Utm & {
  landing_path?: string;
  referrer?: string;
  last_landing_path?: string;
  last_referrer?: string;
  last_utm_source?: string;
  last_utm_medium?: string;
  last_utm_campaign?: string;
  last_utm_term?: string;
  last_utm_content?: string;
};

type Touch = Utm & { landing_path?: string; referrer?: string };

type StoredAttribution = {
  capturedAt: number;
  attribution: Touch;
  lastCapturedAt: number;
  last: Touch;
};
type LocationLike = { search: string; pathname: string; referrer: string };

export function parseUtm(search: string): Utm {
  const params = new URLSearchParams(search);
  const utm: Utm = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) utm[key] = value.slice(0, 200);
  }
  return utm;
}

function referrerHost(referrer: string) {
  try {
    return referrer ? new URL(referrer).host : undefined;
  } catch {
    return undefined;
  }
}

function currentTouch(location: LocationLike): Touch {
  const host = referrerHost(location.referrer);
  return {
    ...parseUtm(location.search),
    landing_path: location.pathname,
    ...(host ? { referrer: host } : {}),
  };
}

function readStored(storage: Storage, now: number): StoredAttribution | null {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredAttribution;
    if (typeof stored.capturedAt !== "number" || now - stored.capturedAt > MAX_AGE_MS) return null;
    if (!stored.attribution || !stored.last) return null;
    return stored;
  } catch {
    return null;
  }
}

function mergeTouch(first: Touch, last: Touch): Attribution {
  return {
    ...first,
    ...(last.landing_path ? { last_landing_path: last.landing_path } : {}),
    ...(last.referrer ? { last_referrer: last.referrer } : {}),
    ...(last.utm_source ? { last_utm_source: last.utm_source } : {}),
    ...(last.utm_medium ? { last_utm_medium: last.utm_medium } : {}),
    ...(last.utm_campaign ? { last_utm_campaign: last.utm_campaign } : {}),
    ...(last.utm_term ? { last_utm_term: last.utm_term } : {}),
    ...(last.utm_content ? { last_utm_content: last.utm_content } : {}),
  };
}

export function readAttribution(storage: Storage, now = Date.now()): Attribution | null {
  const stored = readStored(storage, now);
  if (!stored) return null;
  return mergeTouch(stored.attribution, stored.last);
}

export function captureFirstTouch(storage: Storage, location: LocationLike, now = Date.now()) {
  const existing = readStored(storage, now);
  const touch = currentTouch(location);
  const record: StoredAttribution = existing
    ? { ...existing, lastCapturedAt: now, last: touch }
    : { capturedAt: now, attribution: touch, lastCapturedAt: now, last: touch };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage can be full or blocked (Safari private mode); attribution is best-effort.
  }
  return mergeTouch(record.attribution, record.last);
}

export function withUtm(path: string, utm: Utm) {
  const params = new URLSearchParams();
  for (const key of UTM_KEYS) {
    const value = utm[key];
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${path}${path.includes("?") ? "&" : "?"}${query}` : path;
}
