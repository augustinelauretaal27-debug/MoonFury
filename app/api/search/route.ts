import { NextRequest, NextResponse } from "next/server";
import type { Content, ContentType } from "@/data/movies";

type TmdbMultiItem = {
  id: number;
  media_type: "movie" | "tv" | "person";
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

type TmdbMultiResponse = { results?: TmdbMultiItem[] };

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

function toContent(item: TmdbMultiItem): Content | null {
  const type: ContentType = item.media_type === "tv" ? "tv" : "movie";
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

function headers() {
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

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const type = req.nextUrl.searchParams.get("type") ?? "all"; // "all" | "movie" | "tv"

  if (!isConfigured()) {
    return NextResponse.json({ results: [], configured: false });
  }

  if (q.length === 0) {
    return NextResponse.json({ results: [], configured: true });
  }

  try {
    const url = new URL("https://api.themoviedb.org/3/search/multi");
    url.searchParams.set("query", q);
    url.searchParams.set("language", "en-US");
    url.searchParams.set("page", "1");
    url.searchParams.set("include_adult", "false");

    const apiKey = process.env.TMDB_API_KEY;
    if (apiKey) url.searchParams.set("api_key", apiKey);

    const res = await fetch(url, {
      headers: headers(),
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`TMDB search failed: ${res.status}`);

    const data: TmdbMultiResponse = await res.json();

    let results = (data.results ?? [])
      .filter((item) => item.media_type !== "person" && item.poster_path)
      .map(toContent)
      .filter((c): c is Content => c !== null);

    if (type === "movie") results = results.filter((c) => c.type === "movie");
    if (type === "tv") results = results.filter((c) => c.type === "tv");

    return NextResponse.json({ results, configured: true });
  } catch (error) {
    console.error("TMDB search error", error);
    return NextResponse.json({ results: [], configured: true, error: true });
  }
}
