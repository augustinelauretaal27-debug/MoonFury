import { ContentRow } from "@/components/ContentRow";
import { series } from "@/data/series";
import { MovieCard } from "@/components/MovieCard";
import { EmptyState } from "@/components/EmptyState";
import { getTmdbTvCatalog } from "@/lib/tmdb";
import type { Content } from "@/data/movies";

export const metadata = {
  title: "TV Series — MoonFury",
  description: "Binge-worthy original series on MoonFury.",
};

export default async function TvPage() {
  const tmdb = await getTmdbTvCatalog();

  // Fall back to local static data if TMDB isn't configured
  const topRated: Content[] = tmdb?.topRated ?? [...series].sort((a, b) => b.rating - a.rating).slice(0, 10);
  const popular: Content[] = tmdb?.popular ?? [...series].sort((a, b) => b.rating - a.rating).slice(0, 10);
  const onTheAir: Content[] = tmdb?.onTheAir ?? [];
  const airingToday: Content[] = tmdb?.airingToday ?? [];
  const allSeries: Content[] = tmdb
    ? [...new Map([...topRated, ...popular, ...onTheAir, ...airingToday].map((s) => [s.id, s])).values()]
    : [...series].sort((a, b) => b.rating - a.rating);

  return (
    <div className="py-8">
      <div className="shell">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-purple-300">
              Series
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              TV Series
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Binge-worthy originals — one episode at a time.
            </p>
          </div>
          <div className="hidden text-right text-xs text-slate-500 sm:block">
            <p className="text-2xl font-bold text-white">{allSeries.length}+</p>
            <p>shows</p>
          </div>
        </div>

        <ContentRow title="Top Rated" items={topRated} />
        <ContentRow title="Popular Now" items={popular} />
        {onTheAir.length > 0 && (
          <ContentRow title="On The Air" items={onTheAir} />
        )}
        {airingToday.length > 0 && (
          <ContentRow title="Airing Today" items={airingToday} />
        )}

        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold sm:text-2xl">All Series</h2>
          {allSeries.length === 0 ? (
            <EmptyState
              title="No series yet"
              description="New seasons are on the way."
              actionHref="/"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {allSeries.map((s) => (
                <MovieCard key={s.id} item={s} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
