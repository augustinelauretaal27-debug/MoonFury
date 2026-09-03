import { SettingsPanel } from "@/components/SettingsPanel";

export const metadata = {
  title: "Settings — MoonFury",
  description: "Manage MoonFury playback, subtitles, and privacy preferences.",
};

export default function SettingsPage() {
  return (
    <div className="py-8">
      <div className="shell">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-300">
            Account-free
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Settings
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Everything is saved locally in your browser. No account, no
            tracking.
          </p>
        </div>

        <SettingsPanel />
      </div>
    </div>
  );
}
