import { NextRequest, NextResponse } from "next/server";
import type { Content, ContentType } from "@/data/movies";

type TmdbItem = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
};

type TmdbResponse = {
  results?: TmdbItem[];
  total_pages?: number;
  total_results?: number;
};

const movieGenres: Record<number, string> = {
  12: "Adventure", 14: "Fantasy", 16: "Animation", 18: "Drama",
  27: "Horror", 28: "Action", 35: "Comedy", 53: "Thriller",
  80: "Crime", 99: "Documentary", 878: "Science Fiction",
  9648: "Mystery", 10749: "Romance",
};
const tvGenres: Record<number, string> = {
  16: "Animation", 18: "Drama", 35: "Comedy", 80: "Crime",
  99: "Documentary", 9648: "Mystery", 10749: "Romance",
  10759: "Action", 10765: "Science Fiction",
};

// Genre name → TMDB id
const GENRE_IDS: Record<string, { movie?: number; tv?: number }> = {
  Action:           { movie: 28,   tv: 10759 },
  Adventure:        { movie: 12,   tv: 10759 },
  Animation:        { movie: 16,   tv: 16 },
  Comedy:           { movie: 35,   tv: 35 },
  Crime:            { movie: 80,   tv: 80 },
  Documentary:      { movie: 99,   tv: 99 },
  Drama:            { movie: 18,   tv: 18 },
  Fantasy:          { movie: 14,   tv: 10765 },
  Horror:           { movie: 27 },
  Mystery:          { movie: 9648, tv: 9648 },
  Romance:          { movie: 10749, tv: 10749 },
  "Science Fiction":{ movie: 878,  tv: 10765 },
  Thriller:         { movie: 53 },
};

