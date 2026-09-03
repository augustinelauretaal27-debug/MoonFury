import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Play, Star, User, ChevronLeft, Share2, ListVideo } from "lucide-react";
import { imageUrl } from "@/lib/utils";
import { WatchlistButton } from "@/components/WatchlistButton";
import { TvEpisodes } from "@/components/TvEpisodes";
import { getTmdbContent, getTmdbRecommendations, getTmdbSeriesSeasons } from "@/lib/tmdb";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const s = await getTmdbContent(id, "tv");
  if (!s) return { title: "Not Found — MoonFury" };
  return {
    title: `${s.title} — MoonFury`,
    description: s.overview,
  };
}

export default async function SeriesDetailsPage({ params }: Props) {
  const { id } = await params;

  const [s, seriesDetail, recommendations] = await Promise.all([
    getTmdbContent(id, "tv"),
    getTmdbSeriesSeasons(id),
    getTmdbRecommendations(id, "tv"),
  ]);

  if (!s) notFound();

  const seasons = seriesDetail?.seasons ?? [];
  const validSeasons = seasons.filter((s) => s.season_number > 0 && s.episode_count > 0);

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate min-h-[70vh] overflow-hidden lg:min-h-[80vh]">
        <img
          src={imageUrl(s.backdrop, "original")}
          alt=""
          aria-hidden
          className="absolute inset-0 -z-20 size-full object-cover object-[65%_center]"
        />
        <div className="details-vignette absolute inset-0 -z-10" />

        <div className="shell pt-28">
          <Link
            href="/tv"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ChevronLeft size={16} />
            Back to Series
          </Link>
        </div>

        <div className="shell flex min-h-[55vh] items-end pb-12 pt-10">
          <div className="grid w-full items-end gap-8 lg:grid-cols-12">
            {/* Poster */}
            <div className="hidden lg:col-span-3 lg:block">
              <div className="relative -translate-y-8 overflow-hidden rounded-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
                <div className="aspect-[2/3]">
                  <img
                    src={imageUrl(s.poster, "w500")}
                    alt={`${s.title} poster`}
                    className="size-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-9">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {s.genres.map((g) => (
                  <span key={g} className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                    {g}
                  </span>
                ))}
                <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  4K UHD
                </span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {s.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <span className="inline-flex items-center gap-1.5 text-amber-300">
                  <Star size={16} fill="currentColor" />
                  <span className="font-bold">{s.rating}</span>/10
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ListVideo size={16} className="text-slate-500" />
                  {validSeasons.length > 0 ? `${validSeasons.length} Season${validSeasons.length > 1 ? "s" : ""}` : "Series"}
                </span>
                <span>{s.year}</span>
                {s.director && s.director !== "—" && (
                  <span className="inline-flex items-center gap-1.5">
                    <User size={16} className="text-slate-500" />
                    {s.director}
                  </span>
                )}
              </div>

              <p className="mt-5 max-w-3xl leading-7 text-slate-200 sm:text-lg">
                {s.overview}
              </p>

              {s.actors?.length ? (
                <p className="mt-4 max-w-3xl text-sm text-slate-400">
                  <span className="text-slate-500">Cast: </span>
                  {s.actors.join(", ")}
                </p>
              ) : null}

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/watch/${s.id}?type=tv`}
                  className="gradient inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-[#071617] transition hover:opacity-90 ambient-glow"
                >
                  <Play size={18} fill="currentColor" />
                  Play S1:E1
                </Link>
                <WatchlistButton id={s.id} type="tv" />
                <button
                  type="button"
                  className="grid size-12 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 backdrop-blur transition hover:border-white/25 hover:text-cyan-300"
                  aria-label="Share"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile poster */}
      <section className="shell mt-8 lg:hidden">
        <div className="flex gap-4">
          <div className="w-28 shrink-0">
            <div className="overflow-hidden rounded-xl border border-white/10">
              <img src={imageUrl(s.poster, "w342")} alt={`${s.title} poster`} className="size-full object-cover" />
            </div>
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <dl className="space-y-1.5">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Year</dt>
                <dd className="text-slate-200">{s.year}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Seasons</dt>
                <dd className="text-slate-200">{validSeasons.length || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Rating</dt>
                <dd className="text-slate-200">{s.rating}/10</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ── Two-column: Episodes + More Like This ── */}
      <div className="shell mt-12 pb-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px]">

          {/* Left: Episodes */}
          <div>
            {validSeasons.length > 0 ? (
              <TvEpisodes seriesId={id} seasons={validSeasons} />
            ) : (
              <p className="text-sm text-slate-500">Episode data is not available for this series.</p>
            )}
          </div>

          {/* Right: More Like This */}
          {recommendations.length > 0 && (
            <div>
              <h2 className="mb-5 text-xl font-bold text-white">More Like This</h2>
              <div className="grid grid-cols-2 gap-3">
                {recommendations.slice(0, 8).map((item) => (
                  <Link
                    key={item.id}
                    href={`/${item.type === "tv" ? "tv" : "movies"}/${item.id}`}
                    className="group relative overflow-hidden rounded-lg border border-white/5 bg-white/[0.02] transition hover:border-cyan-300/30"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden bg-slate-900">
                      <img
                        src={imageUrl(item.poster, "w342")}
                        alt={item.title}
                        className="size-full object-cover transition duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs font-semibold text-white">{item.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                        <Star size={9} className="fill-cyan-300 text-cyan-300" />
                        {item.rating} · {item.year}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
