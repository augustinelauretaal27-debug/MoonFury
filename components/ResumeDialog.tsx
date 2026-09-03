"use client";

import { useEffect, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import type { Content } from "@/data/movies";
import { imageUrl, formatTime } from "@/lib/utils";
import { useWatchHistory, type HistoryItem } from "@/hooks/useWatchHistory";

export function ResumeDialog({
  item,
  onResume,
  onStartOver,
  episodeTitle,
}: {
  item: Content;
  onResume: () => void;
  onStartOver: () => void;
  episodeTitle?: string;
}) {
  const { get, hydrated } = useWatchHistory();
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<HistoryItem | undefined>();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hydrated && mounted) {
      // If series with specific episode, the caller handles it
      // For now find the most recent for this content
      const all = get(item.id);
      setHistory(all);
    }
  }, [hydrated, mounted, item.id, get]);

  if (!mounted || !history) return null;
  if (history.progress <= 0.02 || history.progress >= 0.95) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 backdrop-blur-sm p-4">
      <div className="card relative w-full max-w-md overflow-hidden rounded-2xl">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={imageUrl(item.backdrop, "w780")}
            alt={item.title}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1525] via-transparent to-black/50" />
        </div>
        <div className="-mt-10 relative space-y-4 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              {episodeTitle ? "Continue Episode" : "Continue Watching"}
            </p>
            <h3 className="mt-1 text-2xl font-extrabold text-white">
              {item.title}
            </h3>
            {episodeTitle && (
              <p className="mt-1 text-sm text-slate-400">{episodeTitle}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>{formatTime(history.currentTime)}</span>
              <span>{formatTime(history.duration)}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300"
                style={{ width: `${Math.round(history.progress * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {formatTime(history.duration - history.currentTime)} remaining
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <button
              onClick={onResume}
              className="gradient inline-flex flex-1 items-center justify-center gap-2 rounded px-5 py-3 font-bold text-[#071617] hover:opacity-90"
            >
              <Play size={18} fill="currentColor" />
              Resume
            </button>
            <button
              onClick={onStartOver}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded border border-white/20 bg-white/10 px-5 py-3 font-semibold transition hover:bg-white/15"
            >
              <RotateCcw size={18} />
              Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
