import { NextResponse } from "next/server";
import type { Content, ContentType } from "@/data/movies";

type TmdbItem = {
  id: number;
  media_type?: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
};

type TmdbResponse = { results?: TmdbItem[] };

const movieGenres: Record<number, string> = {
  12: "Adventure", 14: "Fantasy", 16: "Animation", 18: "Drama",
  27: "Horror", 28: "Action", 35: "Comedy", 53: "Thriller",
  80: "Crime", 878: "Science Fiction", 9648: "Mystery", 10749: "Romance",
  99: "Documentary",
};

const tvGenres: Record<number, string> = {
  18: "Drama", 35: "Comedy", 80: "Crime", 10759: "Action",
  10765: "Science Fiction", 9648: "Mystery", 10749: "Romance",
  99: "Documentary",
};

function toContent(item: TmdbItem, fallbackType: ContentType = "movie"): Content | null {
  const type: ContentType =
    item.media_type === "tv" ? "tv" : item.media_type === "movie" ? "movie" : fallbackType;
  const date = type === "movie" ? item.release_date : item.first_air_date;
  const genreMap = type === "movie" ? movieGenres : tvGenres;

  return {
    id: String(item.id),
    title: item.title ?? item.name ?? "Untitled",
    type,
    year: Number(date?.slice(0, 4)) || new Date().getFullYear(),
    rating: Number((item.vote_average ?? 0).toFixed(1)),
    genres: (item.genre_ids ?? [])
      .map((id) => genreMap[id])
      .filter((g): g is string => Boolean(g))
      .slice(0, 3),
    overview: item.overview || "Details are not available yet.",
    poster: item.poster_path ?? "",
    backdrop: item.backdrop_path ?? item.poster_path ?? "",
    actors: [],
    director: "",
  };
}

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

async function fetchList(path: string, fallbackType: ContentType): Promise<Content[]> {
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  const apiKey = process.env.TMDB_API_KEY;
  if (apiKey) url.searchParams.set("api_key", apiKey);

  const res = await fetch(url, {
    headers: authHeaders(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TMDB request failed: ${res.status}`);
  const data: TmdbResponse = await res.json();
  return (data.results ?? [])
    .filter((item) => item.poster_path && item.media_type !== "person")
    .map((item) => toContent(item, fallbackType))
    .filter((c): c is Content => c !== null);
}

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ results: [], configured: false });
  }

  try {
    // Fetch trending all + popular movies + popular TV in parallel
    const [trending, popularMovies, popularTv] = await Promise.all([
      fetchList("/trending/all/week?language=en-US", "movie"),
      fetchList("/movie/popular?language=en-US&page=1", "movie"),
      fetchList("/tv/popular?language=en-US&page=1", "tv"),
    ]);

    // Merge and deduplicate, trending first
    const seen = new Set<string>();
    const results: Content[] = [];
    for (const item of [...trending, ...popularMovies, ...popularTv]) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        results.push(item);
      }
    }

    return NextResponse.json({ results: results.slice(0, 40), configured: true });
  } catch (error) {
    console.error("TMDB trending error", error);
    return NextResponse.json({ results: [], configured: true, error: true });
  }
}
