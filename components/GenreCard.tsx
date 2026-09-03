import Link from "next/link";

const gradients = [
  "from-cyan-500/20 via-cyan-400/5 to-transparent",
  "from-purple-500/20 via-purple-400/5 to-transparent",
  "from-blue-500/20 via-blue-400/5 to-transparent",
  "from-pink-500/20 via-pink-400/5 to-transparent",
  "from-emerald-500/20 via-emerald-400/5 to-transparent",
  "from-amber-500/20 via-amber-400/5 to-transparent",
  "from-rose-500/20 via-rose-400/5 to-transparent",
  "from-indigo-500/20 via-indigo-400/5 to-transparent",
];

export function GenreCard({
  genre,
  index,
  mediaFilter,
}: {
  genre: string;
  index: number;
  mediaFilter?: "movie" | "tv";
}) {
  const slug = genre.toLowerCase().replaceAll(" ", "-");
  const href = mediaFilter
    ? `/genres/${slug}?type=${mediaFilter}`
    : `/genres/${slug}`;
  const gradient = gradients[index % gradients.length];

  return (
    <Link
      href={href}
      className="card group relative min-h-32 overflow-hidden rounded-lg p-5 transition hover:border-cyan-300/60 hover:shadow-[0_0_20px_rgba(0,242,255,0.12)]"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 transition group-hover:opacity-100`}
      />
      <span className="absolute right-3 top-[-20px] select-none text-8xl font-black text-white/5">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="relative text-lg font-bold text-white">{genre}</span>
      <p className="relative mt-2 text-sm text-cyan-300">
        {mediaFilter === "movie" ? "Movies only" : mediaFilter === "tv" ? "Series only" : "Explore collection"}
      </p>
    </Link>
  );
}
