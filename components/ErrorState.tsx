import { AlertTriangle } from "lucide-react";

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card grid min-h-64 place-items-center rounded-xl p-10 text-center">
      <div>
        <div className="mx-auto grid size-16 place-items-center rounded-full border border-red-400/20 bg-red-400/5">
          <AlertTriangle className="text-red-300" size={28} />
        </div>
        <h2 className="mt-5 text-xl font-bold text-white">{title}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
          {description}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 rounded gradient px-5 py-2.5 text-sm font-bold text-[#071617] transition hover:opacity-90"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
