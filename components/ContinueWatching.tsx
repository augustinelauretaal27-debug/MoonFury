"use client";

import { useWatchHistory, type HistoryItem } from "@/hooks/useWatchHistory";
import { useContentLookup } from "@/hooks/useContentLookup";
import Link from "next/link";
import { imageUrl, formatTime } from "@/lib/utils";
import { Play, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Content } from "@/data/movies";
import { useState, useEffect, useRef } from "react";

export function ContinueWatching() {
  const { items, remove, hydrated } = useWatchHistory();
  const [mounted, setMounted] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const ongoingItems = hydrated
    ? items.filter((x) => x.progress > 0 && x.progress < 0.95)
    : [];
  const ids = ongoingItems.map((x) => x.contentId);
  const lookupEntries = ongoingItems.map((x) => ({ id: x.contentId, type: x.contentType }));
  const { contents } = useContentLookup(lookupEntries);

  if (!mounted || !hydrated) return null;

  const ongoing = ongoingItems
    .map((h) => ({ history: h, item: contents.get(h.contentId) }))
    .filter((x): x is { history: HistoryItem; item: Content } => Boolean(x.item));

  if (!ongoing.length) return null;

  function scrollRow(direction: "left" | "right") {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -720 : 720,
      behavior: "smooth",
    });
  }

  return (
    <section className="shell mt-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-cyan-300" />
          <h2 className="text-xl font-bold sm:text-2xl">Continue Watching</h2>
        </div>
        <Link
          href="/history"
          className="group flex items-center gap-1 text-sm text-cyan-300 transition hover:text-cyan-200"
        >
          View more
          <ChevronRight size={16} className="transition group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="group/row relative">
        {/* Left arrow */}
        <button
          type="button"
          onClick={() => scrollRow("left")}
          aria-label="Scroll left"
          className="absolute left-0 top-1/2 z-10 -translate-x-3 -translate-y-1/2 grid size-10 place-items-center rounded-full border border-white/20 bg-black/70 text-white opacity-0 shadow-lg backdrop-blur transition-all duration-200 hover:border-cyan-300/60 hover:text-cyan-300 group-hover/row:opacity-100"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Right arrow */}
        <button
          type="button"
          onClick={() => scrollRow("right")}
          aria-label="Scroll right"
          className="absolute right-0 top-1/2 z-10 translate-x-3 -translate-y-1/2 grid size-10 place-items-center rounded-full border border-white/20 bg-black/70 text-white opacity-0 shadow-lg backdrop-blur transition-all duration-200 hover:border-cyan-300/60 hover:text-cyan-300 group-hover/row:opacity-100"
        >
          <ChevronRight size={20} />
        </button>

        <div
          ref={scrollerRef}
          className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 py-2"
        >
        {ongoing.map(({ history, item }) => (
          <div
            key={item.id + (history.episodeId || "")}
            className="group/card relative w-72 shrink-0"
          >
            {/* Remove button — appears on card hover */}
            <button
              type="button"
              aria-label={`Remove ${item.title} from continue watching`}
              onClick={(e) => {
                e.preventDefault();
                remove(item.id, history.episodeId);
              }}
              className="absolute right-2 top-2 z-20 grid size-6 place-items-center rounded-full bg-black/80 text-white opacity-0 ring-1 ring-white/20 transition-all duration-150 hover:bg-red-600 hover:ring-red-500 group-hover/card:opacity-100"
            >
              <X size={12} strokeWidth={2.5} />
            </button>

            <Link
              href={`/watch/${item.id}`}
              className="card group relative block overflow-hidden rounded-lg transition hover:border-cyan-300/40 hover:shadow-[0_0_22px_rgba(0,242,255,0.15)]"
            >
              <div className="relative h-36 w-full overflow-hidden">
                <img
                  src={imageUrl(item.backdrop)}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <span className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
                  <span className="grid size-14 place-items-center rounded-full bg-cyan-400 text-[#071617]">
                    <Play size={22} fill="#071617" />
                  </span>
                </span>
                {history.episodeNumber && history.seasonNumber && (
                  <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium backdrop-blur">
                    S{history.seasonNumber} • E{history.episodeNumber}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatTime(history.currentTime)} of {formatTime(history.duration)}
                </p>
                <div className="mt-3 h-1 rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 transition-all"
                    style={{ width: `${Math.round(history.progress * 100)}%` }}
                  />
                </div>
              </div>
            </Link>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}