function authHeaders() {
  const token = process.env.TMDB_READ_ACCESS_TOKEN ?? process.env.TMDB_ACCESS_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function isConfigured() {
  return Boolean(
    process.env.TMDB_READ_ACCESS_TOKEN ||
      process.env.TMDB_ACCESS_TOKEN ||
      process.env.TMDB_API_KEY
  );
}

function toContent(item: TmdbItem, type: ContentType): Content {
  const date = type === "movie" ? item.release_date : item.first_air_date;
  const gMap = type === "movie" ? movieGenres : tvGenres;
  return {
    id: String(item.id),
    title: item.title ?? item.name ?? "Untitled",
    type,
    year: Number(date?.slice(0, 4)) || new Date().getFullYear(),
    rating: Number(item.vote_average.toFixed(1)),
    genres: (item.genre_ids ?? []).map((id) => gMap[id]).filter((g): g is string => Boolean(g)).slice(0, 3),
    overview: item.overview || "Details not available.",
    poster: item.poster_path ?? "",
    backdrop: item.backdrop_path ?? item.poster_path ?? "",
    actors: [],
    director: "",
  };
}

export async function GET(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ results: [], totalPages: 0, totalResults: 0 });
  }

  const sp = req.nextUrl.searchParams;
  const type    = sp.get("type") ?? "movie";       // "movie" | "tv" | "all"
  const sort    = sp.get("sort") ?? "popular";      // "popular"|"latest"|"top_rated"|"upcoming"
  const genre   = sp.get("genre") ?? "";
  const lang    = sp.get("lang") ?? "";
  const region  = sp.get("region") ?? "";
  const year    = sp.get("year") ?? "";
  const query   = sp.get("q") ?? "";
  const page    = Number(sp.get("page") ?? "1");

  // Sort map
  const sortMap: Record<string, string> = {
    popular:   "popularity.desc",
    latest:    "primary_release_date.desc",
    top_rated: "vote_average.desc",
    upcoming:  "primary_release_date.asc",
  };
  const tvSortMap: Record<string, string> = {
    popular:   "popularity.desc",
    latest:    "first_air_date.desc",
    top_rated: "vote_average.desc",
    upcoming:  "first_air_date.asc",
  };

  async function fetchEndpoint(mediaType: "movie" | "tv"): Promise<{ items: Content[]; totalPages: number; totalResults: number }> {
    let path = "";
    const params = new URLSearchParams({ language: "en-US", page: String(page) });

    if (query.trim()) {
      // Search mode
      path = `/search/${mediaType}`;
      params.set("query", query.trim());
    } else if (sort === "latest" && mediaType === "movie") {
      const today = new Date().toISOString().slice(0, 10);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      path = `/discover/${mediaType}`;
      params.set("sort_by", "primary_release_date.desc");
      params.set("primary_release_date.lte", today);
      params.set("primary_release_date.gte", sixtyDaysAgo);
      params.set("vote_count.gte", "10");
    } else if (sort === "latest" && mediaType === "tv") {
      path = "/tv/on_the_air";
    } else if (sort === "top_rated" && !genre) {
      path = `/${mediaType}/top_rated`;
    } else if (sort === "upcoming" && mediaType === "movie") {
      path = "/movie/upcoming";
    } else if (sort === "upcoming" && mediaType === "tv") {
      const today = new Date().toISOString().slice(0, 10);
      path = `/discover/${mediaType}`;
      params.set("sort_by", tvSortMap["upcoming"]);
      params.set("first_air_date.gte", today);
    } else {
      // Discover
      path = `/discover/${mediaType}`;
      const sortBy = mediaType === "movie" ? (sortMap[sort] ?? "popularity.desc") : (tvSortMap[sort] ?? "popularity.desc");
      params.set("sort_by", sortBy);
      // Only include vote_count filter for top_rated to avoid obscure results
      if (sort === "top_rated") params.set("vote_count.gte", "200");
    }

    // Genre filter
    if (genre) {
      const gEntry = GENRE_IDS[genre];
      const gId = mediaType === "movie" ? gEntry?.movie : gEntry?.tv;
      if (gId) params.set("with_genres", String(gId));
    }

    // Language filter (e.g. K-Drama = ko)
    if (lang) params.set("with_original_language", lang);

    // Region filter
    if (region && path.includes("/discover/")) params.set("with_origin_country", region);

    // Year filter
    if (year) {
      if (mediaType === "movie") {
        params.set("primary_release_year", year);
      } else {
        params.set("first_air_date_year", year);
      }
    }

    const url = new URL(`https://api.themoviedb.org/3${path}`);
    const apiKey = process.env.TMDB_API_KEY;
    if (apiKey) params.set("api_key", apiKey);
    url.search = params.toString();

    const res = await fetch(url, {
      headers: authHeaders(),
      next: { revalidate: 1800 },
    });

    if (!res.ok) return { items: [], totalPages: 0, totalResults: 0 };

    const data: TmdbResponse = await res.json();
    const items = (data.results ?? [])
      .filter((i) => i.poster_path)
      .map((i) => toContent(i, mediaType))
      .slice(0, 18);

    return {
      items,
      totalPages: Math.min(data.total_pages ?? 1, 500),
      totalResults: data.total_results ?? 0,
    };
  }

  try {
    if (type === "all") {
      const [movies, tvShows] = await Promise.all([
        fetchEndpoint("movie"),
        fetchEndpoint("tv"),
      ]);
      const combined = [...new Map([...movies.items, ...tvShows.items].map((c) => [c.id, c])).values()].slice(0, 18);
      return NextResponse.json({
        results: combined,
        totalPages: Math.max(movies.totalPages, tvShows.totalPages),
        totalResults: movies.totalResults + tvShows.totalResults,
      });
    }

    const result = await fetchEndpoint(type as "movie" | "tv");
    return NextResponse.json({
      results: result.items,
      totalPages: result.totalPages,
      totalResults: result.totalResults,
    });
  } catch (error) {
    console.error("Explore API error", error);
    return NextResponse.json({ results: [], totalPages: 0, totalResults: 0 });
  }
}
