const DEFAULT_TTL_MS = 5 * 60 * 1000;

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getClientCache<T>(key: string): T | null {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  try {
    const entry = JSON.parse(rawValue) as CacheEntry<T>;

    if (Date.now() > entry.expiresAt) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    return entry.value;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

export function setClientCache<T>(
  key: string,
  value: T,
  ttlMs = DEFAULT_TTL_MS,
) {
  if (!isBrowser()) {
    return;
  }

  const entry: CacheEntry<T> = {
    expiresAt: Date.now() + ttlMs,
    value,
  };

  window.sessionStorage.setItem(key, JSON.stringify(entry));
}

export function removeClientCache(key: string) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(key);
}
