"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type Episode } from "@/data/movies";
import { findSeriesById } from "@/data/series";
import type { Content } from "@/data/movies";
import { EmbedPlayer } from "@/components/EmbedPlayer";
import { WatchlistButton } from "@/components/WatchlistButton";
import { NextEpisodeCard } from "@/components/NextEpisodeCard";
import { MovieCard } from "@/components/MovieCard";
import { WatchEpisodePanel } from "@/components/WatchEpisodePanel";
import { ChevronLeft, ChevronRight, Star, ListCheck } from "lucide-react";
import { formatRuntime } from "@/lib/utils";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { usePreferences } from "@/hooks/usePreferences";

// ── Time-based watch tracker ──────────────────────────────────────────────────
const SAVE_INTERVAL_MS = 5_000;

function estimateDuration(content: Content): number {
  if (content.runtime && content.runtime > 0) return content.runtime * 60;
  return content.type === "movie" ? 110 * 60 : 45 * 60;
}

function useWatchTracker(
  contentId: string,
  contentType: "movie" | "tv",
  duration: number,
  episodeId?: string,
  seasonNumber?: number,
  episodeNumber?: number
) {
  const { update } = useWatchHistory();
  const elapsedRef = useRef(0);
  const lastTickRef = useRef(Date.now());

  const save = useCallback(() => {
    if (elapsedRef.current < 3) return;
    const progress = duration > 0 ? Math.min(elapsedRef.current / duration, 1) : 0;
    update({
      contentId,
      contentType,
      currentTime: elapsedRef.current,
      duration,
      progress,
      lastWatched: Date.now(),
      seasonNumber,
      episodeNumber,
      episodeId,
    });
  }, [contentId, contentType, duration, episodeId, seasonNumber, episodeNumber, update]);

  useEffect(() => {
    lastTickRef.current = Date.now();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        elapsedRef.current += (now - lastTickRef.current) / 1000;
        lastTickRef.current = now;
        save();
      } else {
        lastTickRef.current = Date.now();
      }
    }, SAVE_INTERVAL_MS);

    function onVisibility() {
      lastTickRef.current = Date.now();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      save();
    };
  }, [save]);

  useEffect(() => {
    elapsedRef.current = 0;
    lastTickRef.current = Date.now();
  }, [contentId, episodeId]);
}

// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  id: string;
  content: Content;
  recommendations: Content[];
};

