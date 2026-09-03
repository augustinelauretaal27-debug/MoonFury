import type { Series } from "./movies";

// No local mock data — all content is served from TMDB
export const series: Series[] = [];

export function findSeriesById(_id: string): Series | undefined {
  return undefined;
}
