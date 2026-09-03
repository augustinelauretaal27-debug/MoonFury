import { notFound } from "next/navigation";
import Link from "next/link";
import { genres, slugToGenre, genreToSlug } from "@/data/genres";
import { movies } from "@/data/movies";
import { series } from "@/data/series";
import type { Content } from "@/data/movies";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { getTmdbGenreCatalog } from "@/lib/tmdb";
import { GenreClient } from "@/components/GenreClient";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = slugToGenre(slug);
  return {
    title: `${name} — MoonFury`,
    description: `Browse all ${name} movies and series on MoonFury.`,
  };
}

export function generateStaticParams() {
  return genres.map((g) => ({ slug: genreToSlug(g) }));
}

export default async function GenrePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { type } = await searchParams;
  const genre = slugToGenre(slug);

  if (!genres.includes(genre)) notFound();

  const tmdb = await getTmdbGenreCatalog(genre);

  const local: Content[] = [...movies, ...series];
  const moviesOnly: Content[] =
    tmdb && tmdb.movies.length > 0
      ? tmdb.movies
      : local.filter((c) => c.type === "movie" && c.genres.includes(genre));
  const seriesOnly: Content[] =
    tmdb && tmdb.series.length > 0
      ? tmdb.series
      : local.filter((c) => c.type === "tv" && c.genres.includes(genre));

  // Fetch page-1 metadata for real total counts
  let initialMoviePages = 1;
  let initialSeriesPages = 1;
  let initialMovieResults = moviesOnly.length;
  let initialSeriesResults = seriesOnly.length;

  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(
      `${base}/api/genres/${slug}?page=1&type=all`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      initialMoviePages = data.totalMoviePages ?? 1;
      initialSeriesPages = data.totalSeriesPages ?? 1;
      initialMovieResults = data.totalMovieResults ?? moviesOnly.length;
      initialSeriesResults = data.totalSeriesResults ?? seriesOnly.length;
    }
  } catch {
    // fall back to local counts
  }

  const totalResults = initialMovieResults + initialSeriesResults;

  return (
    <div className="py-8">
      <div className="shell">
        {/* Back link */}
        <Link
          href="/genres"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
        >
          <ChevronLeft size={15} />
          All Genres
        </Link>

        {/* Compact header — matches screenshot */}
        <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.02] px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-cyan-300">
            Genre Collection
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {genre}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            A curated collection of {genre.toLowerCase()} titles on MoonFury.
          </p>
          {/* Stats row */}
          <div className="mt-4 flex flex-wrap items-baseline gap-5 text-sm">
            <span>
              <span className="text-xl font-extrabold text-white">{totalResults.toLocaleString()}+</span>
              <span className="ml-1 text-xs text-slate-500">titles</span>
            </span>
            <span>
              <span className="text-xl font-extrabold text-cyan-300">{initialMovieResults.toLocaleString()}+</span>
              <span className="ml-1 text-xs text-slate-500">movies</span>
            </span>
            <span>
              <span className="text-xl font-extrabold text-purple-300">{initialSeriesResults.toLocaleString()}+</span>
              <span className="ml-1 text-xs text-slate-500">series</span>
            </span>
          </div>
        </div>

        {/* Client component — filter bar + grid */}
        <GenreClient
          genre={genre}
          slug={slug}
          moviesOnly={moviesOnly}
          seriesOnly={seriesOnly}
          initialMoviePages={initialMoviePages}
          initialSeriesPages={initialSeriesPages}
          initialMovieResults={initialMovieResults}
          initialSeriesResults={initialSeriesResults}
          initialType={type === "movie" ? "Movies" : type === "tv" ? "TV Series" : "All"}
        />
      </div>
    </div>
  );
}
