import Link from "next/link";
import { Play, ChevronRight } from "lucide-react";
import type { Episode } from "@/data/movies";
import { imageUrl, formatTime } from "@/lib/utils";

export function NextEpisodeCard({
  seriesId,
  seriesTitle,
  episode,
  seasonNumber,
  onPlay,
  autoPlayCountdown,
}: {
  seriesId: string;
  seriesTitle: string;
  episode: Episode;
  seasonNumber: number;
  onPlay: () => void;
  autoPlayCountdown?: number;
}) {
  return (
    <div className="card group relative overflow-hidden rounded-xl p-4 transition hover:border-cyan-300/30 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          onClick={onPlay}
          className="relative block shrink-0 overflow-hidden rounded-lg sm:w-64"
        >
          <div className="aspect-video overflow-hidden bg-slate-900">
            <img
              src={imageUrl(episode.stillPath, "w500")}
              alt={episode.title}
              className="size-full object-cover transition duration-500 group-hover:scale-110"
            />
          </div>
          <span className="absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition group-hover:opacity-100">
            <span className="grid size-12 place-items-center rounded-full bg-cyan-400 text-[#071617]">
              <Play size={20} fill="#071617" />
            </span>
          </span>
          {autoPlayCountdown !== undefined && autoPlayCountdown > 0 && (
            <span className="absolute left-2 top-2 grid size-10 place-items-center rounded-full bg-black/80 text-sm font-bold text-white backdrop-blur">
              {autoPlayCountdown}
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Up Next
          </p>
          <Link
            href={`/tv/${seriesId}`}
            className="mt-1 block truncate text-sm text-slate-400 hover:text-white"
          >
            {seriesTitle}
          </Link>
          <h4 className="mt-0.5 truncate text-lg font-bold text-white">
            S{seasonNumber} E{episode.number}: {episode.title}
          </h4>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
            {episode.overview}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={onPlay}
              className="gradient inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-bold text-[#071617] transition hover:opacity-90"
            >
              <Play size={16} fill="currentColor" />
              Play Now
            </button>
            <Link
              href={`/tv/${seriesId}`}
              className="inline-flex items-center gap-1 text-sm text-cyan-300 transition hover:text-cyan-200"
            >
              View details
              <ChevronRight size={16} />
            </Link>
            <span className="ml-auto text-xs text-slate-500">
              {formatTime(episode.duration * 60)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
