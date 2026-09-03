import { MovieCard } from "./MovieCard";
import type { Content } from "@/data/movies";

export function Top10Row({ items }: { items: Content[] }) {
  if (items.length === 0) return null;
  const topItems = items.slice(0, 10);

  return (
    <section className="shell mt-10">
      <h2 className="mb-4 text-xl font-bold sm:text-2xl">
        Top 10 in Singapore Today
      </h2>
      <div className="no-scrollbar flex gap-2 overflow-x-auto py-2">
        {topItems.map((item, index) => (
          <div
            key={item.id}
            className="relative flex shrink-0 items-end"
          >
            <span className="top-number mr-[-17px] select-none pointer-events-none">
              {index + 1}
            </span>
            <MovieCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
