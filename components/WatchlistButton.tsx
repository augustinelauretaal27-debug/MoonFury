"use client";

import { Plus, Check } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { ContentType } from "@/data/movies";

export function WatchlistButton({
  id,
  type = "movie",
  compact = false,
}: {
  id: string;
  type?: ContentType;
  compact?: boolean;
}) {
  const { has, toggle, hydrated } = useWatchlist();
  const active = has(id);

  if (!hydrated) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded border border-white/20 bg-white/10 text-sm font-semibold ${
          compact ? "px-3 py-2" : "px-4 py-3"
        }`}
        aria-hidden
      >
        <Plus size={17} />
        {compact ? "" : "Add to My List"}
      </span>
    );
  }

  return (
    <button
      onClick={() => toggle(id, type)}
      className={`inline-flex items-center gap-2 rounded border text-sm font-semibold transition ${
        active
          ? "border-cyan-300/50 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/15"
          : "border-white/20 bg-white/10 hover:border-cyan-300 hover:text-cyan-300"
      } ${compact ? "px-3 py-2" : "px-4 py-3"}`}
      aria-pressed={active}
    >
      {active ? <Check size={17} /> : <Plus size={17} />}
      {compact ? "" : active ? "In My List" : "Add to My List"}
    </button>
  );
}
