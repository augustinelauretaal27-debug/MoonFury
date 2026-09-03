export function ProgressBar({
  progress,
  height = "h-1",
  showLabel = false,
}: {
  progress: number;
  height?: string;
  showLabel?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, progress * 100));
  return (
    <div className="flex items-center gap-2">
      <div className={`relative ${height} flex-1 rounded-full bg-white/15 overflow-hidden`}>
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-400 tabular-nums">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
