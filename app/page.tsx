import { HeroBanner } from "@/components/HeroBanner";
import { ContentRow } from "@/components/ContentRow";
import { ContinueWatching } from "@/components/ContinueWatching";
import { getTmdbHomeCatalog } from "@/lib/tmdb";
import type { Content } from "@/data/movies";

export default async function HomePage() {
  const catalog = await getTmdbHomeCatalog();

  // Fallback empty arrays if TMDB isn't configured
  const latestMovies: Content[] = catalog?.latestMovies ?? [];
  const topMovies: Content[] = catalog?.topMovies ?? [];
  const topRatedMovies: Content[] = catalog?.topRatedMovies ?? [];
  const upcomingMovies: Content[] = catalog?.upcomingMovies ?? [];
  const latestSeries: Content[] = catalog?.latestSeries ?? [];
  const usSeries: Content[] = catalog?.usSeries ?? [];
  const kDrama: Content[] = catalog?.kDrama ?? [];
  const upcomingSeries: Content[] = catalog?.upcomingSeries ?? [];

  const featuredItems = [...topMovies, ...latestSeries].slice(0, 5);

  return (
    <div>
      {featuredItems.length > 0 && <HeroBanner items={featuredItems} />}

      <ContinueWatching />

      <ContentRow title="Latest Movies" items={latestMovies} href="/explore?type=movie&sort=latest" />
      <ContentRow title="Popular Movies" items={topMovies} href="/explore?type=movie&sort=popular" />
      <ContentRow title="Top Rated Movies" items={topRatedMovies} href="/explore?type=movie&sort=top_rated" />
      <ContentRow title="Upcoming Movies" items={upcomingMovies} href="/explore?type=movie&sort=upcoming" />
      <ContentRow title="Latest Series" items={latestSeries} href="/explore?type=tv&sort=latest" />
      <ContentRow title="US Series" items={usSeries} href="/explore?type=tv&sort=popular&region=US" />
      <ContentRow title="Latest K-Drama" items={kDrama} href="/explore?type=tv&sort=popular&lang=ko" />
      <ContentRow title="Upcoming Series" items={upcomingSeries} href="/explore?type=tv&sort=upcoming" />

      <div className="h-10" />
    </div>
  );
}
