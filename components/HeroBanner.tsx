"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Info, Play } from "lucide-react";
import type { Content } from "@/data/movies";
import { imageUrl } from "@/lib/utils";
import { useEffect, useState } from "react";

export function HeroBanner({ items }: { items: Content[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const item = items[activeIndex] ?? items[0];
  const detailHref = `/${item.type === "tv" ? "tv" : "movies"}/${item.id}`;

  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % items.length),
      7000
    );
    return () => window.clearInterval(timer);
  }, [items.length]);

  function goTo(index: number) {
    setActiveIndex((index + items.length) % items.length);
  }

  return (
    <section className="relative isolate min-h-[590px] overflow-hidden">
      <img
        key={item.id}
        src={imageUrl(item.backdrop, "original")}
        alt=""
        aria-hidden
        className="absolute inset-0 -z-20 size-full object-cover object-[65%_center]"
      />
      <div className="vignette absolute inset-0 -z-10" />
      <div className="shell flex min-h-[590px] items-end pb-16 pt-28">
        <div className="max-w-xl">
          <p className="mb-3 text-xs font-bold tracking-[.22em] text-cyan-300">
            MOONFURY ORIGINAL • 4K ULTRA HD
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {item.title}
          </h1>
          <p className="mt-4 text-sm text-slate-200 sm:text-base">
            {item.year}{" "}
            <span className="mx-2 text-cyan-300">●</span> {item.rating} Rating{" "}
            <span className="mx-2 text-cyan-300">●</span>{" "}
            {item.genres.join(" · ")}
          </p>
          <p className="mt-5 max-w-lg leading-7 text-slate-300 line-clamp-3 md:line-clamp-none">
            {item.overview}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={`/watch/${item.id}`}
              className="gradient inline-flex items-center gap-2 rounded px-5 py-3 font-bold text-[#071617] transition hover:opacity-90 ambient-glow"
            >
              <Play size={18} fill="currentColor" />
              Play now
            </Link>
            <Link
              href={detailHref}
              className="inline-flex items-center gap-2 rounded border border-white/20 bg-white/10 px-5 py-3 font-semibold backdrop-blur transition hover:bg-white/15"
            >
              <Info size={18} />
              More info
            </Link>
          </div>
        </div>
      </div>
      {items.length > 1 && (
        <>
          {/* Dots + arrows grouped at the bottom center */}
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
            <button
              type="button"
              aria-label="Previous featured title"
              onClick={() => goTo(activeIndex - 1)}
              className="grid size-8 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur transition hover:border-cyan-300 hover:text-cyan-200"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2">
              {items.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show ${slide.title}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  onClick={() => goTo(index)}
                  className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-7 bg-cyan-300" : "w-1.5 bg-white/45 hover:bg-white"}`}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Next featured title"
              onClick={() => goTo(activeIndex + 1)}
              className="grid size-8 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur transition hover:border-cyan-300 hover:text-cyan-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
