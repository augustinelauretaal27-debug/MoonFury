"use client";

import Link from "next/link";
import { Trash2, Play } from "lucide-react";
import { imageUrl, formatDate, formatTime } from "@/lib/utils";
import type { Content } from "@/data/movies";
import { useWatchHistory, type HistoryItem } from "@/hooks/useWatchHistory";

export function HistoryCard({
  item,
  history,
}: {
  item: Content;
  history: HistoryItem;
}) {
  const { remove } = useWatchHistory();
  const watchedPct = Math.round(history.progress * 100);

  return (
    <div className="card group flex flex-col gap-3 overflow-hidden rounded-xl p-3 transition hover:border-white/20 sm:flex-row sm:items-center sm:p-4">
      <Link
        href={`/watch/${item.id}`}
        className="relative block shrink-0 overflow-hidden rounded-lg sm:w-56"
      >
        <div className="aspect-video overflow-hidden bg-slate-900">
          <img
            src={imageUrl(item.backdrop, "w500")}
            alt={item.title}
            className="size-full object-cover transition duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          <span className="grid size-12 place-items-center rounded-full bg-cyan-400 text-[#071617]">
            <Play size={20} fill="#071617" />
          </span>
        </span>
        {history.episodeNumber && history.seasonNumber && (
          <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium backdrop-blur">
            S{history.seasonNumber} E{history.episodeNumber}
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              href={`/${item.type === "tv" ? "tv" : "movies"}/${item.id}`}
              className="block"
            >
              <h3 className="truncate text-base font-bold text-white transition group-hover:text-cyan-300">
                {item.title}
              </h3>
            </Link>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="capitalize">{item.type}</span>
              <span>•</span>
              <span>{item.year}</span>
              <span>•</span>
              <span className="text-purple-300">
                {item.genres.slice(0, 2).join(", ")}
              </span>
            </p>
          </div>
          <button
            onClick={() => remove(item.id, history.episodeId)}
            aria-label="Remove from history"
            className="grid size-9 shrink-0 place-items-center rounded-full text-slate-500 opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100 focus:opacity-100"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="mt-auto space-y-2">
          <div className="h-1 rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300"
              style={{ width: `${watchedPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>
              {history.progress >= 0.95
                ? "Completed"
                : `${formatTime(history.currentTime)} of ${formatTime(
                    history.duration
                  )} (${watchedPct}%)`}
            </span>
            <span>{formatDate(history.lastWatched)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
