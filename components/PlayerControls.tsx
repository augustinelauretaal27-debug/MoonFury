"use client";

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Gauge,
  Subtitles,
  PictureInPicture2,
  Settings,
  X,
  FastForward,
  ChevronUp,
} from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import type { VideoQuality, PlaybackSpeed } from "@/hooks/usePreferences";
import { useState, useEffect, useRef } from "react";

type Props = {
  playing: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onSeekStart?: () => void;
  onSeekEnd?: () => void;
  volume: number;
  muted: boolean;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  quality: VideoQuality;
  onQualityChange: (q: VideoQuality) => void;
  playbackSpeed: PlaybackSpeed;
  onPlaybackSpeedChange: (s: PlaybackSpeed) => void;
  subtitles: boolean;
  onToggleSubtitles: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  onTogglePip?: () => void;
  buffered?: number;
  controlsVisible: boolean;
  isSeeking?: boolean;
  onSkipIntro?: () => void;
  showSkipIntro?: boolean;
  title?: string;
};

function Menu({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-full right-0 z-20 mb-3 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0b1220]/95 shadow-2xl backdrop-blur-xl"
      role="menu"
      aria-label={label}
    >
      <div className="border-b border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-cyan-300">
        {label}
      </div>
      <div className="py-1">{children}</div>
    </div>
  );
}

