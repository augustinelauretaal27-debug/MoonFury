import { notFound } from "next/navigation";
import type { Content } from "@/data/movies";
import { getTmdbContent, getTmdbRecommendations } from "@/lib/tmdb";
import WatchClient from "@/components/WatchClient";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
};

export default async function WatchPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { type } = await searchParams;

  if (!/^\d+$/.test(id)) notFound();

  let content: Content | null = null;

  if (type === "tv") {
    // Explicit TV hint — only try TV, never fall back to movie
    content = await getTmdbContent(id, "tv");
  } else if (type === "movie") {
    // Explicit movie hint — only try movie
    content = await getTmdbContent(id, "movie");
  } else {
    // No hint — fetch both in parallel, trust whichever gives a result.
    // TV is preferred when both succeed (ambiguous IDs are more commonly TV).
    const [movie, tv] = await Promise.all([
      getTmdbContent(id, "movie"),
      getTmdbContent(id, "tv"),
    ]);
    content = tv ?? movie;
  }

  if (!content) notFound();

  const recommendations = await getTmdbRecommendations(id, content.type);

  return <WatchClient id={id} content={content} recommendations={recommendations} />;
}
