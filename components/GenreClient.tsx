"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { MovieCard } from "@/components/MovieCard";
import { ContentRow } from "@/components/ContentRow";
import type { Content } from "@/data/movies";

type MediaType = "All" | "Movies" | "TV Series";

type Filters = {
  type: MediaType;
  yearFrom: number | "";
  yearTo: number | "";
  ratingFrom: number | "";
  ratingTo: number | "";
};

const defaultFilters: Filters = {
  type: "All",
  yearFrom: "",
  yearTo: "",
  ratingFrom: "",
  ratingTo: "",
};

// ── Pagination UI ─────────────────────────────────────────────────────────────
function Pagination({
  page,
  totalPages,
  onChange,
  loading,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
  loading?: boolean;
}) {
  if (totalPages <= 1) return null;

  const pageSet = new Set<number>();
  pageSet.add(1);
  pageSet.add(totalPages);
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pageSet.add(i);
  }
  const sorted = Array.from(pageSet).sort((a, b) => a - b);
  const withEllipsis: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) withEllipsis.push("…");
    withEllipsis.push(sorted[i]);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1 || loading}
        className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:border-cyan-300/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>

      {withEllipsis.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-slate-500 select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            disabled={loading}
            className={`grid size-9 place-items-center rounded-lg border text-sm font-semibold transition ${
              p === page
                ? "border-cyan-300 bg-cyan-300/10 text-cyan-300"
                : "border-white/10 bg-white/5 text-slate-400 hover:border-white/25 hover:text-white disabled:opacity-50"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages || loading}
        className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:border-cyan-300/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

type ApiResponse = {
  movies: Content[];
  series: Content[];
  totalMoviePages: number;
  totalSeriesPages: number;
  totalMovieResults: number;
  totalSeriesResults: number;
  page: number;
};

type Props = {
  genre: string;
  slug: string;
  moviesOnly: Content[];
  seriesOnly: Content[];
  initialMoviePages: number;
  initialSeriesPages: number;
  initialMovieResults: number;
  initialSeriesResults: number;
  initialType?: MediaType;
};

export function GenreClient({
  genre,
  slug,
  moviesOnly,
  seriesOnly,
  initialMoviePages,
  initialSeriesPages,
  initialMovieResults,
  initialSeriesResults,
  initialType = "All",
}: Props) {
  const [filters, setFilters] = useState<Filters>({ ...defaultFilters, type: initialType });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState<Content[]>(moviesOnly);
  const [series, setSeries] = useState<Content[]>(seriesOnly);
  const [totalMoviePages, setTotalMoviePages] = useState(initialMoviePages);
  const [totalSeriesPages, setTotalSeriesPages] = useState(initialSeriesPages);
  const [totalMovieResults, setTotalMovieResults] = useState(initialMovieResults);
  const [totalSeriesResults, setTotalSeriesResults] = useState(initialSeriesResults);
  const [loading, setLoading] = useState(false);

  const tmdbType =
    filters.type === "Movies" ? "movie" :
    filters.type === "TV Series" ? "tv" : "all";

  const fetchPage = useCallback(async (p: number, type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/genres/${slug}?page=${p}&type=${type}`);
      const data: ApiResponse = await res.json();
      setMovies(data.movies ?? []);
      setSeries(data.series ?? []);
      setTotalMoviePages(data.totalMoviePages ?? 1);
      setTotalSeriesPages(data.totalSeriesPages ?? 1);
      setTotalMovieResults(data.totalMovieResults ?? 0);
      setTotalSeriesResults(data.totalSeriesResults ?? 0);
    } catch {
      // keep current data
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Fetch when page or type changes (skip initial load)
  const isInitial = page === 1 && tmdbType === "all";
  useEffect(() => {
    if (isInitial) {
      // Use server data
      setMovies(moviesOnly);
      setSeries(seriesOnly);
      setTotalMoviePages(initialMoviePages);
      setTotalSeriesPages(initialSeriesPages);
      setTotalMovieResults(initialMovieResults);
      setTotalSeriesResults(initialSeriesResults);
      return;
    }
    fetchPage(page, tmdbType);
  }, [page, tmdbType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Combined list for current page — limit to 18
  const pageItems = useMemo(() => {
    let list: Content[] = [];
    if (filters.type === "Movies") list = movies;
    else if (filters.type === "TV Series") list = series;
    else list = [...new Map([...movies, ...series].map((c) => [c.id, c])).values()];

    // Apply local filters (year/rating)
    if (filters.yearFrom !== "") list = list.filter((c) => c.year >= Number(filters.yearFrom));
    if (filters.yearTo !== "") list = list.filter((c) => c.year <= Number(filters.yearTo));
    if (filters.ratingFrom !== "") list = list.filter((c) => c.rating >= Number(filters.ratingFrom));
    if (filters.ratingTo !== "") list = list.filter((c) => c.rating <= Number(filters.ratingTo));

    // Limit to 18 items per page
    return list.slice(0, 18);
  }, [movies, series, filters]);

  // Total pages & results for current type
  const totalPages =
    filters.type === "Movies" ? (totalMoviePages ?? 1) :
    filters.type === "TV Series" ? (totalSeriesPages ?? 1) :
    Math.max(totalMoviePages ?? 1, totalSeriesPages ?? 1);

  const totalResults =
    filters.type === "Movies" ? (totalMovieResults ?? 0) :
    filters.type === "TV Series" ? (totalSeriesResults ?? 0) :
    (totalMovieResults ?? 0) + (totalSeriesResults ?? 0);

  const hasActive =
    filters.type !== "All" ||
    filters.yearFrom !== "" ||
    filters.yearTo !== "" ||
    filters.ratingFrom !== "" ||
    filters.ratingTo !== "";

  const activeCount = [
    filters.type !== "All",
    filters.yearFrom !== "" || filters.yearTo !== "",
    filters.ratingFrom !== "" || filters.ratingTo !== "",
  ].filter(Boolean).length;

  function updateFilters(f: Filters) {
    const newType = f.type === "Movies" ? "movie" : f.type === "TV Series" ? "tv" : "all";
    const typeChanged = f.type !== filters.type;
    setFilters(f);
    if (typeChanged) {
      setPage(1);
      if (newType !== "all" || page !== 1) {
        fetchPage(1, newType);
      }
    }
  }

  function handlePageChange(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const showGridMode = hasActive || filters.type !== "All";

  return (
    <div className="mt-6">
      {/* Filter bar — matches screenshot: [All] [Movies] [TV Series] [≡ Filters]  ·  59,776 titles (…) */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {/* Type pills */}
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          {(["All", "Movies", "TV Series"] as MediaType[]).map((t) => (
            <button
              key={t}
              onClick={() => updateFilters({ ...filters, type: t })}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                filters.type === t
                  ? "bg-cyan-300/15 text-cyan-300 border border-cyan-300/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t}
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
          <button onClick={() => updateFilters(defaultFilters)} className="text-sm text-slate-400 hover:text-white">
            Clear all
          </button>
        )}

        {/* Right side — result count */}
        <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
          {loading && <Loader2 size={12} className="animate-spin" />}
          {(totalResults ?? 0) > 0 && (
            <>
              <span className="text-slate-300 font-medium">{(totalResults ?? 0).toLocaleString()}</span>
              {" "}titles
              {filters.type === "All" && (
                <span className="text-slate-600 hidden sm:inline">
                  ({(totalMovieResults ?? 0).toLocaleString()} movies · {(totalSeriesResults ?? 0).toLocaleString()} series)
                </span>
              )}
            </>
          )}
        </span>
      </div>

      {/* Default rows view */}
      {!showGridMode && !loading && (
        <>
          {moviesOnly.length > 0 && (
            <ContentRow
              title={`${genre} Movies`}
              items={moviesOnly.slice(0, 20)}
              onViewMore={() => {
                updateFilters({ ...filters, type: "Movies" });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
          {seriesOnly.length > 0 && (
            <ContentRow
              title={`${genre} Series`}
              items={seriesOnly.slice(0, 20)}
              onViewMore={() => {
                updateFilters({ ...filters, type: "TV Series" });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        </>
      )}

      {/* Grid mode with pagination */}
      {showGridMode && (
        <section className="mt-4">
          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          ) : pageItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No titles match your filters on this page.{" "}
              <button
                onClick={() => updateFilters({ ...filters, yearFrom: "", yearTo: "", ratingFrom: "", ratingTo: "" })}
                className="text-cyan-300 hover:underline"
              >
                Clear filters
              </button>
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {pageItems.map((c) => (
                <MovieCard key={c.id} item={c} />
              ))}
            </div>
          )}

          {/* Bottom pagination only */}
          <div className="mt-8">
            <Pagination page={page} totalPages={Math.min(totalPages ?? 1, 500)} onChange={handlePageChange} loading={loading} />
          </div>
        </section>
      )}

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
              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-200">Type</h4>
                <div className="flex flex-wrap gap-2">
                  {(["All", "Movies", "TV Series"] as MediaType[]).map((t) => (
                    <button key={t} onClick={() => updateFilters({ ...filters, type: t })}
                      className={`rounded-full border px-4 py-1.5 text-sm ${filters.type === t ? "border-cyan-300 bg-cyan-300/10 text-cyan-300" : "border-white/10 text-slate-300 hover:text-white"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-200">Year</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">From</label>
                    <input type="number" min="1900" max="2100" placeholder="2000" value={filters.yearFrom}
                      onChange={(e) => updateFilters({ ...filters, yearFrom: e.target.value === "" ? "" : Number(e.target.value) })}
                      className="mt-1 w-full rounded border border-white/10 bg-[#070b14] px-3 py-2 text-sm outline-none focus:border-cyan-300" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">To</label>
                    <input type="number" min="1900" max="2100" placeholder="2026" value={filters.yearTo}
                      onChange={(e) => updateFilters({ ...filters, yearTo: e.target.value === "" ? "" : Number(e.target.value) })}
                      className="mt-1 w-full rounded border border-white/10 bg-[#070b14] px-3 py-2 text-sm outline-none focus:border-cyan-300" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-200">Rating</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Min</label>
                    <input type="number" min="0" max="10" step="0.1" placeholder="0.0" value={filters.ratingFrom}
                      onChange={(e) => updateFilters({ ...filters, ratingFrom: e.target.value === "" ? "" : Number(e.target.value) })}
                      className="mt-1 w-full rounded border border-white/10 bg-[#070b14] px-3 py-2 text-sm outline-none focus:border-cyan-300" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Max</label>
                    <input type="number" min="0" max="10" step="0.1" placeholder="10.0" value={filters.ratingTo}
                      onChange={(e) => updateFilters({ ...filters, ratingTo: e.target.value === "" ? "" : Number(e.target.value) })}
                      className="mt-1 w-full rounded border border-white/10 bg-[#070b14] px-3 py-2 text-sm outline-none focus:border-cyan-300" />
                  </div>
                </div>
              </div>
              {hasActive && (
                <button onClick={() => { updateFilters(defaultFilters); setDrawerOpen(false); }}
                  className="w-full rounded-lg border border-red-400/20 bg-red-500/5 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/10 transition">
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
