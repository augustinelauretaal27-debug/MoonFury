"use client";

import { useEffect, useState, useCallback } from "react";
import { storage } from "@/lib/storage";
import type { ContentType } from "@/data/movies";

export type WatchlistEntry = {
  id: string;
  type: ContentType;
};

const KEY = "moonfury-watchlist";

/** Migrate legacy string[] → WatchlistEntry[] */
function migrate(raw: unknown): WatchlistEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") return { id: item, type: "movie" as ContentType };
    if (typeof item === "object" && item !== null && "id" in item) return item as WatchlistEntry;
    return null;
  }).filter((x): x is WatchlistEntry => x !== null);
}

export function useWatchlist() {
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = storage.get<unknown>(KEY, []);
    setEntries(migrate(raw));
    setHydrated(true);
  }, []);

  const ids = entries.map((e) => e.id);

  const add = useCallback((id: string, type: ContentType = "movie") => {
    setEntries((v) => {
      if (v.some((e) => e.id === id)) return v;
      const next = [{ id, type }, ...v];
      storage.set(KEY, next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((v) => {
      const next = v.filter((e) => e.id !== id);
      storage.set(KEY, next);
      return next;
    });
  }, []);

  const toggle = useCallback((id: string, type: ContentType = "movie") => {
    setEntries((v) => {
      const next = v.some((e) => e.id === id)
        ? v.filter((e) => e.id !== id)
        : [{ id, type }, ...v];
      storage.set(KEY, next);
      return next;
    });
  }, []);

  const getType = useCallback(
    (id: string): ContentType | undefined => entries.find((e) => e.id === id)?.type,
    [entries]
  );

  return {
    entries,
    ids,
    add,
    remove,
    toggle,
    has: (id: string) => entries.some((e) => e.id === id),
    getType,
    hydrated,
  };
}
