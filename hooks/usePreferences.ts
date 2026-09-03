"use client";

import { useEffect, useState, useCallback } from "react";
import { storage } from "@/lib/storage";

export type VideoQuality = "Auto" | "2160p" | "1080p" | "720p" | "480p";
export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

export type Preferences = {
  autoplay: boolean;
  autoNextEpisode: boolean;
  quality: VideoQuality;
  subtitles: boolean;
  subtitleLanguage: string;
  reminders: boolean;
  volume: number;
  muted: boolean;
  playbackSpeed: PlaybackSpeed;
  skipIntroSeconds: number;
  introStartSeconds: number;
};

const defaults: Preferences = {
  autoplay: true,
  autoNextEpisode: true,
  quality: "Auto",
  subtitles: false,
  subtitleLanguage: "en",
  reminders: false,
  volume: 1,
  muted: false,
  playbackSpeed: 1,
  skipIntroSeconds: 0,
  introStartSeconds: 0,
};

const KEY = "moonfury-preferences";

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = storage.get<Partial<Preferences>>(KEY, {});
    setPreferences({ ...defaults, ...saved });
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<Preferences>) => {
    setPreferences((old) => {
      const next = { ...old, ...patch };
      storage.set(KEY, next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    storage.set(KEY, defaults);
    setPreferences(defaults);
  }, []);

  return { preferences, update, reset, hydrated };
}
