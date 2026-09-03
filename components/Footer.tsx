import Image from "next/image";
import Link from "next/link";
import { Twitter, Instagram, Youtube } from "lucide-react";

// Static Data Definitions
const SOCIAL_LINKS = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

const BROWSE_LINKS = [
  { label: "Movies", href: "/movies" },
  { label: "TV Series", href: "/tv" },
  { label: "Genres", href: "/genres" },
  { label: "New Releases", href: "/new-releases" },
  { label: "Top 10", href: "/top-10" },
];

const USER_LINKS = [
  { label: "My List", href: "/my-list" },
  { label: "History", href: "/history" },
  { label: "Search", href: "/search" },
  { label: "Settings", href: "/settings" },
];

const QUALITY_TAGS = ["4K UHD", "HDR10+", "Dolby Vision", "5.1 Audio", "AD"];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-white/10 py-12 text-slate-400">
      <div className="shell">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand Info */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-bold text-white transition hover:opacity-90"
            >
              <Image
                src="/image.png"
                alt="MoonFury Logo"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <span className="gradient-text text-xl">MoonFury</span>
            </Link>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              A cinematic discovery experience. Stream original stories without limits.
            </p>

            {/* Social Icons */}
            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid size-9 place-items-center rounded-full border border-white/10 text-slate-400 transition-colors duration-200 hover:border-cyan-300 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation - Browse */}
          <nav aria-label="Browse navigation">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Browse
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {BROWSE_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="transition-colors duration-200 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Navigation - My MoonFury */}
          <nav aria-label="User account navigation">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              My MoonFury
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {USER_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="transition-colors duration-200 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Quality Tags & Disclaimer */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Quality
            </h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {QUALITY_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-6 text-xs leading-5 text-slate-500">
              Content metadata provided by TMDB. MoonFury is a cinematic discovery
              platform. All rights reserved.
            </p>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          &copy; {currentYear} MoonFury. Developed by Toothless.
        </div>
      </div>
    </footer>
  );
}