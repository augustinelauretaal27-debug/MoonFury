"use client";

import { useState, useEffect } from "react";
import type { Content, ContentType } from "@/data/movies";

const cache = new Map<string, Content | null>();

async function fetchContent(id: string, type?: ContentType): Promise<Content | null> {
  const cacheKey = type ? `${id}:${type}` : id;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;
  try {
    const url = type ? `/api/content/${id}?type=${type}` : `/api/content/${id}`;
    const res = await fetch(url);
    if (!res.ok) {
      cache.set(cacheKey, null);
      return null;
    }
    const data = await res.json();
    cache.set(cacheKey, data.content ?? null);
    return data.content ?? null;
  } catch {
    cache.set(cacheKey, null);
    return null;
  }
}

export type LookupEntry = { id: string; type?: ContentType };

/**
 * Resolves content IDs to Content objects via TMDB.
 * Pass type hints via entries array for accurate movie/TV resolution.
 */
export function useContentLookup(entries: LookupEntry[]): {
  contents: Map<string, Content>;
  loading: boolean;
} {
  const [contents, setContents] = useState<Map<string, Content>>(new Map());
  const [loading, setLoading] = useState(false);

  const key = entries.map((e) => `${e.id}:${e.type ?? ""}`).join(",");

  useEffect(() => {
    if (entries.length === 0) return;

    const missing = entries.filter((e) => {
      const cacheKey = e.type ? `${e.id}:${e.type}` : e.id;
      return !cache.has(cacheKey);
    });

    if (missing.length === 0) {
      const map = new Map<string, Content>();
      for (const e of entries) {
        const cacheKey = e.type ? `${e.id}:${e.type}` : e.id;
        const c = cache.get(cacheKey);
        if (c) map.set(e.id, c);
      }
      setContents(map);
      return;
    }

    setLoading(true);
    Promise.all(missing.map((e) => fetchContent(e.id, e.type))).then(() => {
      const map = new Map<string, Content>();
      for (const e of entries) {
        const cacheKey = e.type ? `${e.id}:${e.type}` : e.id;
        const c = cache.get(cacheKey);
        if (c) map.set(e.id, c);
      }
      setContents(map);
      setLoading(false);
    });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return { contents, loading };
}
