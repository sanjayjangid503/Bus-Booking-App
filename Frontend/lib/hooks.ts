"use client";

import { useCallback, useEffect, useEffectEvent, useState, useSyncExternalStore } from "react";
import { toLocalYMD } from "./format";
import { errorMessage } from "./api";

const noopSubscribe = () => () => {};

/** False during SSR/prerender and the hydration pass, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Current time, refreshed every `interval` ms. Returns 0 on the server. */
export function useNow(interval = 1000) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const id = window.setInterval(cb, interval);
      return () => window.clearInterval(id);
    },
    [interval],
  );
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / interval) * interval,
    () => 0,
  );
}

/** Today's local date (YYYY-MM-DD), or "" before hydration. */
export function useToday() {
  const now = useNow(60_000);
  return now ? toLocalYMD(new Date(now)) : "";
}

interface QueryState<T> {
  key: string | null;
  data?: T;
  error?: string;
}

/**
 * Fetches whenever `key` changes (pass null to skip). Keeps the previous data
 * while a new request is in flight so the UI doesn't flash empty.
 */
export function useQuery<T>(key: string | null, fetcher: () => Promise<T>) {
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<QueryState<T>>({ key: null });
  const requestKey = key === null ? null : `${key}#${nonce}`;

  const run = useEffectEvent(() => fetcher());

  useEffect(() => {
    if (requestKey === null) return;
    let active = true;
    run().then(
      (data) => active && setState({ key: requestKey, data }),
      (err) => active && setState((s) => ({ key: requestKey, data: s.data, error: errorMessage(err) })),
    );
    return () => {
      active = false;
    };
  }, [requestKey]);

  const settled = state.key === requestKey;
  return {
    data: state.data,
    error: settled ? state.error : undefined,
    loading: requestKey !== null && !settled,
    refetch: useCallback(() => setNonce((n) => n + 1), []),
  };
}
