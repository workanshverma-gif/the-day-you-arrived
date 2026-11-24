"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/**
 * Wall-clock time that is hydration-safe: the server (and the first client render) get 0,
 * then the real time arrives after mount and ticks every `intervalMs`.
 */
export function useNowMs(intervalMs: number): number {
  const subscribe = useCallback(
    (cb: () => void) => {
      const id = setInterval(cb, intervalMs);
      return () => clearInterval(id);
    },
    [intervalMs],
  );
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => 0,
  );
}

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "ok"; data: T };

/**
 * Runs `fn` whenever `key` changes (null = don't run). Loading state is derived from the key,
 * so stale results are never shown for a new request.
 */
export function useAsync<T>(key: string | null, fn: (signal: AbortSignal) => Promise<T>): AsyncState<T> {
  const [res, setRes] = useState<{ key: string | null; data?: T; error?: boolean }>({ key: null });

  useEffect(() => {
    if (key === null) return;
    const ac = new AbortController();
    fn(ac.signal)
      .then((data) => setRes({ key, data }))
      .catch(() => {
        if (!ac.signal.aborted) setRes({ key, error: true });
      });
    return () => ac.abort();
    // `fn` closes over exactly what `key` encodes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (key === null) return { status: "idle" };
  if (res.key !== key) return { status: "loading" };
  if (res.error) return { status: "error" };
  return { status: "ok", data: res.data as T };
}

export function useDebounced<T>(value: T, delayMs: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return v;
}

/** Today's date as YYYY-MM-DD (local), or "" during SSR/hydration so markup matches. */
export function useToday(): string {
  return useSyncExternalStore(
    () => () => {},
    () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    () => "",
  );
}