export function PlayerControls(props: Props) {
  const {
    playing,
    onTogglePlay,
    currentTime,
    duration,
    onSeek,
    onSeekStart,
    onSeekEnd,
    volume,
    muted,
    onVolumeChange,
    onToggleMute,
    fullscreen,
    onToggleFullscreen,
    quality,
    onQualityChange,
    playbackSpeed,
    onPlaybackSpeedChange,
    subtitles,
    onToggleSubtitles,
    onSkipBack,
    onSkipForward,
    onTogglePip,
    buffered = 0,
    controlsVisible,
    isSeeking = false,
    onSkipIntro,
    showSkipIntro = false,
    title,
  } = props;

  const [showQuality, setShowQuality] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hoverVolume, setHoverVolume] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);

  const progress = duration > 0 ? currentTime / duration : 0;
  const bufferedPct = duration > 0 ? Math.min(1, buffered / duration) : 0;

  function handleProgressMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    return ratio * duration;
  }

  useEffect(() => {
    if (!drag) return;
    function onMove(e: MouseEvent) {
      if (!progressRef.current || duration <= 0) return;
      const rect = progressRef.current.getBoundingClientRect();
      const ratio = Math.min(
        1,
        Math.max(0, (e.clientX - rect.left) / rect.width)
      );
      onSeek(ratio * duration);
    }
    function onUp() {
      setDrag(false);
      onSeekEnd?.();
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag, duration, onSeek, onSeekEnd]);

  const qualities: VideoQuality[] = [
    "Auto",
    "2160p",
    "1080p",
    "720p",
    "480p",
  ];
  const speeds: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-10 flex flex-col justify-end transition-opacity duration-300",
        controlsVisible ? "opacity-100" : "opacity-0"
      )}
      aria-hidden={!controlsVisible}
    >
      <div
        className={cn(
          "bg-gradient-to-b from-black/80 via-black/30 to-transparent transition-opacity",
          controlsVisible ? "opacity-100" : "opacity-0"
        )}
      >
        {title && (
          <div className="shell flex items-center justify-between py-4">
            <h3 className="truncate text-sm font-semibold text-white sm:text-base">
              {title}
            </h3>
          </div>
        )}
      </div>

      <div className="pointer-events-auto relative">
        {showSkipIntro && onSkipIntro && (
          <div className="shell mb-2 flex justify-end">
            <button
              onClick={onSkipIntro}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-black/50 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/70"
            >
              <FastForward size={16} />
              Skip Intro
            </button>
          </div>
        )}

        <div className="shell">
          <div
            ref={progressRef}
            className="group relative h-2 w-full cursor-pointer"
            onMouseDown={(e) => {
              const t = handleProgressMouse(e);
              if (t !== undefined) {
                setDrag(true);
                onSeekStart?.();
                onSeek(t);
              }
            }}
            onClick={(e) => {
              const t = handleProgressMouse(e);
              if (t !== undefined) onSeek(t);
            }}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            tabIndex={0}
          >
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/15 transition group-hover:h-1.5" />
            <div
              className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25 transition group-hover:h-1.5"
              style={{ width: `${bufferedPct * 100}%` }}
            />
            <div
              className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 transition group-hover:h-1.5"
              style={{ width: `${progress * 100}%` }}
            />
            <div
              className={cn(
                "absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(0,242,255,0.7)] transition",
                drag || isSeeking ? "scale-110 opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
              style={{ left: `${progress * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent pb-4 pt-6">
          <div className="shell flex items-center justify-between gap-2 text-white">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={onTogglePlay}
                aria-label={playing ? "Pause" : "Play"}
                className="grid size-10 place-items-center rounded-full transition hover:text-cyan-300 sm:size-11"
              >
                {playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>

              <button
                onClick={onSkipBack}
                aria-label="Back 10 seconds"
                className="hidden grid size-10 place-items-center rounded-full transition hover:text-cyan-300 sm:grid"
              >
                <SkipBack size={20} />
              </button>
              <button
                onClick={onSkipForward}
                aria-label="Forward 10 seconds"
                className="hidden grid size-10 place-items-center rounded-full transition hover:text-cyan-300 sm:grid"
              >
                <SkipForward size={20} />
              </button>

              <div
                className="group/vol relative flex items-center"
                onMouseEnter={() => setHoverVolume(true)}
                onMouseLeave={() => setHoverVolume(false)}
              >
                <button
                  onClick={onToggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="grid size-10 place-items-center rounded-full transition hover:text-cyan-300"
                >
                  {muted || volume === 0 ? (
                    <VolumeX size={20} />
                  ) : (
                    <Volume2 size={20} />
                  )}
                </button>
                <div
                  className={cn(
                    "flex items-center overflow-hidden transition-all",
                    hoverVolume ? "w-24 opacity-100" : "w-0 opacity-0"
                  )}
                >
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={muted ? 0 : volume}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    className="w-24 accent-cyan-400"
                    aria-label="Volume"
                  />
                </div>
              </div>

              <div className="ml-1 hidden select-none tabular-nums text-xs text-slate-300 sm:block">
                {formatTime(currentTime)}
                <span className="mx-1 text-slate-500">/</span>
                {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={onToggleSubtitles}
                aria-label="Toggle subtitles"
                className={cn(
                  "hidden grid size-10 place-items-center rounded-full transition sm:grid",
                  subtitles ? "text-cyan-300" : "hover:text-cyan-300"
                )}
              >
                <Subtitles size={20} />
              </button>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowSpeed((v) => !v);
                    setShowQuality(false);
                    setShowSettings(false);
                  }}
                  aria-label="Playback speed"
                  className="hidden size-10 place-items-center rounded-full text-xs font-bold transition hover:text-cyan-300 sm:grid"
                >
                  <Gauge size={20} />
                  <ChevronUp
                    size={10}
                    className="absolute right-1 top-1 text-slate-400"
                  />
                </button>
                <Menu
                  open={showSpeed}
                  onClose={() => setShowSpeed(false)}
                  label="Playback Speed"
                >
                  {speeds.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        onPlaybackSpeedChange(s);
                        setShowSpeed(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-white/5",
                        playbackSpeed === s
                          ? "text-cyan-300"
                          : "text-slate-200"
                      )}
                    >
                      <span>
                        {s === 1 ? "Normal" : `${s}x`}
                      </span>
                      {playbackSpeed === s && <X size={14} className="opacity-70" />}
                    </button>
                  ))}
                </Menu>
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowQuality((v) => !v);
                    setShowSpeed(false);
                    setShowSettings(false);
                  }}
                  aria-label="Quality"
                  className="grid size-10 place-items-center rounded-full transition hover:text-cyan-300"
                >
                  <Settings size={20} />
                </button>
                <Menu
                  open={showQuality}
                  onClose={() => setShowQuality(false)}
                  label="Video Quality"
                >
                  {qualities.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        onQualityChange(q);
                        setShowQuality(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-white/5",
                        quality === q ? "text-cyan-300" : "text-slate-200"
                      )}
                    >
                      <span>{q}</span>
                      {quality === q && <X size={14} className="opacity-70" />}
                    </button>
                  ))}
                </Menu>
              </div>

              {onTogglePip && (
                <button
                  onClick={onTogglePip}
                  aria-label="Picture in picture"
                  className="hidden grid size-10 place-items-center rounded-full transition hover:text-cyan-300 md:grid"
                >
                  <PictureInPicture2 size={20} />
                </button>
              )}

              <button
                onClick={onToggleFullscreen}
                aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                className="grid size-10 place-items-center rounded-full transition hover:text-cyan-300"
              >
                {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>

          <div className="shell mt-2 text-center tabular-nums text-[10px] text-slate-500 sm:hidden">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
}
