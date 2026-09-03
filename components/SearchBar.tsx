"use client";

import { Search, X } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <label className="card flex items-center gap-3 rounded-lg px-4 py-3 focus-within:border-cyan-300/60 focus-within:shadow-[0_0_20px_rgba(0,242,255,0.1)] transition">
      <Search className="shrink-0 text-cyan-300" size={20} />
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search titles, actors, directors, genres..."
        className="w-full bg-transparent outline-none placeholder:text-slate-500"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="grid size-7 place-items-center shrink-0 rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>
      )}
    </label>
  );
}
