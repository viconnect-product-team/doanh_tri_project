import { useSyncExternalStore } from "react";
import { vi, type Dict } from "./vi";
import { en } from "./en";

export type Locale = "vi" | "en";
const dicts: Record<Locale, Dict> = { vi, en };
const STORAGE_KEY = "locale";

let current: Locale = "vi";
const listeners = new Set<() => void>();

export function getLocale() { return current; }

export function setLocale(l: Locale) {
  if (l === current) return;
  current = l;
  try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  if (typeof document !== "undefined") document.documentElement.lang = l;
  listeners.forEach((fn) => fn());
}

/** Call from useEffect on the client to restore the saved language. */
export function restoreLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "vi") setLocale(saved);
  } catch { /* ignore */ }
}

export function useLocale(): Locale {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    () => current,
    () => "vi",
  );
}

/** Live dictionary: always reads the active language. */
export const t = new Proxy({} as Dict, {
  get: (_, key) => dicts[current][key as keyof Dict],
});
