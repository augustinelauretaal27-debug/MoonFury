"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { movies } from "@/data/movies";
import { series } from "@/data/series";
import { genres } from "@/data/genres";
import type { Content } from "@/data/movies";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar, type FilterType } from "@/components/FilterBar";
import {
  FilterDrawer,
  defaultFilters,
  type SearchFilters,
} from "@/components/FilterDrawer";
import { MovieCard } from "@/components/MovieCard";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Search, Sparkles, TrendingUp } from "lucide-react";
import { GenreCard } from "@/components/GenreCard";

const local: Content[] = [...movies, ...series];

function applyFilters(
  list: Content[],
  typeFilter: FilterType,
  filters: SearchFilters
): Content[] {
  const effectiveType = typeFilter !== "All" ? typeFilter : filters.type;
  if (effectiveType === "Movies") list = list.filter((c) => c.type === "movie");
  if (effectiveType === "TV Series") list = list.filter((c) => c.type === "tv");
  if (filters.genre !== "All Genres")
    list = list.filter((c) => c.genres.includes(filters.genre));
  if (filters.yearFrom !== "") list = list.filter((c) => c.year >= Number(filters.yearFrom));
  if (filters.yearTo !== "") list = list.filter((c) => c.year <= Number(filters.yearTo));
  if (filters.ratingFrom !== "") list = list.filter((c) => c.rating >= Number(filters.ratingFrom));
  if (filters.ratingTo !== "") list = list.filter((c) => c.rating <= Number(filters.ratingTo));
  return list;
}

function localSearch(q: string, typeFilter: FilterType, filters: SearchFilters): Content[] {
  let list = applyFilters([...local], typeFilter, filters);
  if (q.length === 0) return list;
  const lq = q.toLowerCase();
  return list.filter((c) =>
    c.title.toLowerCase().includes(lq) ||
    (c.actors ?? []).some((a) => a.toLowerCase().includes(lq)) ||
    (c.director ?? "").toLowerCase().includes(lq) ||
    c.genres.some((g) => g.toLowerCase().includes(lq))
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [mounted, setMounted] = useState(false);

  const [tmdbResults, setTmdbResults] = useState<Content[] | null>(null);
  const [tmdbConfigured, setTmdbConfigured] = useState(true);
  const [isLoading, setIsLoading] = useState(initialQuery.trim().length > 0);

  const [trending, setTrending] = useState<Content[] | null>(null);
  const [trendingLoading, setTrendingLoading] = useState(initialQuery.trim().length === 0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialFetchDone = useRef(false);

  const fetchTmdb = useCallback(async (q: string) => {
    if (q.trim().length === 0) {
      setTmdbResults(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // Always fetch all types from TMDB — filtering is done client-side
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&type=all`);
      const data = await res.json();
      setTmdbConfigured(data.configured ?? true);
      setTmdbResults(data.results ?? null);
    } catch {
      setTmdbResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    setTrendingLoading(true);
    try {
      const res = await fetch("/api/search/trending");
      const data = await res.json();
      setTmdbConfigured(data.configured ?? true);
      if (data.configured && data.results?.length > 0) setTrending(data.results);
    } catch {
      // silently fall back
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  // On mount: if URL has a query, fire immediately; otherwise load trending
  useEffect(() => {
    setMounted(true);
    if (initialQuery.trim().length > 0 && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchTmdb(initialQuery);
    } else {
      fetchTrending();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce user-typed queries after mount — only re-fetch when query changes, not filters
  useEffect(() => {
    if (!mounted) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length === 0) {
      setTmdbResults(null);
      setIsLoading(false);
      if (!trending && !trendingLoading) fetchTrending();
      return;
    }

    debounceRef.current = setTimeout(() => fetchTmdb(query), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, mounted]);

  const hasQuery = query.trim().length > 0;

  const results = useMemo(() => {
    if (hasQuery) {
      if (tmdbConfigured && tmdbResults !== null)
        return applyFilters([...tmdbResults], typeFilter, filters);
      return localSearch(query.trim(), typeFilter, filters);
    }
    return applyFilters([...(trending ?? local)], typeFilter, filters);
  }, [query, typeFilter, filters, tmdbResults, tmdbConfigured, trending, hasQuery]);

  const movieCount = results.filter((r) => r.type === "movie").length;
  const seriesCount = results.length - movieCount;

  const suggestions = useMemo(() => {
    if (query.trim().length > 0) return [];
    return ["Avengers", "Breaking Bad", "Inception", "Thriller", "Animation", "2024"];
  }, [query]);

  const showGrid = hasQuery || typeFilter !== "All" ||
    filters.genre !== "All Genres" || filters.yearFrom !== "" ||
    filters.yearTo !== "" || filters.ratingFrom !== "" || filters.ratingTo !== "";

  const isGridLoading = hasQuery ? isLoading : trendingLoading;

  return (
    <div className="py-8">
      <div className="shell">
        <div className="mb-2">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-300">Discover</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Search</h1>
          <p className="mt-2 text-sm text-slate-400">Find titles, actors, directors, and genres across MoonFury.</p>
        </div>

        <div className="mt-6">
          <SearchBar value={query} onChange={setQuery} autoFocus={mounted} />
        </div>

        {suggestions.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Try searching:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-300"
              >
                <Sparkles size={12} className="text-purple-300" />
                {s}
              </button>
            ))}
          </div>
        )}

        {(hasQuery || typeFilter !== "All") && !isLoading && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-white">{results.length}</span>{" "}
              result{results.length === 1 ? "" : "s"}
              {query && <> for <span className="text-white">&quot;{query}&quot;</span></>}
              {movieCount > 0 && <span className="ml-2 text-slate-500">· {movieCount} movie{movieCount === 1 ? "" : "s"}</span>}
              {seriesCount > 0 && <span className="ml-1 text-slate-500">· {seriesCount} series</span>}
            </p>
          </div>
        )}

        <FilterBar value={typeFilter} onChange={setTypeFilter} />
        <FilterDrawer filters={filters} onChange={setFilters} onClear={() => setFilters(defaultFilters)} />

        {!hasQuery && !trendingLoading && (
          <div className="mt-10 mb-4 flex items-center gap-3">
            <TrendingUp size={20} className="text-cyan-300" />
            <h2 className="text-xl font-bold sm:text-2xl">Trending This Week</h2>
          </div>
        )}

        <div className={!hasQuery && !trendingLoading ? "" : "mt-10"}>
          {isGridLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : results.length === 0 && showGrid ? (
            <EmptyState
              title="No results found"
              description="Try a different keyword, adjust filters, or browse below."
              actionHref="/genres"
              actionLabel="Browse Genres"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {results.map((c) => <MovieCard key={c.id} item={c} />)}
            </div>
          )}
        </div>

        <section className="mt-16">
          <div className="mb-5 flex items-center gap-3">
            <Search size={20} className="text-purple-300" />
            <h2 className="text-xl font-bold sm:text-2xl">Browse by Genre</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {genres.map((g, i) => <GenreCard key={g} genre={g} index={i} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
