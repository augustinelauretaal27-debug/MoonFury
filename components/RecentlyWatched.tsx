"use client";

import { useWatchHistory, type HistoryItem } from "@/hooks/useWatchHistory";
import { useContentLookup } from "@/hooks/useContentLookup";
import Link from "next/link";
import { imageUrl, formatDate } from "@/lib/utils";
import { Clock } from "lucide-react";
import type { Content } from "@/data/movies";
import { useState, useEffect } from "react";

export function RecentlyWatched() {
  const { items, hydrated } = useWatchHistory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const recentItems = hydrated ? items.slice(0, 12) : [];
  const lookupEntries = recentItems.map((x) => ({ id: x.contentId, type: x.contentType }));
  const { contents } = useContentLookup(lookupEntries);

  if (!mounted || !hydrated) return null;

  const recent = recentItems
    .map((h) => ({ history: h, item: contents.get(h.contentId) }))
    .filter((x): x is { history: HistoryItem; item: Content } => Boolean(x.item));

  if (!recent.length) return null;

  return (
    <section className="shell mt-10">
      <div className="mb-4 flex items-center gap-2">
        <Clock size={20} className="text-purple-300" />
        <h2 className="text-xl font-bold sm:text-2xl">Recently Watched</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {recent.map(({ history, item }) => {
          const href =
            history.progress > 0 && history.progress < 0.95
              ? `/watch/${item.id}`
              : `/${item.type === "tv" ? "tv" : "movies"}/${item.id}`;
          return (
            <Link
              key={item.id + (history.episodeId || "")}
              href={href}
              className="card group relative overflow-hidden rounded-lg transition hover:border-cyan-300/40"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-slate-900">
                <img
                  src={imageUrl(item.poster, "w342")}
                  alt={item.title}
                  className="size-full object-cover transition duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300"
                    style={{ width: `${Math.round((history.progress || 0) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-semibold text-white">{item.title}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {formatDate(history.lastWatched)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
