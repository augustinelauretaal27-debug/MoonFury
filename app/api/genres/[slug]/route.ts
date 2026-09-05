import { NextRequest, NextResponse } from "next/server";
import { slugToGenre } from "@/data/genres";
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

type TmdbResponse = { results?: TmdbItem[]; total_pages?: number; total_results?: number };

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

const movieGenreIds: Record<string, number> = {
  Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80,
  Documentary: 99, Drama: 18, Fantasy: 14, Horror: 27, Mystery: 9648,
  Romance: 10749, "Science Fiction": 878, Thriller: 53,
};
const tvGenreIds: Record<string, number> = {
  Action: 10759, Adventure: 10759, Animation: 16, Comedy: 35, Crime: 80,
  Documentary: 99, Drama: 18, Fantasy: 10765, Horror: 18, Mystery: 9648,
  Romance: 10749, "Science Fiction": 10765, Thriller: 18,
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
  const genreMap = type === "movie" ? movieGenres : tvGenres;
  return {
    id: String(item.id),
    title: item.title ?? item.name ?? "Untitled",
    type,
    year: Number(date?.slice(0, 4)) || new Date().getFullYear(),
    rating: Number(item.vote_average.toFixed(1)),
    genres: (item.genre_ids ?? [])
      .map((id) => genreMap[id])
      .filter((g): g is string => Boolean(g))
      .slice(0, 3),
    overview: item.overview || "Details not available.",
    poster: item.poster_path ?? "",
    backdrop: item.backdrop_path ?? item.poster_path ?? "",
    actors: [],
    director: "",
  };
}

async function fetchPage(
  mediaType: "movie" | "tv",
  genreId: number,
  page: number
): Promise<{ items: Content[]; totalPages: number; totalResults: number }> {
  const url = new URL(`https://api.themoviedb.org/3/discover/${mediaType}`);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("sort_by", "popularity.desc");
  url.searchParams.set("with_genres", String(genreId));
  url.searchParams.set("page", String(page));

  const apiKey = process.env.TMDB_API_KEY;
  if (apiKey) url.searchParams.set("api_key", apiKey);

  const res = await fetch(url, {
    headers: authHeaders(),
    next: { revalidate: 3600 },
  });

  if (!res.ok) return { items: [], totalPages: 0, totalResults: 0 };

  const data: TmdbResponse = await res.json();
  const items = (data.results ?? [])
    .filter((i) => i.poster_path)
    .map((i) => toContent(i, mediaType));

  return {
    items,
    totalPages: Math.min(data.total_pages ?? 1, 500),
    totalResults: data.total_results ?? 0,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isConfigured()) {
    return NextResponse.json({ movies: [], series: [], totalMoviePages: 0, totalSeriesPages: 0 });
  }

  const { slug } = await params;
  const genre = slugToGenre(slug);
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const type = req.nextUrl.searchParams.get("type") ?? "all"; // "movie" | "tv" | "all"

  const movieGenreId = movieGenreIds[genre];
  const tvGenreId = tvGenreIds[genre];

  try {
    const [movieResult, tvResult] = await Promise.all([
      type !== "tv" && movieGenreId
        ? fetchPage("movie", movieGenreId, page)
        : Promise.resolve({ items: [] as Content[], totalPages: 0, totalResults: 0 }),
      type !== "movie" && tvGenreId
        ? fetchPage("tv", tvGenreId, page)
        : Promise.resolve({ items: [] as Content[], totalPages: 0, totalResults: 0 }),
    ]);

    return NextResponse.json({
      movies: movieResult.items,
      series: tvResult.items,
      totalMoviePages: movieResult.totalPages,
      totalSeriesPages: tvResult.totalPages,
      totalMovieResults: movieResult.totalResults,
      totalSeriesResults: tvResult.totalResults,
      page,
    });
  } catch (error) {
    console.error("Genre API error", error);
    return NextResponse.json({ movies: [], series: [], totalMoviePages: 0, totalSeriesPages: 0 });
  }
}
