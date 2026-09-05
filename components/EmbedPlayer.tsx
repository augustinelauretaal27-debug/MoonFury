"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { buildEmbedUrl, CINESRC_ORIGIN } from "@/lib/embed";

type Props = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  title?: string;
  onEnded?: () => void;
  startTime?: number;
};

export function EmbedPlayer({
  tmdbId,
  mediaType,
  season = 1,
  episode = 1,
  title,
  onEnded,
  startTime = 0,
}: Props) {
  const [iframeKey, setIframeKey] = useState(0);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const embedUrl = useMemo(
    () =>
      buildEmbedUrl(tmdbId, mediaType, {
        season,
        episode,
        startTime: startTime > 0 ? startTime : undefined,
        autoplay: true,
        controls: true,
        autoNext: false,
        continuePrompt: false,
        color: "#8b5cf6",
      }),
    [episode, mediaType, season, startTime, tmdbId]
  );

  useEffect(() => {
    setPlayerError(null);
  }, [embedUrl]);

  // Lock to landscape when fullscreen on mobile, unlock on exit
  useEffect(() => {
    function onFullscreenChange() {
      const isFullscreen = Boolean(document.fullscreenElement);
      if (isFullscreen) {
        screen.orientation?.lock?.("landscape").catch(() => undefined);
      } else {
        screen.orientation?.unlock?.();
      }
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      screen.orientation?.unlock?.();
    };
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== CINESRC_ORIGIN) {
        return;
      }

      const eventType =
        typeof event.data === "object" && event.data !== null
          ? "type" in event.data
            ? event.data.type
            : undefined
          : undefined;

      if (eventType === "cinesrc:error") {
        const errorMessage =
          typeof event.data.error === "string"
            ? event.data.error
            : "CineSrc failed to load this video.";
        setPlayerError(errorMessage);
      }

      if (eventType === "cinesrc:ready") {
        setPlayerError(null);
      }

      if (eventType === "cinesrc:ended") {
        onEnded?.();
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onEnded]);

  function reloadPlayer() {
    setPlayerError(null);
    setIframeKey((value) => value + 1);
  }

  return (
    <div ref={containerRef} className="w-full overflow-hidden rounded-xl bg-black">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#070b14] px-3 py-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Player
          </p>
          <p className="truncate text-sm text-slate-300">CineSrc</p>
        </div>
        <button
          onClick={reloadPlayer}
          className="ml-auto shrink-0 grid size-7 place-items-center rounded-md border border-white/10 text-slate-400 transition hover:border-white/25 hover:text-white"
          title="Reload player"
        >
          <RefreshCw size={13} />
        </button>
      </div>
      <div className="relative aspect-video w-full bg-black">
        <iframe
          key={iframeKey}
          src={embedUrl}
          title={title ?? "CineSrc Player"}
          className="absolute inset-0 size-full border-0"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          referrerPolicy="origin"
          onLoad={() => setPlayerError(null)}
          onError={() => setPlayerError("Failed to load the embedded player.")}
        />

        {playerError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#070b14]/95 px-6 text-center">
            <AlertTriangle size={40} className="text-amber-400" />
            <div>
              <p className="font-bold text-white">Player unavailable</p>
              <p className="mt-1 text-sm text-slate-400">
                {playerError}
              </p>
            </div>
            <button
              onClick={reloadPlayer}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-300/15"
            >
              <RefreshCw size={15} />
              Reload Player
            </button>
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-white/5 bg-[#070b14] px-3 py-1.5 text-[11px] text-slate-500">
        <span>
          Streaming via <span className="text-slate-300">CineSrc</span>
        </span>
        <a
          href={embedUrl}
          target="_blank"
          rel="noreferrer"
          className="transition hover:text-white"
        >
          Open player
        </a>
      </div>
    </div>
  );
}
