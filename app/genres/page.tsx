import { movies } from "@/data/movies";
import { series } from "@/data/series";
import type { Content } from "@/data/movies";
import { ContentRow } from "@/components/ContentRow";
import { getTmdbFeaturedGenres } from "@/lib/tmdb";
import { GenresFilter } from "@/components/GenresFilter";

export const metadata = {
  title: "Genres — MoonFury",
  description: "Browse movies and TV series by genre on MoonFury.",
};

const FEATURED = ["Action", "Science Fiction", "Drama", "Thriller"];

export default async function GenresPage() {
  const tmdbFeatured = await getTmdbFeaturedGenres(FEATURED);

  const local: Content[] = [...movies, ...series];
  const featuredItems: Record<string, Content[]> = Object.fromEntries(
    FEATURED.map((g) => {
      const tmdb = tmdbFeatured[g];
      if (tmdb && tmdb.length > 0) return [g, tmdb];
      return [g, local.filter((c) => c.genres.includes(g)).slice(0, 12)];
    })
  );

  return (
    <div className="py-8">
      <div className="shell">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-purple-300">
            Discover
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Genres
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Pick a mood. MoonFury has stories for every state of mind.
          </p>
        </div>

        {/* Client-side filter + genre grid */}
        <GenresFilter />

        {/* Featured rows */}
        <div className="mt-14 space-y-2">
          {FEATURED.map((g) => {
            const items = featuredItems[g];
            if (!items || items.length === 0) return null;
            return (
              <ContentRow
                key={g}
                title={`Featured: ${g}`}
                items={items}
                href={`/genres/${g.toLowerCase().replaceAll(" ", "-")}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