export default function WatchClient({ id, content, recommendations }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { preferences } = usePreferences();

  const s = findSeriesById(id);
  const isSeries = content.type === "tv";

  const sn = searchParams.get("s") ? Number(searchParams.get("s")) : 1;
  const en = searchParams.get("e") ? Number(searchParams.get("e")) : 1;

  const [selectedSeason, setSelectedSeason] = useState(sn);
  const [selectedEpisode, setSelectedEpisode] = useState(en);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setSelectedSeason(sn);
    setSelectedEpisode(en);
  }, [sn, en]);

  const season = useMemo(
    () => s?.seasons.find((x) => x.number === selectedSeason) || s?.seasons[0],
    [s, selectedSeason]
  );
  const episode = useMemo(
    () =>
      season?.episodes.find((e) => e.number === selectedEpisode) ||
      season?.episodes[0],
    [season, selectedEpisode]
  );

  const nextEpisode: Episode | null = useMemo(() => {
    if (!season || !episode) return null;
    const sameSeason = season.episodes.find((e) => e.number === episode.number + 1);
    if (sameSeason) return sameSeason;
    const nextS = s?.seasons.find((x) => x.number === (season.number || 0) + 1);
    return nextS?.episodes[0] || null;
  }, [s, season, episode]);

  // ── Watch history tracking ──────────────────────────────────────────────────
  const episodeId = isSeries && episode ? episode.id : undefined;
  const trackDuration = isSeries && episode
    ? (episode.duration ?? 45) * 60
    : estimateDuration(content);

  useWatchTracker(
    id,
    content.type,
    trackDuration,
    episodeId,
    isSeries ? selectedSeason : undefined,
    isSeries ? selectedEpisode : undefined
  );

  // Autoplay next episode countdown
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0 && nextEpisode && season) {
      navigateToEpisode(season.number, nextEpisode.number);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  function navigateToEpisode(sNum: number, eNum: number) {
    setCountdown(null);
    router.push(`/watch/${id}?s=${sNum}&e=${eNum}`);
    setSelectedSeason(sNum);
    setSelectedEpisode(eNum);
  }

  function handleEnded() {
    if (nextEpisode && season && preferences.autoNextEpisode) {
      setCountdown(8);
    }
  }

  const watchTitle = isSeries
    ? episode
      ? `${content.title} — S${selectedSeason} E${episode.number}: ${episode.title}`
      : content.title
    : content.title;

  // Use content.type to build the correct detail URL
  const detailHref = content.type === "tv" ? `/tv/${id}` : `/movies/${id}`;

  const moreToWatchRef = useRef<HTMLDivElement>(null);
  const moreToWatch = recommendations.slice(0, 10);

  // Pick the best background image: backdrop > poster
  // TMDB paths are relative (e.g. "/abc.jpg") — prepend the CDN base URL
  const TMDB_IMG = "https://image.tmdb.org/t/p/w1280";
  const rawBg = content.backdrop || content.poster;
  const bgImage = rawBg
    ? rawBg.startsWith("http")
      ? rawBg
      : `${TMDB_IMG}${rawBg.startsWith("/") ? rawBg : `/${rawBg}`}`
    : null;

  return (
    <div className="pb-10">
      <div
        className="relative bg-black bg-cover bg-center bg-no-repeat"
        style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
      >
        {/* Dark overlay so text and player stay readable */}
        {bgImage && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/95 pointer-events-none" />
        )}
        {/* All children sit above the overlay */}
        <div className="relative z-10">
        <div className="shell pt-20">
          <Link
            href={detailHref}
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ChevronLeft size={16} />
            Back to {content.type === "tv" ? "Series" : "Movie"} Details
          </Link>
        </div>
        <div className="shell pb-4 pt-4">
          <h1 className="truncate text-lg font-bold text-white sm:text-xl md:text-2xl">
            {watchTitle}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 text-amber-300">
              <Star size={12} fill="currentColor" />
              {content.rating}
            </span>
            <span>{content.year}</span>
            {content.type === "movie" && content.runtime && (
              <span>{formatRuntime(content.runtime)}</span>
            )}
            {isSeries && season && episode && (
              <span>{episode.duration} min</span>
            )}
            <span className="text-purple-300">
              {content.genres.slice(0, 3).join(" • ")}
            </span>
          </div>
        </div>

        <div className="shell">
          {isSeries ? (
            <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
              <EmbedPlayer
                tmdbId={Number(id)}
                mediaType={content.type}
                season={selectedSeason}
                episode={selectedEpisode}
                title={watchTitle}
                onEnded={handleEnded}
              />
              <div className="h-[400px] lg:h-auto">
                <WatchEpisodePanel
                  seriesId={id}
                  currentSeason={selectedSeason}
                  currentEpisode={selectedEpisode}
                />
              </div>
            </div>
          ) : (
            <EmbedPlayer
              tmdbId={Number(id)}
              mediaType={content.type}
              title={watchTitle}
              onEnded={handleEnded}
            />
          )}
        </div>

        <div className="shell mt-6 flex flex-wrap items-start justify-between gap-4 pb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-white">{content.title}</h2>
            <p className="mt-2 max-w-3xl leading-7 text-slate-300 line-clamp-3">
              {isSeries && episode ? episode.overview : content.overview}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <WatchlistButton id={id} type={content.type} />
            <Link
              href={detailHref}
              className="inline-flex items-center gap-2 rounded border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
            >
              <ListCheck size={16} />
              Details
            </Link>
          </div>
        </div>
        </div> {/* /relative z-10 */}
      </div>

      {mounted && countdown !== null && nextEpisode && season ? (
        <div className="shell mt-10">
          <NextEpisodeCard
            seriesId={id}
            seriesTitle={content.title}
            episode={nextEpisode}
            seasonNumber={season.number}
            onPlay={() =>
              navigateToEpisode(
                nextEpisode.number === 1 ? season.number + 1 : season.number,
                nextEpisode.number
              )
            }
            autoPlayCountdown={countdown}
          />
          {countdown > 0 && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setCountdown(null)}
                className="text-xs text-slate-500 hover:text-white"
              >
                Cancel autoplay
              </button>
            </div>
          )}
        </div>
      ) : null}

      {moreToWatch.length > 0 && (
        <section className="shell mt-14">
          <h2 className="mb-4 text-xl font-bold sm:text-2xl">More to Watch</h2>
          <div className="group/row relative">
            <button
              type="button"
              onClick={() => moreToWatchRef.current?.scrollBy({ left: -720, behavior: "smooth" })}
              aria-label="Scroll left"
              className="absolute left-0 top-1/2 z-10 -translate-x-3 -translate-y-1/2 grid size-10 place-items-center rounded-full border border-white/20 bg-black/70 text-white opacity-0 shadow-lg backdrop-blur transition-all duration-200 hover:border-cyan-300/60 hover:text-cyan-300 group-hover/row:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => moreToWatchRef.current?.scrollBy({ left: 720, behavior: "smooth" })}
              aria-label="Scroll right"
              className="absolute right-0 top-1/2 z-10 translate-x-3 -translate-y-1/2 grid size-10 place-items-center rounded-full border border-white/20 bg-black/70 text-white opacity-0 shadow-lg backdrop-blur transition-all duration-200 hover:border-cyan-300/60 hover:text-cyan-300 group-hover/row:opacity-100"
            >
              <ChevronRight size={20} />
            </button>
            <div
              ref={moreToWatchRef}
              className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 py-2"
            >
              {moreToWatch.map((c) => (
                <MovieCard key={c.id} item={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="h-6" />
    </div>
  );
}
