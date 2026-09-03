"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PlayerControls } from "./PlayerControls";
import { usePreferences, type VideoQuality, type PlaybackSpeed } from "@/hooks/usePreferences";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  poster?: string;
  contentId: string;
  contentType: "movie" | "tv";
  title?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeId?: string;
  initialTime?: number;
  onEnded?: () => void;
  onTimeUpdate?: (time: number, duration: number, progress: number) => void;
  showSkipIntro?: boolean;
  autoPlay?: boolean;
  className?: string;
};

export function VideoPlayer({
  src,
  poster,
  contentId,
  contentType,
  title,
  seasonNumber,
  episodeNumber,
  episodeId,
  initialTime = 0,
  onEnded,
  onTimeUpdate,
  showSkipIntro = false,
  autoPlay,
  className,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { preferences, update: updatePrefs } = usePreferences();
  const { update: updateHistory } = useWatchHistory();

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(preferences.volume);
  const [muted, setMuted] = useState(preferences.muted);
  const [fullscreen, setFullscreen] = useState(false);
  const [quality, setQuality] = useState<VideoQuality>(preferences.quality);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(
    preferences.playbackSpeed
  );
  const [subtitles, setSubtitles] = useState(preferences.subtitles);
  const [buffered, setBuffered] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [isPip, setIsPip] = useState(false);
  const [started, setStarted] = useState(initialTime > 0 ? false : true);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveRef = useRef<number>(0);

  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (playing) setControlsVisible(false);
    }, 3000);
  }, [playing]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => undefined);
    } else {
      v.pause();
    }
  }, []);

  const seekTo = useCallback((t: number) => {
    const v = videoRef.current;
    if (!v) return;
    const safe = Math.max(0, Math.min(t, v.duration || 0));
    v.currentTime = safe;
    setCurrentTime(safe);
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    updatePrefs({ muted: next });
  }, [muted, updatePrefs]);

  const changeVolume = useCallback(
    (val: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.volume = val;
      setVolume(val);
      if (val > 0 && muted) {
        v.muted = false;
        setMuted(false);
        updatePrefs({ muted: false });
      }
      updatePrefs({ volume: val });
    },
    [muted, updatePrefs]
  );

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => undefined);
    } else {
      document.exitFullscreen?.().catch(() => undefined);
    }
  }, []);

  const togglePip = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPip(false);
      } else if (v.requestPictureInPicture) {
        await v.requestPictureInPicture();
        setIsPip(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const skipBack = useCallback(() => {
    seekTo(currentTime - 10);
  }, [currentTime, seekTo]);

  const skipForward = useCallback(() => {
    seekTo(currentTime + 10);
  }, [currentTime, seekTo]);

  const skipIntro = useCallback(() => {
    if (preferences.introStartSeconds === 0) {
      seekTo(currentTime + 85);
    } else {
      seekTo(preferences.introStartSeconds + preferences.skipIntroSeconds);
    }
  }, [currentTime, preferences.introStartSeconds, preferences.skipIntroSeconds, seekTo]);

  // Sync volume/speed/mute to element
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    v.muted = muted;
    v.playbackRate = playbackSpeed;
  }, [volume, muted, playbackSpeed]);

  // Apply initial time once metadata loads
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const el = v;
    function onLoaded() {
      setDuration(el.duration || 0);
      if (initialTime > 0 && !started) {
        el.currentTime = initialTime;
        setCurrentTime(initialTime);
      }
      setShowLoading(false);
    }
    el.addEventListener("loadedmetadata", onLoaded);
    return () => el.removeEventListener("loadedmetadata", onLoaded);
  }, [initialTime, started]);

  // Autoplay
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const shouldAuto = autoPlay ?? preferences.autoplay;
    if (shouldAuto) {
      v.play().catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId, episodeId]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      const k = e.key.toLowerCase();
      if (k === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        skipBack();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        skipForward();
      } else if (k === "f") {
        toggleFullscreen();
      } else if (k === "m") {
        toggleMute();
      } else if (k === "arrowup") {
        e.preventDefault();
        changeVolume(Math.min(1, volume + 0.05));
      } else if (k === "arrowdown") {
        e.preventDefault();
        changeVolume(Math.max(0, volume - 0.05));
      }
      resetHideTimer();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    togglePlay,
    skipBack,
    skipForward,
    toggleFullscreen,
    toggleMute,
    changeVolume,
    volume,
    resetHideTimer,
  ]);

  // Fullscreen change
  useEffect(() => {
    function onChange() {
      setFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Video event listeners
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const el = v;

    function onPlay() {
      setPlaying(true);
      setStarted(true);
      resetHideTimer();
    }
    function onPause() {
      setPlaying(false);
      setControlsVisible(true);
    }
    function onTime() {
      const ct = el.currentTime;
      const dur = el.duration || 0;
      setCurrentTime(ct);
      const prog = dur > 0 ? ct / dur : 0;
      onTimeUpdate?.(ct, dur, prog);

      const now = Date.now();
      if (now - lastSaveRef.current > 5000 && ct > 0) {
        lastSaveRef.current = now;
        updateHistory({
          contentId,
          contentType,
          currentTime: ct,
          duration: dur,
          progress: prog,
          lastWatched: now,
          seasonNumber,
          episodeNumber,
          episodeId,
        });
      }

      if (el.buffered.length > 0) {
        setBuffered(el.buffered.end(el.buffered.length - 1));
      }
    }
    function onDuration() {
      setDuration(el.duration || 0);
    }
    function onWaiting() {
      setShowLoading(true);
    }
    function onPlaying() {
      setShowLoading(false);
    }
    function onEnd() {
      updateHistory({
        contentId,
        contentType,
        currentTime: el.duration || 0,
        duration: el.duration || 0,
        progress: 1,
        lastWatched: Date.now(),
        seasonNumber,
        episodeNumber,
        episodeId,
      });
      setPlaying(false);
      onEnded?.();
    }

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("durationchange", onDuration);
    el.addEventListener("waiting", onWaiting);
    el.addEventListener("playing", onPlaying);
    el.addEventListener("ended", onEnd);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("durationchange", onDuration);
      el.removeEventListener("waiting", onWaiting);
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("ended", onEnd);
    };
  }, [
    contentId,
    contentType,
    seasonNumber,
    episodeNumber,
    episodeId,
    onEnded,
    onTimeUpdate,
    updateHistory,
    resetHideTimer,
  ]);

  // Save on unmount too
  useEffect(() => {
    return () => {
      if (duration > 0 || currentTime > 0) {
        updateHistory({
          contentId,
          contentType,
          currentTime,
          duration,
          progress: duration > 0 ? currentTime / duration : 0,
          lastWatched: Date.now(),
          seasonNumber,
          episodeNumber,
          episodeId,
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId, episodeId]);

  function handlePlayFromStart() {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    setCurrentTime(0);
    v.play().catch(() => undefined);
  }

  const progress = duration > 0 ? currentTime / duration : 0;
  const showSkipBtn =
    showSkipIntro &&
    currentTime >= 5 &&
    currentTime <=
      (preferences.introStartSeconds > 0
        ? preferences.introStartSeconds
        : 90);

  return (
    <div
      ref={containerRef}
      className={cn(
        "group/player relative w-full overflow-hidden rounded-xl bg-black aspect-video",
        className
      )}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => {
        if (playing) setControlsVisible(false);
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="size-full bg-black object-contain"
        playsInline
        crossOrigin="anonymous"
        preload="metadata"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {!started && (
        <div className="absolute inset-0 grid place-items-center bg-black/60 backdrop-blur-sm">
          <button
            onClick={initialTime > 0 ? togglePlay : handlePlayFromStart}
            className="grid size-24 place-items-center rounded-full gradient text-[#071617] shadow-[0_0_50px_rgba(0,242,255,0.35)] transition hover:scale-105"
            aria-label="Play"
          >
            <Play size={40} fill="currentColor" />
          </button>
        </div>
      )}

      {showLoading && started && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="grid size-14 place-items-center rounded-full bg-black/50 backdrop-blur">
            <Loader2
              size={28}
              className="animate-spin text-cyan-300"
            />
          </div>
        </div>
      )}

      {subtitles && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 px-6 text-center sm:bottom-28">
          <div className="mx-auto inline-block max-w-3xl rounded-md bg-black/75 px-4 py-2 text-sm leading-7 text-white shadow-lg backdrop-blur-sm sm:text-base">
            Subtitles are unavailable for this preview. Enable or disable
            subtitles from the player controls.
          </div>
        </div>
      )}

      <PlayerControls
        playing={playing}
        onTogglePlay={togglePlay}
        currentTime={currentTime}
        duration={duration}
        onSeek={seekTo}
        onSeekStart={() => setIsSeeking(true)}
        onSeekEnd={() => setIsSeeking(false)}
        volume={volume}
        muted={muted}
        onVolumeChange={changeVolume}
        onToggleMute={toggleMute}
        fullscreen={fullscreen}
        onToggleFullscreen={toggleFullscreen}
        quality={quality}
        onQualityChange={(q) => {
          setQuality(q);
          updatePrefs({ quality: q });
        }}
        playbackSpeed={playbackSpeed}
        onPlaybackSpeedChange={(s) => {
          setPlaybackSpeed(s);
          updatePrefs({ playbackSpeed: s });
        }}
        subtitles={subtitles}
        onToggleSubtitles={() => {
          const n = !subtitles;
          setSubtitles(n);
          updatePrefs({ subtitles: n });
        }}
        onSkipBack={skipBack}
        onSkipForward={skipForward}
        onTogglePip={togglePip}
        buffered={buffered}
        controlsVisible={controlsVisible || !playing}
        isSeeking={isSeeking}
        onSkipIntro={skipIntro}
        showSkipIntro={showSkipBtn}
        title={title}
      />

      <span className="sr-only" aria-live="polite">
        {Math.round(progress * 100)} percent played
      </span>
      {isPip && <span className="sr-only">Picture in picture active</span>}
    </div>
  );
}
