"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { MovieCard } from "@/components/MovieCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import type { Content } from "@/data/movies";

const ALL_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Documentary", "Drama", "Fantasy", "Horror", "Mystery",
  "Romance", "Science Fiction", "Thriller",
];

const SORT_OPTIONS = [
  { value: "popular",   label: "Popularity" },
  { value: "latest",    label: "Release Date" },
  { value: "top_rated", label: "Rating" },
  { value: "upcoming",  label: "Upcoming" },
];

const YEARS = Array.from({ length: 36 }, (_, i) => String(2026 - i));

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange, loading }: {
  page: number; totalPages: number; onChange: (p: number) => void; loading?: boolean;
}) {
  if (totalPages <= 1) return null;
  const pageSet = new Set<number>();
  pageSet.add(1); pageSet.add(totalPages);
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pageSet.add(i);
  const sorted = Array.from(pageSet).sort((a, b) => a - b);
  const items: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) items.push("…");
    items.push(sorted[i]);
  }
  return (
    <div className="mt-10 flex items-center justify-center gap-1.5 flex-wrap">
      <button onClick={() => onChange(page - 1)} disabled={page === 1 || loading}
        className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:border-cyan-300/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition">
        <ChevronLeft size={16} />
      </button>
      {items.map((p, i) => p === "…"
        ? <span key={`g${i}`} className="px-1 text-slate-500">…</span>
        : <button key={p} onClick={() => onChange(p as number)} disabled={loading}
            className={`grid size-9 place-items-center rounded-lg border text-sm font-semibold transition ${
              p === page ? "border-cyan-300 bg-cyan-300/10 text-cyan-300" : "border-white/10 bg-white/5 text-slate-400 hover:border-white/25 hover:text-white"
            }`}>{p}</button>
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages || loading}
        className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:border-cyan-300/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function ExploreContent() {
  const sp = useSearchParams();

  const [type, setType]         = useState(sp.get("type") ?? "all");
  const [sort, setSort]         = useState(sp.get("sort") ?? "popular");
  const [genres, setGenres]     = useState<string[]>(
    sp.get("genre") ? sp.get("genre")!.split(",") : []
  );
  const [year, setYear]         = useState(sp.get("year") ?? "");
  const [lang, setLang]         = useState(sp.get("lang") ?? "");
  const [page, setPage]         = useState(Number(sp.get("page") ?? "1"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [results, setResults]           = useState<Content[]>([]);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [totalMovies, setTotalMovies]   = useState(0);
  const [totalSeries, setTotalSeries]   = useState(0);
  const [loading, setLoading]           = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doFetch = useCallback(async (params: Record<string, string>) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => Boolean(v))));
      const res = await fetch(`/api/explore?${qs}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotalResults(data.totalResults ?? 0);

      // When fetching "all", also get individual movie/tv totals for the breakdown
      if (params.type === "all" || !params.type) {
        const [mRes, tvRes] = await Promise.all([
          fetch(`/api/explore?type=movie&sort=${params.sort || "popular"}&page=1${params.genre ? `&genre=${params.genre}` : ""}`),
          fetch(`/api/explore?type=tv&sort=${params.sort || "popular"}&page=1${params.genre ? `&genre=${params.genre}` : ""}`),
        ]);
        const [mData, tvData] = await Promise.all([mRes.json(), tvRes.json()]);
        setTotalMovies(mData.totalResults ?? 0);
        setTotalSeries(tvData.totalResults ?? 0);
      } else if (params.type === "movie") {
        setTotalMovies(data.totalResults ?? 0);
        setTotalSeries(0);
      } else {
        setTotalSeries(data.totalResults ?? 0);
        setTotalMovies(0);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params: Record<string, string> = {
      type, sort, year, lang, page: String(page),
    };
    if (genres.length > 0) params.genre = genres[0]; // API takes single genre; use first selected
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doFetch(params), 0);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [type, sort, genres, year, lang, page]); // eslint-disable-line react-hooks/exhaustive-deps

  function resetPage() { setPage(1); }

  function toggleGenre(g: string) {
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
    resetPage();
  }

  const typeLabel =
    type === "movie" ? "Movies" :
    type === "tv" ? "TV Series" : "All";

  const hasActive =
    type !== "all" || genres.length > 0 || year !== "" || lang !== "" || sort !== "popular";

  const activeCount = [
    type !== "all",
    genres.length > 0,
    year !== "" || lang !== "",
    sort !== "popular",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen overflow-x-hidden py-8">
      <div className="shell">

        {/* Header — matches genre page compact style */}
        <div className="mb-4 rounded-xl border border-white/8 bg-white/[0.02] px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-cyan-300">Browse</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            All Titles
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Explore every movie and TV series on MoonFury.
          </p>
          {(totalMovies > 0 || totalSeries > 0) && (
            <div className="mt-4 flex flex-wrap items-baseline gap-5 text-sm">
              <span>
                <span className="text-xl font-extrabold text-white">
                  {(totalMovies + totalSeries).toLocaleString()}+
                </span>
                <span className="ml-1 text-xs text-slate-500">titles</span>
              </span>
              <span>
                <span className="text-xl font-extrabold text-cyan-300">
                  {totalMovies.toLocaleString()}+
                </span>
                <span className="ml-1 text-xs text-slate-500">movies</span>
              </span>
              <span>
                <span className="text-xl font-extrabold text-purple-300">
                  {totalSeries.toLocaleString()}+
                </span>
                <span className="ml-1 text-xs text-slate-500">series</span>
              </span>
            </div>
          )}
        </div>

        {/* Filter bar — same as genre page */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {/* Type pills */}
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
            {(["all", "movie", "tv"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setType(t); resetPage(); }}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  type === t
                    ? "bg-cyan-300/15 text-cyan-300 border border-cyan-300/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t === "all" ? "All" : t === "movie" ? "Movies" : "TV Series"}
              </button>
            ))}
          </div>

          {/* Filters button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm transition ${
              hasActive
                ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-300"
                : "border-white/10 text-slate-300 hover:text-white"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-cyan-300 text-[10px] font-bold text-[#071617]">
                {activeCount}
              </span>
            )}
          </button>

          {hasActive && (
            <button
              onClick={() => { setType("all"); setSort("popular"); setGenres([]); setYear(""); setLang(""); resetPage(); }}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              Clear all
            </button>
          )}

          {/* Right: result count */}
          <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
            {loading && <Loader2 size={12} className="animate-spin" />}
            {totalResults > 0 && (
              <span>
                <span className="text-slate-300 font-medium">{totalResults.toLocaleString()}</span>
                {" "}results
                {type === "all" && totalMovies > 0 && totalSeries > 0 && (
                  <span className="ml-1 hidden sm:inline text-slate-600">
                    ({totalMovies.toLocaleString()} movies · {totalSeries.toLocaleString()} series)
                  </span>
                )}
              </span>
            )}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No results found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((c) => <MovieCard key={c.id} item={c} />)}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={Math.min(totalPages, 500)}
          onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          loading={loading}
        />

        <div className="h-10" />
      </div>

      {/* Filter Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-end bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}>
          <div className="relative h-full w-full max-w-sm overflow-y-auto rounded-l-2xl border-l border-white/10 bg-[#0e1525] animate-in slide-in-from-right" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0e1525] px-5 py-4">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setDrawerOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8 p-5">
              {/* Genre — multi-select */}
              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-200">Genre</h4>
                <div className="flex flex-wrap gap-2">
                  {ALL_GENRES.map((g) => (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        genres.includes(g)
                          ? "border-cyan-300 bg-cyan-300/10 text-cyan-300"
                          : "border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10" />

              {/* Type */}
              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-200">Type</h4>
                <div className="flex flex-wrap gap-2">
                  {[["all","All"],["movie","Movies"],["tv","TV Series"]].map(([v, l]) => (
                    <button key={v} onClick={() => { setType(v); resetPage(); }}
                      className={`rounded-full border px-4 py-1.5 text-sm transition ${
                        type === v ? "border-cyan-300 bg-cyan-300/10 text-cyan-300" : "border-white/10 text-slate-300 hover:text-white"
                      }`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-200">Sort By</h4>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((o) => (
                    <button key={o.value} onClick={() => { setSort(o.value); resetPage(); }}
                      className={`rounded-full border px-4 py-1.5 text-sm transition ${
                        sort === o.value ? "border-cyan-300 bg-cyan-300/10 text-cyan-300" : "border-white/10 text-slate-300 hover:text-white"
                      }`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year */}
              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-200">Year</h4>
                <select value={year} onChange={(e) => { setYear(e.target.value); resetPage(); }}
                  className="w-full rounded-lg border border-white/10 bg-[#070b14] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300">
                  <option value="">All Years</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* Language */}
              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-200">Language</h4>
                <select value={lang} onChange={(e) => { setLang(e.target.value); resetPage(); }}
                  className="w-full rounded-lg border border-white/10 bg-[#070b14] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300">
                  <option value="">All Languages</option>
                  <option value="en">English</option>
                  <option value="ko">Korean</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="hi">Hindi</option>
                  <option value="th">Thai</option>
                </select>
              </div>

              {hasActive && (
                <button
                  onClick={() => { setType("all"); setSort("popular"); setGenres([]); setYear(""); setLang(""); resetPage(); setDrawerOpen(false); }}
                  className="w-full rounded-lg border border-red-400/20 bg-red-500/5 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/10 transition"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-8">
        <div className="shell">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
