"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Play } from "lucide-react";
import type { Content } from "@/data/movies";
import { imageUrl } from "@/lib/utils";
import { useWatchHistory } from "@/hooks/useWatchHistory";

export function MovieCard({ item }: { item: Content }) {
  const router = useRouter();
  const detailHref = `/${item.type === "tv" ? "tv" : "movies"}/${item.id}`;
  const watchHref =
    item.type === "tv"
      ? `/watch/${item.id}?type=tv`
      : `/watch/${item.id}?type=movie`;

  const { items } = useWatchHistory();

  const progress = items.find(
    (h) => h.contentId === item.id && h.progress > 0 && h.progress < 0.95
  )?.progress;

  return (
    // Outer div handles card click → detail page
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(detailHref)}
      onKeyDown={(e) => { if (e.key === "Enter") router.push(detailHref); }}
      className="poster card group relative block w-36 shrink-0 cursor-pointer overflow-hidden rounded-lg sm:w-44 md:w-48"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-900">
        <img
          src={imageUrl(item.poster, "w342")}
          alt={`${item.title} poster`}
          className="size-full object-cover transition duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 transition duration-300 group-hover:opacity-100" />

        {/* Centered play button → watch page */}
        <Link
          href={watchHref}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Play ${item.title}`}
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 grid size-12 place-items-center rounded-full bg-cyan-400 text-[#071617] opacity-0 shadow-[0_0_24px_rgba(0,242,255,0.5)] transition-all duration-300 hover:scale-110 hover:bg-cyan-300 group-hover:opacity-100"
        >
          <Play size={20} fill="currentColor" />
        </Link>

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Title & meta */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/85 to-transparent p-3 pt-12">
        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-300">
          <Star size={12} className="fill-cyan-300 text-cyan-300" />
          {item.rating} <span>• {item.year}</span>
        </p>
      </div>
    </div>
  );
}
