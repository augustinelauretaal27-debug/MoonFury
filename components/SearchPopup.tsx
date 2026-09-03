"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Loader2 } from "lucide-react";
import type { Content } from "@/data/movies";
import { imageUrl } from "@/lib/utils";

const SUGGESTIONS = ["Avengers", "Breaking Bad", "Inception", "The Office", "Dune", "Stranger Things"];

type Props = { onClose: () => void };

export function SearchPopup({ onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fetchResults = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&type=all`);
      const data = await res.json();
      setResults((data.results ?? []).slice(0, 8));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(() => fetchResults(query), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchResults]);

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleResultClick(item: Content) {
    const href = item.type === "tv" ? `/tv/${item.id}` : `/movies/${item.id}`;
    router.push(href);
    onClose();
  }

  function handleSeeAll() {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  }

  function handleSuggestion(s: string) {
    setQuery(s);
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 backdrop-blur-sm pt-16 px-4"
    >
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Search input */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-[#0e1525]/95 px-4 py-3 shadow-2xl backdrop-blur">
          {loading
            ? <Loader2 size={20} className="shrink-0 animate-spin text-cyan-300" />
            : <Search size={20} className="shrink-0 text-slate-400" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSeeAll(); }}
            placeholder="Search titles, actors, genres..."
            className="flex-1 bg-transparent text-base text-white placeholder-slate-500 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="shrink-0 text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          )}
          <button onClick={onClose} className="ml-1 shrink-0 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-400 hover:text-white transition">
            Esc
          </button>
        </div>

        {/* Results dropdown */}
        <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0e1525]/95 shadow-2xl backdrop-blur">
          {query.trim().length < 2 ? (
            /* Suggestions */
            <div className="p-4">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <TrendingUp size={13} />
                Try searching
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              No results for &quot;{query}&quot;
            </div>
          ) : (
            <>
              <ul className="divide-y divide-white/5">
                {results.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleResultClick(item)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5"
                    >
                      <div className="size-10 shrink-0 overflow-hidden rounded-md bg-slate-800">
                        <img
                          src={imageUrl(item.poster, "w92")}
                          alt={item.title}
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-slate-400">
                          {item.year} · {item.type === "tv" ? "Series" : "Movie"}
                          {item.genres[0] && ` · ${item.genres[0]}`}
                        </p>
                      </div>
                      <span className="shrink-0 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">
                        {item.rating}★
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {results.length > 0 && (
                <button
                  onClick={handleSeeAll}
                  className="w-full border-t border-white/5 py-3 text-center text-xs font-semibold text-cyan-300 transition hover:bg-white/5"
                >
                  See all results for &quot;{query}&quot; →
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
