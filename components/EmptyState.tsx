import { Clapperboard } from "lucide-react";
import Link from "next/link";

export function EmptyState({
  title = "Nothing here yet",
  description = "Explore MoonFury and save something you want to watch.",
  actionHref = "/",
  actionLabel = "Explore now",
}: {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card grid min-h-64 place-items-center rounded-xl p-10 text-center">
      <div>
        <div className="mx-auto grid size-16 place-items-center rounded-full border border-cyan-300/20 bg-cyan-300/5">
          <Clapperboard className="text-cyan-300" size={28} />
        </div>
        <h2 className="mt-5 text-xl font-bold text-white">{title}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
          {description}
        </p>
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="mt-6 inline-flex items-center rounded gradient px-5 py-2.5 text-sm font-bold text-[#071617] transition hover:opacity-90"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
