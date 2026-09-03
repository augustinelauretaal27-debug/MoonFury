"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ListVideo, History } from "lucide-react";
import type { ComponentType } from "react";

type NavItem = [string, ComponentType<{ size?: number; className?: string }>, string];

const items: NavItem[] = [
  ["/", Home, "Home"],
  ["/search", Search, "Search"],
  ["/my-list", ListVideo, "My List"],
  ["/history", History, "History"],
];

export function MobileBottomNav() {
  const path = usePathname();

  const isActive = (href: string): boolean => {
    if (href === "/") return path === "/";
    return path === href || path?.startsWith(href + "/");
  };

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-white/10 md:hidden">
      {items.map(([href, Icon, label]) => (
        <Link
          key={href as string}
          href={href as string}
          className={`flex flex-col items-center gap-1 text-xs transition ${
            isActive(href as string)
              ? "text-cyan-300"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
