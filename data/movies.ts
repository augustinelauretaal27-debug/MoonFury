export type ContentType = "movie" | "tv";

export type Content = {
  id: string;
  title: string;
  type: ContentType;
  year: number;
  rating: number;
  runtime?: number;
  genres: string[];
  overview: string;
  poster: string;
  backdrop: string;
  actors: string[];
  director: string;
};

export type Episode = {
  id: string;
  title: string;
  number: number;
  duration: number;
  overview: string;
  stillPath?: string;
};

export type Season = {
  number: number;
  episodes: Episode[];
};

export type Series = Content & {
  seasons: Season[];
};

// No local mock data — all content is served from TMDB
export const movies: Content[] = [];
