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

type TmdbResponse = { results?: TmdbItem[] };

type TmdbDetail = TmdbItem & {
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres?: { id: number; name: string }[];
  credits?: {
    cast?: { name: string }[];
    crew?: { job: string; name: string }[];
  };
};

const movieGenres: Record<number, string> = {
  12: "Adventure", 14: "Fantasy", 16: "Animation", 18: "Drama",
  27: "Horror", 28: "Action", 35: "Comedy", 53: "Thriller",
  80: "Crime", 99: "Documentary", 878: "Science Fiction",
  9648: "Mystery", 10749: "Romance", 10751: "Family",
};

const tvGenres: Record<number, string> = {
  16: "Animation", 18: "Drama", 35: "Comedy", 80: "Crime",
  99: "Documentary", 9648: "Mystery", 10749: "Romance",
  10751: "Family", 10759: "Action", 10762: "Kids",
  10763: "News", 10764: "Reality", 10765: "Science Fiction",
  10766: "Soap", 10767: "Talk", 10768: "War",
};

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

async function request<T = TmdbResponse>(path: string): Promise<T | null> {
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  const apiKey = process.env.TMDB_API_KEY;
  if (apiKey) url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    headers: headers(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    // 404 means the ID doesn't exist for this media type — not a real error
    if (response.status !== 404) {
      console.error(`TMDB request failed: ${response.status} ${path}`);
    }
    return null;
  }

  return response.json() as Promise<T>;
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
      .filter((genre): genre is string => Boolean(genre))
      .slice(0, 3),
    overview: item.overview || "Details are not available yet.",
    poster: item.poster_path ?? "",
    backdrop: item.backdrop_path ?? item.poster_path ?? "",
    actors: [],
    director: "",
  };
}

async function list(path: string, type: ContentType) {
  const data = await request(path);
  if (!data) return [];
  return (data.results ?? []).filter((item) => item.poster_path).map((item) => toContent(item, type));
}

export type HomeCatalog = {
  latestMovies: Content[];
  topMovies: Content[];
  topRatedMovies: Content[];
  upcomingMovies: Content[];
  latestSeries: Content[];
  usSeries: Content[];
  kDrama: Content[];
  upcomingSeries: Content[];
};

// Reverse maps: genre name → TMDB genre id
const movieGenreIds: Record<string, number> = Object.fromEntries(
  Object.entries(movieGenres).map(([id, name]) => [name, Number(id)])
);
const tvGenreIds: Record<string, number> = {
  ...Object.fromEntries(Object.entries(tvGenres).map(([id, name]) => [name, Number(id)])),
  // TV uses "Action & Adventure" (10759) for both Action and Adventure
  "Action": 10759,
  "Adventure": 10759,
  // TV uses "Sci-Fi & Fantasy" (10765) for both Science Fiction and Fantasy
  "Fantasy": 10765,
  "Science Fiction": 10765,
  // Horror/Thriller don't have dedicated TV genre IDs — use Drama as closest fallback
  "Horror": 18,
  "Thriller": 18,
};

export type MoviesCatalog = {
  topRated: Content[];
  popular: Content[];
  nowPlaying: Content[];
  upcoming: Content[];
};

export async function getTmdbMoviesCatalog(): Promise<MoviesCatalog | null> {
  if (!isConfigured()) return null;
  try {
    const [topRated, popular, nowPlaying, upcoming] = await Promise.all([
      list("/movie/top_rated?language=en-US&page=1", "movie"),
      list("/movie/popular?language=en-US&page=1", "movie"),
      list("/movie/now_playing?language=en-US&page=1", "movie"),
      list("/movie/upcoming?language=en-US&page=1", "movie"),
    ]);
    return { topRated, popular, nowPlaying, upcoming };
  } catch (error) {
    console.error("Unable to load TMDB movies catalog", error);
    return null;
  }
}

export type TvCatalog = {
  topRated: Content[];
  popular: Content[];
  onTheAir: Content[];
  airingToday: Content[];
};

