import type { Series } from "@/data/movies";
import { MovieCard } from "./MovieCard";

export function SeriesCard({ item }: { item: Series }) {
  return <MovieCard item={item} />;
}
