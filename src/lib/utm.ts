const STORAGE_KEY = "renew:attribution";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

type UtmKey = (typeof UTM_KEYS)[number];
export type Utm = Partial<Record<UtmKey, string>>;
export type Attribution = Utm & { landing_path?: string; referrer?: string };

type StoredAttribution = { capturedAt: number; attribution: Attribution };
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

export function readAttribution(storage: Storage, now = Date.now()): Attribution | null {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredAttribution;
    if (typeof stored.capturedAt !== "number" || now - stored.capturedAt > MAX_AGE_MS) return null;
    return stored.attribution;
  } catch {
    return null;
  }
}

export function captureFirstTouch(storage: Storage, location: LocationLike, now = Date.now()) {
  const existing = readAttribution(storage, now);
  if (existing) return existing;

  const host = referrerHost(location.referrer);
  const attribution: Attribution = {
    ...parseUtm(location.search),
    landing_path: location.pathname,
    ...(host ? { referrer: host } : {}),
  };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ capturedAt: now, attribution }));
  } catch {
    // Storage can be full or blocked (Safari private mode); attribution is best-effort.
  }
  return attribution;
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
