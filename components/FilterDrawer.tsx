"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { genres } from "@/data/genres";

export type SearchFilters = {
  type: "All" | "Movies" | "TV Series";
  genre: string;
  yearFrom: number | "";
  yearTo: number | "";
  ratingFrom: number | "";
  ratingTo: number | "";
};

export const defaultFilters: SearchFilters = {
  type: "All",
  genre: "All Genres",
  yearFrom: "",
  yearTo: "",
  ratingFrom: "",
  ratingTo: "",
};

function FilterDrawerContent({
  filters,
  onChange,
}: {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
}) {
  return (
    <div className="space-y-6 p-5">
      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-3">
          Type
        </h4>
        <div className="flex flex-wrap gap-2">
          {(["All", "Movies", "TV Series"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onChange({ ...filters, type: t })}
              className={`rounded-full border px-4 py-1.5 text-sm ${
                filters.type === t
                  ? "border-cyan-300 bg-cyan-300/10 text-cyan-300"
                  : "border-white/10 text-slate-300 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-3">
          Genre
        </h4>
        <div className="flex flex-wrap gap-2">
          {["All Genres", ...genres].map((g) => (
            <button
              key={g}
              onClick={() => onChange({ ...filters, genre: g })}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                filters.genre === g
                  ? "border-cyan-300 bg-cyan-300/10 text-cyan-300"
                  : "border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-3">
          Year
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500">From</label>
            <input
              type="number"
              min="1900"
              max="2100"
              placeholder="2000"
              value={filters.yearFrom}
              onChange={(e) =>
                onChange({
                  ...filters,
                  yearFrom: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded border border-white/10 bg-[#070b14] px-3 py-2 text-sm outline-none focus:border-cyan-300"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">To</label>
            <input
              type="number"
              min="1900"
              max="2100"
              placeholder="2026"
              value={filters.yearTo}
              onChange={(e) =>
                onChange({
                  ...filters,
                  yearTo: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded border border-white/10 bg-[#070b14] px-3 py-2 text-sm outline-none focus:border-cyan-300"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-3">
          Rating
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500">Min</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="0.0"
              value={filters.ratingFrom}
              onChange={(e) =>
                onChange({
                  ...filters,
                  ratingFrom:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded border border-white/10 bg-[#070b14] px-3 py-2 text-sm outline-none focus:border-cyan-300"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Max</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="10.0"
              value={filters.ratingTo}
              onChange={(e) =>
                onChange({
                  ...filters,
                  ratingTo:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded border border-white/10 bg-[#070b14] px-3 py-2 text-sm outline-none focus:border-cyan-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FilterDrawer({
  filters,
  onChange,
  onClear,
}: {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);

  const hasActiveFilters =
    filters.type !== "All" ||
    filters.genre !== "All Genres" ||
    filters.yearFrom !== "" ||
    filters.yearTo !== "" ||
    filters.ratingFrom !== "" ||
    filters.ratingTo !== "";

  return (
    <>
      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${
            hasActiveFilters
              ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-300"
              : "border-white/10 text-slate-300 hover:text-white"
          }`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasActiveFilters && (
            <span className="grid size-5 place-items-center rounded-full bg-cyan-300 text-[10px] font-bold text-[#071617]">
              !
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-sm text-slate-400 hover:text-white"
          >
            Clear all
          </button>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-end bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="card relative h-full w-full max-w-sm overflow-y-auto rounded-l-2xl border-l border-white/10 animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0e1525] px-5 py-4">
              <h3 className="text-lg font-bold">Filters</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>
            <FilterDrawerContent filters={filters} onChange={onChange} />
          </div>
        </div>
      )}
    </>
  );
}
