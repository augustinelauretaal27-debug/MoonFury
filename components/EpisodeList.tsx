"use client";

import { useState } from "react";
import type { Season, Episode } from "@/data/movies";
import { imageUrl, formatTime } from "@/lib/utils";
import { Play, Check } from "lucide-react";
import { useWatchHistory } from "@/hooks/useWatchHistory";

export function SeasonSelector({
  seasons,
  selected,
  onChange,
}: {
  seasons: Season[];
  selected: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-[#070b14] p-1">
      {seasons.map((s) => (
        <button
          key={s.number}
          onClick={() => onChange(s.number)}
          className={`rounded-md px-3 py-1.5 text-sm transition ${
            selected === s.number
              ? "bg-cyan-400/10 text-cyan-300"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Season {s.number}
        </button>
      ))}
    </div>
  );
}

export function EpisodeList({
  seriesId,
  season,
  onPlay,
  currentEpisodeId,
}: {
  seriesId: string;
  season: Season;
  onPlay: (episode: Episode) => void;
  currentEpisodeId?: string;
}) {
  const { items } = useWatchHistory();

  return (
    <div className="space-y-3">
      {season.episodes.map((ep: Episode) => {
        const history = items.find(
          (h) => h.contentId === seriesId && h.episodeId === ep.id
        );
        const watched = history?.progress || 0;
        const isCompleted = watched >= 0.95;
        const isCurrent = ep.id === currentEpisodeId;

        return (
          <button
            key={ep.id}
            onClick={() => onPlay(ep)}
            className={`card group flex w-full flex-col gap-4 overflow-hidden rounded-xl p-3 text-left transition hover:border-white/20 sm:flex-row sm:items-center sm:p-4 ${
              isCurrent ? "border-cyan-300/40 bg-cyan-300/5" : ""
            }`}
          >
            <div className="relative shrink-0 overflow-hidden rounded-lg sm:w-64">
              <div className="aspect-video overflow-hidden bg-slate-900">
                <img
                  src={imageUrl(ep.stillPath, "w500")}
                  alt={ep.title}
                  className="size-full object-cover transition duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <span className="absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                <span className="grid size-12 place-items-center rounded-full bg-cyan-400 text-[#071617]">
                  <Play size={20} fill="#071617" />
                </span>
              </span>
              <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white backdrop-blur">
                {formatTime(ep.duration * 60)}
              </span>
              {watched > 0 && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-black/60">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300"
                    style={{
                      width: `${isCompleted ? 100 : Math.round(watched * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start gap-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-md bg-white/5 text-sm font-bold text-slate-400">
                  {isCompleted ? (
                    <Check size={16} className="text-cyan-300" />
                  ) : (
                    ep.number
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-bold text-white group-hover:text-cyan-300">
                    Episode {ep.number}: {ep.title}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
                    {ep.overview}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {ep.duration} min{" "}
                    {isCompleted && (
                      <span className="ml-2 text-cyan-300">Watched</span>
                    )}
                    {watched > 0 && !isCompleted && (
                      <span className="ml-2 text-cyan-300">
                        {Math.round(watched * 100)}% complete
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
