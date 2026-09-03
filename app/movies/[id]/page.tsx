import { notFound } from "next/navigation";
import Link from "next/link";
import { movies } from "@/data/movies";
import type { Metadata } from "next";
import {
  Play,
  Plus,
  Star,
  Clock,
  User,
  ChevronLeft,
  Share2,
} from "lucide-react";
import { imageUrl, formatRuntime } from "@/lib/utils";
import { WatchlistButton } from "@/components/WatchlistButton";
import { RecommendationRow } from "@/components/RecommendationRow";
import { MovieCard } from "@/components/MovieCard";
import { getTmdbContent, getTmdbRecommendations } from "@/lib/tmdb";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const movie = movies.find((m) => m.id === id) ?? await getTmdbContent(id, "movie");
  if (!movie)
    return {
      title: "Not Found — MoonFury",
    };
  return {
    title: `${movie.title} — MoonFury`,
    description: movie.overview,
  };
}

export function generateStaticParams() {
  return movies.map((m) => ({ id: m.id }));
}

export default async function MovieDetailsPage({ params }: Props) {
  const { id } = await params;
  const movie = movies.find((m) => m.id === id) ?? await getTmdbContent(id, "movie");
  if (!movie) notFound();

  const recommendations = await getTmdbRecommendations(id, "movie");

  return (
    <div>
      <section className="relative isolate min-h-[70vh] overflow-hidden lg:min-h-screen">
        <img
          src={imageUrl(movie.backdrop, "original")}
          alt=""
          aria-hidden
          className="absolute inset-0 -z-20 size-full object-cover object-[65%_center]"
        />
        <div className="details-vignette absolute inset-0 -z-10" />

        <div className="shell pt-28">
          <Link
            href="/movies"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ChevronLeft size={16} />
            Back to Movies
          </Link>
        </div>

        <div className="shell flex min-h-[60vh] items-end pb-16 pt-10">
          <div className="grid w-full items-end gap-8 lg:grid-cols-12">
            <div className="hidden lg:col-span-3 lg:block">
              <div className="relative -translate-y-8 overflow-hidden rounded-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
                <div className="aspect-[2/3]">
                  <img
                    src={imageUrl(movie.poster, "w500")}
                    alt={`${movie.title} poster`}
                    className="size-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-9">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300"
                  >
                    {g}
                  </span>
                ))}
                <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  4K UHD
                </span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {movie.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <span className="inline-flex items-center gap-1.5 text-amber-300">
                  <Star size={16} fill="currentColor" />
                  <span className="font-bold">{movie.rating}</span>/10
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={16} className="text-slate-500" />
                  {movie.runtime ? formatRuntime(movie.runtime) : "—"}
                </span>
                <span>{movie.year}</span>
                <span className="inline-flex items-center gap-1.5">
                  <User size={16} className="text-slate-500" />
                  Dir. {movie.director}
                </span>
              </div>

              <p className="mt-5 max-w-3xl leading-7 text-slate-200 sm:text-lg">
                {movie.overview}
              </p>

              {movie.actors?.length ? (
                <p className="mt-5 max-w-3xl text-sm text-slate-400">
                  <span className="text-slate-500">Cast: </span>
                  {movie.actors.join(", ")}
                </p>
              ) : null}

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/watch/${movie.id}?type=movie`}
                  className="gradient inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-[#071617] transition hover:opacity-90 ambient-glow"
                >
                  <Play size={18} fill="currentColor" />
                  Play Now
                </Link>
                <WatchlistButton id={movie.id} type="movie" />
                <button
                  type="button"
                  className="grid size-12 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 backdrop-blur transition hover:border-white/25 hover:text-cyan-300"
                  aria-label="Share"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell mt-10 lg:hidden">
        <div className="flex gap-4">
          <div className="w-32 shrink-0 sm:w-40">
            <div className="overflow-hidden rounded-xl border border-white/10">
              <img
                src={imageUrl(movie.poster, "w342")}
                alt={`${movie.title} poster`}
                className="size-full object-cover"
              />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-white">Details</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Year</dt>
                <dd className="text-slate-200">{movie.year}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Director</dt>
                <dd className="text-right text-slate-200">{movie.director}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Runtime</dt>
                <dd className="text-slate-200">
                  {movie.runtime ? formatRuntime(movie.runtime) : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <RecommendationRow
        title="More Like This"
        items={recommendations}
        href={`/genres/${movie.genres[0]?.toLowerCase().replaceAll(" ", "-")}`}
      />

      {recommendations.length === 0 && (
        <section className="shell mt-12">
          <h2 className="mb-4 text-xl font-bold sm:text-2xl">Browse More</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {movies
              .filter((x) => x.id !== movie.id)
              .slice(0, 6)
              .map((m) => (
                <MovieCard key={m.id} item={m} />
              ))}
          </div>
        </section>
      )}

      <div className="h-12" />
    </div>
  );
}