export async function getTmdbTvCatalog(): Promise<TvCatalog | null> {
  if (!isConfigured()) return null;
  try {
    const [topRated, popular, onTheAir, airingToday] = await Promise.all([
      list("/tv/top_rated?language=en-US&page=1", "tv"),
      list("/tv/popular?language=en-US&page=1", "tv"),
      list("/tv/on_the_air?language=en-US&page=1", "tv"),
      list("/tv/airing_today?language=en-US&page=1", "tv"),
    ]);
    return { topRated, popular, onTheAir, airingToday };
  } catch (error) {
    console.error("Unable to load TMDB TV catalog", error);
    return null;
  }
}

export type GenreCatalog = {
  movies: Content[];
  series: Content[];
};

export async function getTmdbGenreCatalog(genre: string): Promise<GenreCatalog | null> {
  if (!isConfigured()) return null;
  try {
    const movieGenreId = movieGenreIds[genre];
    const tvGenreId = tvGenreIds[genre];

    // Fetch 5 pages per type (up to 100 items each)
    const moviePages = movieGenreId
      ? await Promise.all([1, 2, 3, 4, 5].map((page) =>
          list(`/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=${movieGenreId}&page=${page}`, "movie")
        ))
      : [];
    const tvPages = tvGenreId
      ? await Promise.all([1, 2, 3, 4, 5].map((page) =>
          list(`/discover/tv?language=en-US&sort_by=popularity.desc&with_genres=${tvGenreId}&page=${page}`, "tv")
        ))
      : [];

    // Flatten + deduplicate by id
    const movies = [
      ...new Map(moviePages.flat().map((c) => [c.id, c])).values(),
    ];
    const series = [
      ...new Map(tvPages.flat().map((c) => [c.id, c])).values(),
    ];

    return { movies, series };
  } catch (error) {
    console.error(`Unable to load TMDB genre catalog for ${genre}`, error);
    return null;
  }
}

export async function getTmdbFeaturedGenres(
  genres: string[]
): Promise<Record<string, Content[]>> {
  if (!isConfigured()) return {};
  try {
    const results = await Promise.all(
      genres.map(async (genre) => {
        const movieGenreId = movieGenreIds[genre];
        const tvGenreId = tvGenreIds[genre];
        const [movieItems, tvItems] = await Promise.all([
          movieGenreId
            ? list(`/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=${movieGenreId}&page=1`, "movie")
            : Promise.resolve([] as Content[]),
          tvGenreId
            ? list(`/discover/tv?language=en-US&sort_by=popularity.desc&with_genres=${tvGenreId}&page=1`, "tv")
            : Promise.resolve([] as Content[]),
        ]);
        // Deduplicate and limit to 20
        const combined = [...new Map([...movieItems, ...tvItems].map((c) => [c.id, c])).values()].slice(0, 20);
        return [genre, combined] as [string, Content[]];
      })
    );
    return Object.fromEntries(results);
  } catch (error) {
    console.error("Unable to load TMDB featured genres", error);
    return {};
  }
}

export async function getTmdbHomeCatalog(): Promise<HomeCatalog | null> {
  if (!isConfigured()) return null;

  try {
    const today = new Date().toISOString().slice(0, 10);
    // Future date: 2 weeks from now for upcoming
    const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [latestMovies, topMovies, topRatedMovies, upcomingMovies, latestSeries, usSeries, kDrama, upcomingSeries] = await Promise.all([
      // Latest = recently released movies (last 60 days), sorted by release date
      list(`/discover/movie?language=en-US&sort_by=primary_release_date.desc&primary_release_date.lte=${today}&primary_release_date.gte=${new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}&vote_count.gte=10`, "movie"),
      // Popular = all-time popularity sorted
      list("/movie/popular?language=en-US&page=1", "movie"),
      // Top rated = highest vote average
      list("/movie/top_rated?language=en-US&page=1", "movie"),
      // Upcoming = only future release dates
      list(`/discover/movie?language=en-US&sort_by=popularity.desc&primary_release_date.gte=${today}&primary_release_date.lte=2027-12-31`, "movie"),
      list("/tv/on_the_air?language=en-US&page=1", "tv"),
      list("/discover/tv?language=en-US&sort_by=popularity.desc&with_origin_country=US", "tv"),
      list("/discover/tv?language=en-US&sort_by=popularity.desc&with_original_language=ko", "tv"),
      list(`/discover/tv?language=en-US&sort_by=popularity.desc&first_air_date.gte=${today}`, "tv"),
    ]);
    return { latestMovies, topMovies, topRatedMovies, upcomingMovies, latestSeries, usSeries, kDrama, upcomingSeries };
  } catch (error) {
    console.error("Unable to load TMDB home catalog", error);
    return null;
  }
}

