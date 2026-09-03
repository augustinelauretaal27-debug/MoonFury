"use client";

import { usePreferences } from "@/hooks/usePreferences";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import {
  Volume2,
  Maximize,
  Subtitles,
  Gauge,
  PlaySquare,
  ListCheck,
  Clock,
  Bell,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useState } from "react";

type Section = "playback" | "subtitles" | "privacy" | "about";

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Volume2;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/5 text-cyan-300">
        <Icon size={20} />
      </span>
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="mt-0.5 text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        on ? "bg-cyan-400" : "bg-white/10"
      }`}
    >
      <span
        className={`inline-block size-5 transform rounded-full bg-white transition ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none cursor-pointer rounded-lg border border-white/10 bg-[#070b14] py-2 pl-4 pr-10 text-sm text-white outline-none focus:border-cyan-300"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

function Slider({
  min,
  max,
  step,
  value,
  onChange,
  label,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-cyan-300">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-400"
      />
    </div>
  );
}

export function SettingsPanel() {
  const { preferences, update, reset } = usePreferences();
  const { ids: watchlistIds } = useWatchlist();
  const { items: historyItems, clear: clearHistory } = useWatchHistory();
  const [confirmClear, setConfirmClear] = useState(false);
  const [active, setActive] = useState<Section>("playback");

  const sections: { id: Section; label: string; icon: typeof Volume2 }[] = [
    { id: "playback", label: "Playback", icon: PlaySquare },
    { id: "subtitles", label: "Subtitles & Audio", icon: Subtitles },
    { id: "privacy", label: "Data & Storage", icon: ListCheck },
    { id: "about", label: "About", icon: Gauge },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <div className="card space-y-1 rounded-xl p-2 lg:sticky lg:top-20">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                active === s.id
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-8">
        {active === "playback" && (
          <div className="card space-y-8 rounded-xl p-6 sm:p-8">
            <SectionHeader
              icon={PlaySquare}
              title="Playback"
              description="Customize how MoonFury plays your content."
            />

            <div className="space-y-6 border-t border-white/10 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Autoplay next episode</h4>
                  <p className="mt-1 text-sm text-slate-400">
                    Automatically play the next episode when you finish one.
                  </p>
                </div>
                <Toggle
                  on={preferences.autoNextEpisode}
                  onChange={(v) => update({ autoNextEpisode: v })}
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Autoplay on launch</h4>
                  <p className="mt-1 text-sm text-slate-400">
                    Start playing content immediately when you open a watch page.
                  </p>
                </div>
                <Toggle
                  on={preferences.autoplay}
                  onChange={(v) => update({ autoplay: v })}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-white">Default quality</h4>
                  <p className="mt-1 text-sm text-slate-400">
                    The default video quality for new streams.
                  </p>
                </div>
                <Select
                  value={preferences.quality}
                  onChange={(v) =>
                    update({ quality: v as typeof preferences.quality })
                  }
                  options={[
                    { value: "Auto", label: "Auto (Recommended)" },
                    { value: "2160p", label: "4K Ultra HD (2160p)" },
                    { value: "1080p", label: "Full HD (1080p)" },
                    { value: "720p", label: "HD (720p)" },
                    { value: "480p", label: "SD (480p)" },
                  ]}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-white">Playback speed</h4>
                  <p className="mt-1 text-sm text-slate-400">
                    The default playback speed.
                  </p>
                </div>
                <Select
                  value={String(preferences.playbackSpeed)}
                  onChange={(v) =>
                    update({
                      playbackSpeed: Number(v) as typeof preferences.playbackSpeed,
                    })
                  }
                  options={[
                    { value: "0.5", label: "0.5x" },
                    { value: "0.75", label: "0.75x" },
                    { value: "1", label: "1x (Normal)" },
                    { value: "1.25", label: "1.25x" },
                    { value: "1.5", label: "1.5x" },
                    { value: "1.75", label: "1.75x" },
                    { value: "2", label: "2x" },
                  ]}
                />
              </div>

              <Slider
                label="Default volume"
                min={0}
                max={1}
                step={0.01}
                value={preferences.volume}
                onChange={(v) => update({ volume: v })}
              />

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Mute by default</h4>
                  <p className="mt-1 text-sm text-slate-400">
                    Start playback muted.
                  </p>
                </div>
                <Toggle
                  on={preferences.muted}
                  onChange={(v) => update({ muted: v })}
                />
              </div>
            </div>
          </div>
        )}

        {active === "subtitles" && (
          <div className="card space-y-8 rounded-xl p-6 sm:p-8">
            <SectionHeader
              icon={Subtitles}
              title="Subtitles & Audio"
              description="Configure subtitles and preferences."
            />
            <div className="space-y-6 border-t border-white/10 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Enable subtitles</h4>
                  <p className="mt-1 text-sm text-slate-400">
                    Show subtitles by default when available.
                  </p>
                </div>
                <Toggle
                  on={preferences.subtitles}
                  onChange={(v) => update({ subtitles: v })}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-white">Subtitle language</h4>
                  <p className="mt-1 text-sm text-slate-400">
                    Default subtitle language.
                  </p>
                </div>
                <Select
                  value={preferences.subtitleLanguage}
                  onChange={(v) => update({ subtitleLanguage: v })}
                  options={[
                    { value: "en", label: "English" },
                    { value: "es", label: "Español" },
                    { value: "fr", label: "Français" },
                    { value: "de", label: "Deutsch" },
                    { value: "ja", label: "日本語" },
                    { value: "ko", label: "한국어" },
                    { value: "zh", label: "中文" },
                  ]}
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">New episode reminders</h4>
                  <p className="mt-1 text-sm text-slate-400">
                    (Saved locally — no emails or notifications sent.)
                  </p>
                </div>
                <Toggle
                  on={preferences.reminders}
                  onChange={(v) => update({ reminders: v })}
                />
              </div>
            </div>
          </div>
        )}

        {active === "privacy" && (
          <div className="card space-y-8 rounded-xl p-6 sm:p-8">
            <SectionHeader
              icon={ListCheck}
              title="Data & Storage"
              description="MoonFury stores your watch history, watchlist and preferences only in your browser."
            />

            <div className="grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/5 text-cyan-300">
                    <Clock size={18} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      History
                    </p>
                    <p className="text-2xl font-extrabold text-white">
                      {historyItems.length}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3 pt-3 border-t border-white/5">
                  <p className="text-xs text-slate-500">
                    Items watched and saved locally
                  </p>
                  {!confirmClear ? (
                    <button
                      onClick={() => setConfirmClear(true)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-red-400/20 bg-red-500/5 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 size={13} />
                      Clear
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          clearHistory();
                          setConfirmClear(false);
                        }}
                        className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmClear(false)}
                        className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg border border-purple-300/20 bg-purple-300/5 text-purple-300">
                    <Bell size={18} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      My List
                    </p>
                    <p className="text-2xl font-extrabold text-white">
                      {watchlistIds.length}
                    </p>
                  </div>
                </div>
                <div className="mt-4 border-t border-white/5 pt-3">
                  <p className="text-xs text-slate-500">
                    Titles saved to your watchlist
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-white">Reset all preferences</h4>
                  <p className="mt-1 text-sm text-slate-400">
                    Restore playback, subtitle, and default settings to their original values.
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {active === "about" && (
          <div className="card space-y-6 rounded-xl p-6 sm:p-8">
            <SectionHeader
              icon={Gauge}
              title="About MoonFury"
              description="A premium cinematic streaming experience."
            />
            <div className="space-y-4 border-t border-white/10 pt-6 text-sm text-slate-400 leading-7">
              <p>
                MoonFury is a cinematic discovery platform built for viewers who
                love premium storytelling. No accounts, no tracking — your
                preferences, watch history, and watchlist live entirely in your
                own browser.
              </p>
              <p>
                Content metadata, posters, and imagery are provided by{" "}
                <span className="text-cyan-300">
                  The Movie Database (TMDB)
                </span>
                . MoonFury is a design and engineering showcase — all stories,
                titles, and characters appearing on the platform are original
                works or fictional placeholders.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  "Next.js 15",
                  "App Router",
                  "TypeScript",
                  "Tailwind CSS 4",
                  "React 19",
                  "Lucide Icons",
                ].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
