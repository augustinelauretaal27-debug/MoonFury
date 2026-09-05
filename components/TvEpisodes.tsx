"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, ChevronDown, Clock, Star } from "lucide-react";
import { imageUrl } from "@/lib/utils";
import type { TmdbEpisode, TmdbSeasonDetail } from "@/lib/tmdb";

type SeasonInfo = {
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
};

type Props = {
  seriesId: string;
  seasons: SeasonInfo[];
};

export function TvEpisodes({ seriesId, seasons }: Props) {
  // Filter out specials (season 0) and empty seasons
  const validSeasons = seasons.filter((s) => s.season_number > 0 && s.episode_count > 0);
  const [selectedSeason, setSelectedSeason] = useState(validSeasons[0]?.season_number ?? 1);
  const [seasonData, setSeasonData] = useState<TmdbSeasonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tv/${seriesId}/season/${selectedSeason}`)
      .then((r) => r.json())
      .then((data) => setSeasonData(data.season ?? null))
      .catch(() => setSeasonData(null))
      .finally(() => setLoading(false));
  }, [seriesId, selectedSeason]);

  const currentSeason = validSeasons.find((s) => s.season_number === selectedSeason);

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white sm:text-2xl">Episodes</h2>

        {/* Season dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {currentSeason?.name ?? `Season ${selectedSeason}`}
            <ChevronDown size={15} className={`transition ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-white/10 bg-[#0e1525] shadow-xl">
              {validSeasons.map((s) => (
                <button
                  key={s.season_number}
                  onClick={() => { setSelectedSeason(s.season_number); setDropdownOpen(false); }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition hover:bg-white/5 ${
                    s.season_number === selectedSeason ? "text-cyan-300" : "text-slate-300"
                  }`}
                >
                  <span>{s.name}</span>
                  <span className="text-xs text-slate-500">{s.episode_count} ep</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Episode list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-white/5 bg-white/5" />
          ))}
        </div>
      ) : !seasonData?.episodes?.length ? (
        <p className="text-sm text-slate-500">No episode data available.</p>
      ) : (
        <div className="space-y-2">
          {seasonData.episodes.map((ep: TmdbEpisode) => (
            <Link
              key={ep.id}
              href={`/watch/${seriesId}?type=tv&s=${selectedSeason}&e=${ep.episode_number}`}
              className="group flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-cyan-300/30 hover:bg-white/5"
            >
              {/* Still image */}
              <div className="relative w-32 shrink-0 overflow-hidden rounded-lg bg-slate-800 sm:w-40">
                <div className="aspect-video">
                  {ep.still_path ? (
                    <img
                      src={imageUrl(ep.still_path, "w342")}
                      alt={ep.name}
                      className="size-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="size-full bg-white/5" />
                  )}
                </div>
                <span className="absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                  <span className="grid size-9 place-items-center rounded-full bg-cyan-400 text-[#071617]">
                    <Play size={16} fill="currentColor" />
                  </span>
                </span>
                {ep.runtime && (
                  <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white backdrop-blur">
                    {ep.runtime}m
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition">
                    {ep.episode_number}. {ep.name}
                  </p>
                  <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                    {ep.vote_average > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-amber-400">
                        <Star size={10} fill="currentColor" />
                        {ep.vote_average.toFixed(1)}
                      </span>
                    )}
                    {ep.runtime && (
                      <span className="inline-flex items-center gap-0.5">
                        <Clock size={10} />
                        {ep.runtime}m
                      </span>
                    )}
                  </div>
                </div>
                {ep.air_date && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {new Date(ep.air_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                )}
                {ep.overview && (
                  <p className="mt-1.5 text-xs leading-5 text-slate-400 line-clamp-2">
                    {ep.overview}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
