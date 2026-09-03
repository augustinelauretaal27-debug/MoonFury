"use client";

import { useState, useMemo } from "react";
import { Search, X, Film, Tv, Layers } from "lucide-react";
import { GenreCard } from "@/components/GenreCard";
import Link from "next/link";
import { genres as allGenres } from "@/data/genres";

type MediaFilter = "All" | "Movies" | "TV Series";

const gradients = [
  "from-cyan-500/30 via-cyan-400/10 to-transparent",
  "from-purple-500/30 via-purple-400/10 to-transparent",
];

export function GenresFilter() {
  const [query, setQuery] = useState("");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allGenres.filter((g) => !q || g.toLowerCase().includes(q));
  }, [query]);

  const exploreHref =
    mediaFilter === "Movies"
      ? "/explore?type=movie"
      : mediaFilter === "TV Series"
        ? "/explore?type=tv"
        : "/explore";

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Search genres */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter genres..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-8 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-300/40 transition"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Media type pills */}
        <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 p-1">
          {(["All", "Movies", "TV Series"] as MediaFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setMediaFilter(t)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                mediaFilter === t
                  ? "bg-cyan-300/15 text-cyan-300 border border-cyan-300/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t === "Movies" && <Film size={12} />}
              {t === "TV Series" && <Tv size={12} />}
              {t}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          {filtered.length} genre{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Genre grid — with "All" card first */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-slate-400">No genres match &quot;{query}&quot;</p>
          <button onClick={() => setQuery("")} className="text-sm text-cyan-300 hover:text-cyan-200">Clear filter</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {/* "All" card — only visible when no search query */}
          {!query && (
            <Link
              href="/genres/all"
              className="card group relative min-h-32 overflow-hidden rounded-lg p-5 transition hover:border-cyan-300/60 hover:shadow-[0_0_20px_rgba(0,242,255,0.12)]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gradients[0]} opacity-60 transition group-hover:opacity-100`} />
              <span className="absolute right-3 top-[-20px] select-none text-8xl font-black text-white/5">★</span>
              <div className="relative flex items-center gap-2">
                <Layers size={18} className="text-cyan-300" />
                <span className="text-lg font-bold text-white">All</span>
              </div>
              <p className="relative mt-2 text-sm text-cyan-300">Browse everything</p>
            </Link>
          )}

          {filtered.map((g) => (
            <GenreCard
              key={g}
              genre={g}
              index={allGenres.indexOf(g)}
              mediaFilter={mediaFilter === "All" ? undefined : mediaFilter === "Movies" ? "movie" : "tv"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
