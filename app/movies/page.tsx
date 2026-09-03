import { ContentRow } from "@/components/ContentRow";
import { movies } from "@/data/movies";
import { MovieCard } from "@/components/MovieCard";
import { EmptyState } from "@/components/EmptyState";
import { getTmdbMoviesCatalog } from "@/lib/tmdb";
import type { Content } from "@/data/movies";

export const metadata = {
  title: "Movies — MoonFury",
  description: "Browse every movie on MoonFury.",
};

export default async function MoviesPage() {
  const tmdb = await getTmdbMoviesCatalog();

  // Fall back to local static data if TMDB isn't configured
  const topRated: Content[] = tmdb?.topRated ?? [...movies].sort((a, b) => b.rating - a.rating).slice(0, 12);
  const popular: Content[] = tmdb?.popular ?? [...movies].sort((a, b) => b.rating - a.rating).slice(0, 12);
  const nowPlaying: Content[] = tmdb?.nowPlaying ?? [];
  const upcoming: Content[] = tmdb?.upcoming ?? [];
  const allMovies: Content[] = tmdb
    ? [...new Map([...topRated, ...popular, ...nowPlaying, ...upcoming].map((m) => [m.id, m])).values()]
    : [...movies].sort((a, b) => b.rating - a.rating);

  return (
    <div className="py-8">
      <div className="shell">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-300">
              Library
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Movies
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Every original feature film on MoonFury.
            </p>
          </div>
          <div className="hidden text-right text-xs text-slate-500 sm:block">
            <p className="text-2xl font-bold text-white">{allMovies.length}+</p>
            <p>titles</p>
          </div>
        </div>

        <ContentRow title="Top Rated" items={topRated} />
        <ContentRow title="Popular Now" items={popular} />
        {nowPlaying.length > 0 && (
          <ContentRow title="Now Playing" items={nowPlaying} />
        )}
        {upcoming.length > 0 && (
          <ContentRow title="Coming Soon" items={upcoming} />
        )}

        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold sm:text-2xl">All Movies</h2>
          {allMovies.length === 0 ? (
            <EmptyState
              title="No movies yet"
              description="New titles are added every week."
              actionHref="/"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {allMovies.map((m) => (
                <MovieCard key={m.id} item={m} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
