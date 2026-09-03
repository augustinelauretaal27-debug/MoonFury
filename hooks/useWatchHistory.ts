"use client";

import { useEffect, useState, useCallback } from "react";
import { storage } from "@/lib/storage";

export type ContentType = "movie" | "tv";

export type HistoryItem = {
  contentId: string;
  contentType: ContentType;
  currentTime: number;
  duration: number;
  progress: number;
  lastWatched: number;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeId?: string;
  title?: string;
  poster?: string;
};

const KEY = "moonfury-history";
const MAX_ITEMS = 100;

export function useWatchHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(storage.get<HistoryItem[]>(KEY, []));
    setHydrated(true);
  }, []);

  const update = useCallback((item: HistoryItem) => {
    setItems((current) => {
      const others = current.filter(
        (x) => !(x.contentId === item.contentId && x.episodeId === item.episodeId)
      );
      const next = [item, ...others].slice(0, MAX_ITEMS);
      storage.set(KEY, next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string, episodeId?: string) => {
    setItems((v) => {
      const next = v.filter(
        (x) => !(x.contentId === id && (!episodeId || x.episodeId === episodeId))
      );
      storage.set(KEY, next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    storage.set(KEY, []);
    setItems([]);
  }, []);

  const get = useCallback(
    (contentId: string, episodeId?: string): HistoryItem | undefined => {
      return items.find(
        (x) =>
          x.contentId === contentId && (!episodeId || x.episodeId === episodeId)
      );
    },
    [items]
  );

  return { items, update, remove, clear, get, hydrated };
}
