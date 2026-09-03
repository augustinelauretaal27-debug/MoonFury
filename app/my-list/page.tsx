"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Content } from "@/data/movies";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useContentLookup } from "@/hooks/useContentLookup";
import { MovieCard } from "@/components/MovieCard";
import { EmptyState } from "@/components/EmptyState";
import { ListVideo, Star, Clock, X } from "lucide-react";

type Tab = "All" | "Movies" | "TV Series";

function RemovableCard({ item, onRemove }: { item: Content; onRemove: () => void }) {
  return (
    <div className="relative group/card">
      <MovieCard item={item} />
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
        className="absolute right-1.5 top-1.5 z-10 grid size-6 place-items-center rounded-full bg-black/70 text-slate-300 opacity-0 backdrop-blur transition group-hover/card:opacity-100 hover:bg-red-500/80 hover:text-white"
        aria-label={`Remove ${item.title} from My List`}
      >
        <X size={13} />
      </button>
    </div>
  );
}

export default function MyListPage() {
  const { entries, ids, hydrated, remove } = useWatchlist();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("All");

  useEffect(() => { setMounted(true); }, []);

  const { contents, loading } = useContentLookup(
    hydrated ? entries.map((e) => ({ id: e.id, type: e.type })) : []
  );

  const saved: Content[] = entries
    .map((e) => contents.get(e.id))
    .filter((c): c is Content => Boolean(c));

  const filtered: Content[] =
    tab === "Movies"
      ? saved.filter((c) => c.type === "movie")
      : tab === "TV Series"
        ? saved.filter((c) => c.type === "tv")
        : saved;

  const avgRating =
    saved.length > 0
      ? Math.round((saved.reduce((a, b) => a + b.rating, 0) / saved.length) * 10) / 10
      : 0;

  return (
    <div className="py-8">
      <div className="shell">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-purple-300">
              Saved
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              My List
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Everything you've saved to watch later. Stored locally.
            </p>
          </div>
          {mounted && hydrated && saved.length > 0 ? (
            <div className="hidden items-center gap-4 rounded-xl border border-white/10 px-5 py-3 text-sm sm:flex">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-white">{saved.length}</p>
                <p className="text-xs text-slate-500">saved</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="flex items-center justify-center gap-1 text-2xl font-extrabold text-amber-300">
                  <Star size={16} fill="currentColor" />
                  {avgRating}
                </p>
                <p className="text-xs text-slate-500">avg rating</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-extrabold text-purple-300">
                  {saved.filter((c) => c.type === "tv").length}
                </p>
                <p className="text-xs text-slate-500">series</p>
              </div>
            </div>
          ) : null}
        </div>

        {mounted && hydrated && saved.length > 0 ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {(["All", "Movies", "TV Series"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  tab === t
                    ? "border-cyan-300 bg-cyan-300/10 text-cyan-300"
                    : "border-white/10 text-slate-300 hover:border-white/25 hover:text-white"
                }`}
              >
                {t}
                <span className="ml-2 text-xs text-slate-500">
                  {t === "All"
                    ? saved.length
                    : t === "Movies"
                      ? saved.filter((c) => c.type === "movie").length
                      : saved.filter((c) => c.type === "tv").length}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {!mounted || !hydrated || loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card aspect-[2/3] animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            description={
              saved.length === 0
                ? "Tap the + button on any movie or series to save it here."
                : `No ${tab.toLowerCase()} in your list yet.`
            }
            actionHref="/movies"
            actionLabel="Browse Movies"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filtered.map((c) => (
                <RemovableCard
                  key={c.id}
                  item={c}
                  onRemove={() => remove(c.id)}
                />
              ))}
            </div>

            {saved.length >= 4 && (
              <div className="mt-14 grid gap-4 md:grid-cols-2">
                <Link
                  href="/history"
                  className="card group relative overflow-hidden rounded-xl p-6 transition hover:border-cyan-300/30"
                >
                  <span className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-60 transition group-hover:opacity-100" />
                  <div className="relative flex items-start gap-4">
                    <span className="grid size-12 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/5 text-cyan-300">
                      <Clock size={22} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-white">Resume where you left off</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Continue watching anything you've already started.
                      </p>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/"
                  className="card group relative overflow-hidden rounded-xl p-6 transition hover:border-purple-300/30"
                >
                  <span className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-60 transition group-hover:opacity-100" />
                  <div className="relative flex items-start gap-4">
                    <span className="grid size-12 place-items-center rounded-xl border border-purple-300/20 bg-purple-300/5 text-purple-300">
                      <ListVideo size={22} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-white">Discover more</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Explore trending and hand-picked collections on MoonFury.
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
