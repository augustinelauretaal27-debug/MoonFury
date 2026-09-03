"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, Play, Plus, Check, Star, Clock, Info } from "lucide-react";
import type { Content } from "@/data/movies";
import { imageUrl, formatRuntime } from "@/lib/utils";
import { useWatchlist } from "@/hooks/useWatchlist";

type Props = {
  item: Content;
  onClose: () => void;
};

export function MediaModal({ item, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { has, toggle } = useWatchlist();
  const inList = has(item.id);

  const watchHref =
    item.type === "tv"
      ? `/watch/${item.id}?type=tv`
      : `/watch/${item.id}?type=movie`;
  const detailHref =
    item.type === "tv" ? `/tv/${item.id}` : `/movies/${item.id}`;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0e1525] shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* Backdrop image */}
        <div className="relative h-52 sm:h-64 overflow-hidden">
          <img
            src={imageUrl(item.backdrop || item.poster, "w780")}
            alt=""
            aria-hidden
            className="size-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1525] via-[#0e1525]/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 backdrop-blur">
            {item.type === "tv" ? "Series" : "Movie"}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {item.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="rounded-full border border-purple-400/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-purple-300"
              >
                {g}
              </span>
            ))}
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            {item.title}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
              <Star size={11} fill="currentColor" />
              {item.rating}
            </span>
            <span>{item.year}</span>
            {item.runtime && (
              <span className="inline-flex items-center gap-1">
                <Clock size={11} />
                {formatRuntime(item.runtime)}
              </span>
            )}
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-300 line-clamp-3">
            {item.overview}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={watchHref}
              onClick={onClose}
              className="gradient inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-[#071617] transition hover:opacity-90 ambient-glow"
            >
              <Play size={15} fill="currentColor" />
              Play Now
            </Link>

            <button
              onClick={() => toggle(item.id, item.type)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                inList
                  ? "border-cyan-300/50 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/15"
                  : "border-white/20 bg-white/5 text-slate-300 hover:border-white/30 hover:text-white"
              }`}
            >
              {inList ? <Check size={15} /> : <Plus size={15} />}
              {inList ? "In My List" : "My List"}
            </button>

            <Link
              href={detailHref}
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/25 hover:text-white"
            >
              <Info size={15} />
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
