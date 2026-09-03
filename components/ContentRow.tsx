"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { MovieCard } from "./MovieCard";
import type { Content } from "@/data/movies";

export function ContentRow({
  title,
  items,
  href,
  onViewMore,
}: {
  title: string;
  items: Content[];
  href?: string;
  onViewMore?: () => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  function scrollRow(direction: "left" | "right") {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -720 : 720,
      behavior: "smooth",
    });
  }

  return (
    <section className="shell mt-10">
      {/* Row header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
        {(href || onViewMore) && (
          onViewMore ? (
            <button
              onClick={onViewMore}
              className="group flex items-center gap-1 text-sm text-cyan-300 transition hover:text-cyan-200"
            >
              View more
              <ChevronRight size={16} className="transition group-hover:translate-x-1" />
            </button>
          ) : (
            <Link
              href={href!}
              className="group flex items-center gap-1 text-sm text-cyan-300 transition hover:text-cyan-200"
            >
              View more
              <ChevronRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
          )
        )}
      </div>

      {/* Scrollable row with hover arrows on left/right edges */}
      <div className="group/row relative">
        {/* Left arrow */}
        <button
          type="button"
          onClick={() => scrollRow("left")}
          aria-label={`Scroll ${title} left`}
          className="absolute left-0 top-1/2 z-10 -translate-x-3 -translate-y-1/2 grid size-10 place-items-center rounded-full border border-white/20 bg-black/70 text-white opacity-0 shadow-lg backdrop-blur transition-all duration-200 hover:border-cyan-300/60 hover:text-cyan-300 group-hover/row:opacity-100"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Right arrow */}
        <button
          type="button"
          onClick={() => scrollRow("right")}
          aria-label={`Scroll ${title} right`}
          className="absolute right-0 top-1/2 z-10 translate-x-3 -translate-y-1/2 grid size-10 place-items-center rounded-full border border-white/20 bg-black/70 text-white opacity-0 shadow-lg backdrop-blur transition-all duration-200 hover:border-cyan-300/60 hover:text-cyan-300 group-hover/row:opacity-100"
        >
          <ChevronRight size={20} />
        </button>

        <div
          ref={scrollerRef}
          className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 py-2"
        >
          {items.map((item) => (
            <MovieCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
