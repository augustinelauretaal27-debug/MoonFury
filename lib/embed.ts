// lib/embed.ts

export type MediaType = "tv" | "movie";
export type SourceType = "embed";

export const CINESRC_ORIGIN = "https://cinesrc.st";
const CINESRC_EMBED_BASE = `${CINESRC_ORIGIN}/embed`;

export interface StreamSource {
  id: "cinesrc";
  name: "CineSrc";
  url: string;
  type: SourceType;
}

export interface ProviderSummary {
  id: "cinesrc";
  name: "CineSrc";
  badge: "HD";
  hasSubs: true;
  priority: 1;
}

export interface EmbedOptions {
  season?: number;
  episode?: number;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  autoNext?: boolean;
  autoSkip?: boolean;
  prioritize?: boolean;
  continuePrompt?: boolean;
  startTime?: number;
  seek?: number;
  quality?: string;
  lastServer?: string;
  color?: string;
  back?: string;
  febbox?: string;
}

export interface EmbedValidationResult {
  isValid: boolean;
  tmdbId: number;
  mediaType: MediaType;
  season?: number;
  episode?: number;
  error?: string;
}

function appendBooleanParam(
  searchParams: URLSearchParams,
  key: string,
  value?: boolean
) {
  if (typeof value === "boolean") {
    searchParams.set(key, String(value));
  }
}

function appendNumberParam(
  searchParams: URLSearchParams,
  key: string,
  value?: number
) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    searchParams.set(key, String(Math.floor(value)));
  }
}

export function validateEmbedParams(
  tmdbId: number,
  mediaType: MediaType,
  season?: number,
  episode?: number
): EmbedValidationResult {
  const result: EmbedValidationResult = {
    isValid: true,
    tmdbId,
    mediaType,
  };

  if (!Number.isFinite(tmdbId) || tmdbId <= 0) {
    return {
      ...result,
      isValid: false,
      error: "Invalid TMDB ID. Must be a positive number.",
    };
  }

  if (mediaType === "tv") {
    const seasonNumber = season ?? 1;
    const episodeNumber = episode ?? 1;

    if (!Number.isFinite(seasonNumber) || seasonNumber < 1) {
      return {
        ...result,
        isValid: false,
        error: "Invalid season number. Must be 1 or greater.",
      };
    }

    if (!Number.isFinite(episodeNumber) || episodeNumber < 1) {
      return {
        ...result,
        isValid: false,
        error: "Invalid episode number. Must be 1 or greater.",
      };
    }

    result.season = seasonNumber;
    result.episode = episodeNumber;
  }

  return result;
}

export function buildEmbedUrl(
  tmdbId: number,
  mediaType: MediaType,
  options: EmbedOptions = {}
): string {
  const validation = validateEmbedParams(
    tmdbId,
    mediaType,
    options.season,
    options.episode
  );

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const path =
    mediaType === "movie"
      ? `${CINESRC_EMBED_BASE}/movie/${tmdbId}`
      : `${CINESRC_EMBED_BASE}/tv/${tmdbId}`;

  const url = new URL(path);

  if (mediaType === "tv") {
    url.searchParams.set("s", String(options.season ?? 1));
    url.searchParams.set("e", String(options.episode ?? 1));
  }

  appendNumberParam(url.searchParams, "t", options.startTime);
  appendNumberParam(url.searchParams, "seek", options.seek);
  appendBooleanParam(url.searchParams, "autoplay", options.autoplay);
  appendBooleanParam(url.searchParams, "muted", options.muted);
  appendBooleanParam(url.searchParams, "controls", options.controls);
  appendBooleanParam(url.searchParams, "autonext", options.autoNext);
  appendBooleanParam(url.searchParams, "autoskip", options.autoSkip);
  appendBooleanParam(url.searchParams, "prioritize", options.prioritize);
  appendBooleanParam(
    url.searchParams,
    "continueprompt",
    options.continuePrompt
  );

  if (options.quality) {
    url.searchParams.set("quality", options.quality);
  }

  if (options.lastServer) {
    url.searchParams.set("lastserver", options.lastServer);
  }

  if (options.color) {
    url.searchParams.set("color", options.color);
  }

  if (options.back) {
    url.searchParams.set("back", options.back);
  }

  if (options.febbox) {
    url.searchParams.set("febbox", options.febbox);
  }

  return url.toString();
}

export function getMovieSources(
  tmdbId: number,
  options: Omit<EmbedOptions, "season" | "episode"> = {}
): StreamSource[] {
  return [
    {
      id: "cinesrc",
      name: "CineSrc",
      url: buildEmbedUrl(tmdbId, "movie", options),
      type: "embed",
    },
  ];
}

export function getTVSources(
  tmdbId: number,
  season: number,
  episode: number,
  options: EmbedOptions = {}
): StreamSource[] {
  return [
    {
      id: "cinesrc",
      name: "CineSrc",
      url: buildEmbedUrl(tmdbId, "tv", {
        ...options,
        season,
        episode,
      }),
      type: "embed",
    },
  ];
}

export function getSourceById(
  providerId: string,
  tmdbId: number,
  mediaType: MediaType,
  season = 1,
  episode = 1,
  options: EmbedOptions = {}
): StreamSource | null {
  if (providerId !== "cinesrc") {
    return null;
  }

  return {
    id: "cinesrc",
    name: "CineSrc",
    url: buildEmbedUrl(tmdbId, mediaType, {
      ...options,
      season,
      episode,
    }),
    type: "embed",
  };
}

export function getActiveProviders(): ProviderSummary[] {
  return [
    {
      id: "cinesrc",
      name: "CineSrc",
      badge: "HD",
      hasSubs: true,
      priority: 1,
    },
  ];
}

export function getProviderList(): ProviderSummary[] {
  return getActiveProviders();
}

export function getProviderCount(): number {
  return 1;
}

export async function testEmbedUrl(
  url: string,
  timeout = 10_000
): Promise<{
  accessible: boolean;
  error?: string;
  responseTime?: number;
}> {
  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return {
      accessible: true,
      responseTime: Math.round(performance.now() - start),
    };
  } catch (error) {
    return {
      accessible: false,
      error: error instanceof Error ? error.message : "Unknown error",
      responseTime: Math.round(performance.now() - start),
    };
  }
}

export function logEmbedUrls(
  tmdbId: number,
  mediaType: MediaType,
  season?: number,
  episode?: number
): void {
  const url = buildEmbedUrl(tmdbId, mediaType, {
    season,
    episode,
  });

  console.log(`[CineSrc] ${mediaType.toUpperCase()} embed for TMDB:${tmdbId}`, url);
}

const embed = {
  buildEmbedUrl,
  getMovieSources,
  getTVSources,
  getSourceById,
  getActiveProviders,
  getProviderList,
  getProviderCount,
  logEmbedUrls,
  testEmbedUrl,
  validateEmbedParams,
};

export default embed;
