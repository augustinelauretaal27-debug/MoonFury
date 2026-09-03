export function SkeletonCard() {
  return (
    <div className="card w-36 shrink-0 animate-pulse overflow-hidden rounded-lg sm:w-44 md:w-48">
      <div className="aspect-[2/3] bg-white/5" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-3/4 rounded bg-white/10" />
        <div className="h-2 w-1/2 rounded bg-white/5" />
      </div>
    </div>
  );
}

export function SkeletonRow({ count = 6 }: { count?: number }) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 py-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <section className="relative isolate min-h-[590px] overflow-hidden bg-white/5 animate-pulse">
      <div className="shell flex min-h-[590px] items-end pb-16 pt-28">
        <div className="max-w-xl space-y-4">
          <div className="h-3 w-52 rounded bg-white/10" />
          <div className="h-12 w-80 rounded bg-white/10" />
          <div className="h-3 w-72 rounded bg-white/10" />
          <div className="h-16 w-full rounded bg-white/5" />
          <div className="flex flex-wrap gap-3 pt-2">
            <div className="h-11 w-32 rounded bg-white/10" />
            <div className="h-11 w-36 rounded bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
