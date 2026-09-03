"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Content } from "@/data/movies";
import { useWatchHistory, type HistoryItem } from "@/hooks/useWatchHistory";
import { useContentLookup } from "@/hooks/useContentLookup";
import { HistoryCard } from "@/components/HistoryCard";
import { EmptyState } from "@/components/EmptyState";
import { Trash2, Clock, ChevronRight } from "lucide-react";

export default function HistoryPage() {
  const { items, clear, hydrated } = useWatchHistory();
  const [mounted, setMounted] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const lookupEntries = hydrated ? items.map((h) => ({ id: h.contentId, type: h.contentType })) : [];
  const { contents, loading } = useContentLookup(lookupEntries);

  const entries = items
    .map((h) => ({ history: h, item: contents.get(h.contentId) }))
    .filter((x): x is { history: HistoryItem; item: Content } => Boolean(x.item));

  const moviesCount = entries.filter((e) => e.history.contentType === "movie").length;
  const seriesCount = entries.length - moviesCount;
  const totalHours = entries.reduce((acc, e) => acc + (e.history.currentTime || 0), 0);
  const totalHrsRounded = Math.round((totalHours / 3600) * 10) / 10;

  return (
    <div className="py-8">
      <div className="shell">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-300">
              Activity
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Watch History
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Everything you&apos;ve watched on MoonFury. Stored only in your browser.
            </p>
          </div>
          {mounted && hydrated && entries.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden items-center gap-4 rounded-xl border border-white/10 px-5 py-3 text-sm sm:flex">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">{entries.length}</p>
                  <p className="text-xs text-slate-500">titles</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-cyan-300">{totalHrsRounded}h</p>
                  <p className="text-xs text-slate-500">watched</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-purple-300">{seriesCount}</p>
                  <p className="text-xs text-slate-500">episodes</p>
                </div>
              </div>
              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                  Clear History
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { clear(); setConfirmClear(false); }}
                    className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-600"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {!mounted || !hydrated || loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card h-36 animate-pulse rounded-xl sm:h-40" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            title="Your watch history is empty"
            description="Once you start watching MoonFury, your progress will appear here."
            actionHref="/movies"
            actionLabel="Browse Movies"
          />
        ) : (
          <div className="space-y-3">
            {entries.map(({ history, item }) => (
              <HistoryCard
                key={item.id + (history.episodeId || "")}
                item={item}
                history={history}
              />
            ))}
          </div>
        )}

        <div className="mt-12 rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-purple-300/20 bg-purple-300/5 text-purple-300">
              <Clock size={20} />
            </span>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Private by Design
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-400">
                MoonFury never leaves your device. Watch history, progress, and
                preferences are saved in your browser&apos;s local storage and are never
                sent to a server.
              </p>
              <Link
                href="/settings"
                className="mt-3 inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200"
              >
                Manage preferences
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
