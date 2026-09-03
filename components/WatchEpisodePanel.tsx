"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, ChevronDown, ListVideo } from "lucide-react";
import { imageUrl } from "@/lib/utils";
import type { TmdbEpisode, TmdbSeasonDetail } from "@/lib/tmdb";

type SeasonInfo = {
  season_number: number;
  name: string;
  episode_count: number;
};

type Props = {
  seriesId: string;
  currentSeason: number;
  currentEpisode: number;
};

export function WatchEpisodePanel({ seriesId, currentSeason, currentEpisode }: Props) {
  const [seasons, setSeasons] = useState<SeasonInfo[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);
  const [seasonData, setSeasonData] = useState<TmdbSeasonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Fetch series seasons list once
  useEffect(() => {
    fetch(`/api/tv/${seriesId}/season/1`)
      .then((r) => r.json())
      .then(() => {
        // Fetch series detail to get seasons list
        fetch(`/api/content/${seriesId}?type=tv`)
          .then((r) => r.json())
          .then((data) => {
            // We'll fetch seasons from the TV detail endpoint
          });
      })
      .catch(() => {});

    // Fetch seasons via TMDB directly
    fetchSeasonsList();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesId]);

  async function fetchSeasonsList() {
    try {
      const res = await fetch(`/api/tv/${seriesId}/seasons`);
      if (res.ok) {
        const data = await res.json();
        const valid = (data.seasons ?? []).filter((s: SeasonInfo) => s.season_number > 0 && s.episode_count > 0);
        setSeasons(valid);
      }
    } catch {
      // silently ignore
    }
  }

  // Fetch episodes for selected season
  useEffect(() => {
    setLoading(true);
    fetch(`/api/tv/${seriesId}/season/${selectedSeason}`)
      .then((r) => r.json())
      .then((data) => setSeasonData(data.season ?? null))
      .catch(() => setSeasonData(null))
      .finally(() => setLoading(false));
  }, [seriesId, selectedSeason]);

  const currentSeasonInfo = seasons.find((s) => s.season_number === selectedSeason);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a0f1a]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <ListVideo size={15} className="text-cyan-300" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Episodes</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Season selector */}
          {seasons.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10 transition"
              >
                {currentSeasonInfo?.name ?? `S${selectedSeason}`}
                <ChevronDown size={11} className={`transition ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full z-30 mt-1 min-w-[130px] max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-[#0e1525] shadow-xl">
                  {seasons.map((s) => (
                    <button
                      key={s.season_number}
                      onClick={() => { setSelectedSeason(s.season_number); setDropdownOpen(false); }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-xs transition hover:bg-white/5 ${
                        s.season_number === selectedSeason ? "text-cyan-300" : "text-slate-300"
                      }`}
                    >
                      <span>{s.name}</span>
                      <span className="text-slate-500">{s.episode_count}ep</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-slate-500 hover:text-white transition"
            title={collapsed ? "Expand" : "Collapse"}
          >
            <ChevronDown size={14} className={`transition ${collapsed ? "" : "rotate-180"}`} />
          </button>
        </div>
      </div>

      {/* Episode list */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          ) : !seasonData?.episodes?.length ? (
            <p className="p-4 text-xs text-slate-500">No episodes available.</p>
          ) : (
            <div className="space-y-1 p-2">
              {seasonData.episodes.map((ep: TmdbEpisode) => {
                const isCurrent = selectedSeason === currentSeason && ep.episode_number === currentEpisode;
                return (
                  <Link
                    key={ep.id}
                    href={`/watch/${seriesId}?type=tv&s=${selectedSeason}&e=${ep.episode_number}`}
                    className={`group flex items-center gap-2.5 rounded-lg p-2 transition ${
                      isCurrent
                        ? "border border-cyan-300/30 bg-cyan-300/5"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 shrink-0 overflow-hidden rounded-md bg-slate-800">
                      <div className="aspect-video">
                        {ep.still_path ? (
                          <img
                            src={imageUrl(ep.still_path, "w92")}
                            alt={ep.name}
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="size-full bg-white/5" />
                        )}
                      </div>
                      {isCurrent && (
                        <div className="absolute inset-0 grid place-items-center bg-black/40">
                          <span className="grid size-5 place-items-center rounded-full bg-cyan-400 text-[#071617]">
                            <Play size={9} fill="currentColor" />
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-xs font-semibold leading-tight ${isCurrent ? "text-cyan-300" : "text-slate-200"}`}>
                        {ep.episode_number}. {ep.name}
                      </p>
                      {ep.runtime && (
                        <p className="mt-0.5 text-[10px] text-slate-500">{ep.runtime}m</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
