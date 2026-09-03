export type FilterType = "All" | "Movies" | "TV Series";

export function FilterBar({
  value,
  onChange,
}: {
  value: FilterType;
  onChange: (value: FilterType) => void;
}) {
  const options: FilterType[] = ["All", "Movies", "TV Series"];
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {options.map((x) => (
        <button
          key={x}
          onClick={() => onChange(x)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            value === x
              ? "border-cyan-300 bg-cyan-300/10 text-cyan-300 shadow-[0_0_15px_rgba(0,242,255,0.1)]"
              : "border-white/10 text-slate-300 hover:border-white/25 hover:text-white"
          }`}
        >
          {x}
        </button>
      ))}
    </div>
  );
}
