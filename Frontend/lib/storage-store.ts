import { useSyncExternalStore } from "react";

/**
 * A tiny JSON store backed by localStorage/sessionStorage that React can
 * subscribe to with useSyncExternalStore. Renders null on the server.
 */
export function createStorageStore<T>(kind: "local" | "session", key: string) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null = null;
  let cachedValue: T | null = null;

  const storage = () => (kind === "local" ? window.localStorage : window.sessionStorage);

  function get(): T | null {
    let raw: string | null = null;
    try {
      raw = storage().getItem(key);
    } catch {
      raw = null;
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cachedValue = raw ? (JSON.parse(raw) as T) : null;
      } catch {
        cachedValue = null;
      }
    }
    return cachedValue;
  }

  function emit() {
    listeners.forEach((l) => l());
  }

  function set(value: T | null) {
    try {
      if (value === null) storage().removeItem(key);
      else storage().setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable (private mode); state simply won't persist.
    }
    emit();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function useValue() {
    return useSyncExternalStore(subscribe, get, () => null);
  }

  return { get, set, subscribe, useValue };
}