export async function getTmdbRecommendations(
  id: string,
  type: ContentType
): Promise<Content[]> {
  if (!isConfigured() || !/^\d+$/.test(id)) return [];

  try {
    const endpoint = type === "movie" ? "movie" : "tv";
    return await list(`/${endpoint}/${id}/recommendations?language=en-US&page=1`, type);
  } catch (error) {
    console.error(`Unable to load TMDB recommendations for ${type} ${id}`, error);
    return [];
  }
}

export type TmdbEpisode = {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  runtime: number | null;
  still_path: string | null;
  vote_average: number;
  air_date: string | null;
};

export type TmdbSeasonDetail = {
  season_number: number;
  name: string;
  episodes: TmdbEpisode[];
};

export async function getTmdbSeason(
  seriesId: string,
  seasonNumber: number
): Promise<TmdbSeasonDetail | null> {
  if (!isConfigured() || !/^\d+$/.test(seriesId)) return null;
  try {
    const data = await request<TmdbSeasonDetail>(
      `/tv/${seriesId}/season/${seasonNumber}?language=en-US`
    );
    return data ?? null;
  } catch (error) {
    console.error(`Unable to load TMDB season ${seasonNumber} for ${seriesId}`, error);
    return null;
  }
}

export type TmdbSeriesDetail = {
  id: number;
  name: string;
  number_of_seasons: number;
  seasons: { season_number: number; episode_count: number; name: string; poster_path: string | null }[];
};

export async function getTmdbSeriesSeasons(seriesId: string): Promise<TmdbSeriesDetail | null> {
  if (!isConfigured() || !/^\d+$/.test(seriesId)) return null;
  try {
    const data = await request<TmdbSeriesDetail>(`/tv/${seriesId}?language=en-US`);
    return data ?? null;
  } catch (error) {
    console.error(`Unable to load TMDB series seasons for ${seriesId}`, error);
    return null;
  }
}

export async function getTmdbContent(
  id: string,
  type: ContentType
): Promise<Content | null> {
  if (!isConfigured() || !/^\d+$/.test(id)) return null;

  const endpoint = type === "movie" ? "movie" : "tv";

  try {
    const detail = await request<TmdbDetail>(
      `/${endpoint}/${id}?language=en-US&append_to_response=credits`
    );

    if (!detail) return null;

    // Validate the response actually matches the requested type.
    // Movie responses have `title` + `release_date`; TV has `name` + `first_air_date`.
    if (type === "movie" && !detail.title) return null;
    if (type === "tv" && !detail.name) return null;

    const content = toContent(detail, type);
    const director = detail.credits?.crew?.find((person) =>
      type === "movie" ? person.job === "Director" : person.job === "Executive Producer"
    )?.name;

    return {
      ...content,
      runtime: detail.runtime,
      genres: detail.genres?.map((genre) => genre.name) ?? content.genres,
      actors: detail.credits?.cast?.slice(0, 5).map((person) => person.name) ?? [],
      director: director ?? "—",
    };
  } catch (error) {
    console.error(`Unable to load TMDB ${type} ${id}`, error);
    return null;
  }
}
