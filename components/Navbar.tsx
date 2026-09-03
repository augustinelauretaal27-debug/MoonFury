
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  Settings,
  Menu,
  X,
  ListVideo,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { SearchPopup } from "@/components/SearchPopup";

export function Navbar() {
  const path = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!moreRef.current?.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  // Ctrl + K / Cmd + K opens search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const isActive = (href: string): boolean => {
    if (href === "/") return path === "/";
    return path === href || path?.startsWith(href + "/");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="border-b border-white/[0.08] bg-[#070b14]/75 backdrop-blur-2xl">
          <div className="mx-auto flex h-[68px] max-w-7xl items-center px-4 sm:px-6 lg:px-8">

            {/* ───────────────── Logo ───────────────── */}
            <div className="flex flex-1 items-center">
              <Link
                href="/"
                className="group flex items-center gap-2.5"
                onClick={closeMobileMenu}
              >
                <div className="relative flex size-9 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.06] shadow-lg transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/image.png"
                    alt="MoonFury"
                    width={36}
                    height={36}
                    className="object-cover"
                  />
                </div>

                <span className="text-[20px] font-extrabold tracking-tight text-white transition-opacity group-hover:opacity-90">
                  MoonFury
                </span>
              </Link>
            </div>

            {/* ───────────────── Desktop Navigation ───────────────── */}
            <div className="hidden items-center gap-1 md:flex">

              {/* Home */}
              <Link
                href="/"
                className={`group relative px-4 py-2 text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "text-white"
                    : "text-white/55 hover:text-white"
                }`}
              >
                Home

                {isActive("/") && (
                  <span className="absolute bottom-[-17px] left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]" />
                )}
              </Link>

              {/* Genres */}
              <Link
                href="/genres"
                className={`group relative px-4 py-2 text-sm font-medium transition-colors ${
                  isActive("/genres")
                    ? "text-white"
                    : "text-white/55 hover:text-white"
                }`}
              >
                Genres

                {isActive("/genres") && (
                  <span className="absolute bottom-[-17px] left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]" />
                )}
              </Link>

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search movies and TV shows"
                className="ml-3 flex h-9 w-[290px] items-center gap-2.5 rounded-full border border-white/[0.10] bg-white/[0.045] px-4 text-sm text-white/40 shadow-inner transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.075] hover:text-white/65 focus:outline-none focus:ring-2 focus:ring-white/10"
              >
                <Search size={15} className="shrink-0" />

                <span className="flex-1 text-left">
                  Search movies & shows...
                </span>

                <span className="hidden rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/30 lg:block">
                  Ctrl K
                </span>
              </button>

              {/* My List */}
              <Link
                href="/my-list"
                className={`ml-2 px-4 py-2 text-sm font-medium transition-colors ${
                  isActive("/my-list")
                    ? "text-white"
                    : "text-white/55 hover:text-white"
                }`}
              >
                My List
              </Link>
            </div>

            {/* ───────────────── Right Actions ───────────────── */}
            <div className="flex flex-1 items-center justify-end gap-2">

              {/* Mobile Search */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.045] text-white/65 transition-all hover:bg-white/[0.09] hover:text-white sm:hidden"
              >
                <Search size={18} />
              </button>

              {/* More Menu */}
              <div ref={moreRef} className="relative hidden sm:block">
                <button
                  onClick={() => setMoreOpen((value) => !value)}
                  aria-label="More options"
                  aria-expanded={moreOpen}
                  className={`grid size-9 place-items-center rounded-full border transition-all ${
                    moreOpen
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/10 bg-white/[0.045] text-white/65 hover:bg-white/[0.09] hover:text-white"
                  }`}
                >
                  <MoreHorizontal size={19} />
                </button>

                {moreOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#0c1220]/95 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-2xl">

                    <Link
                      href="/history"
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/[0.07] hover:text-white"
                    >
                      <Clock size={16} />
                      History
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/[0.07] hover:text-white"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileMenuOpen((value) => !value)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
                className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.045] text-white/65 transition-all hover:bg-white/[0.09] hover:text-white md:hidden"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* ───────────────── Mobile Menu ───────────────── */}
          {mobileMenuOpen && (
            <div className="border-t border-white/[0.07] bg-[#080d18]/95 px-4 pb-5 pt-3 backdrop-blur-2xl md:hidden">
              <div className="space-y-1">

                {/* Home */}
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className={`flex items-center justify-between rounded-lg px-3.5 py-3 text-sm font-medium transition ${
                    isActive("/")
                      ? "bg-white/[0.09] text-white"
                      : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  Home

                  {isActive("/") && (
                    <span className="size-1.5 rounded-full bg-white shadow-[0_0_7px_rgba(255,255,255,0.8)]" />
                  )}
                </Link>

                {/* Genres */}
                <Link
                  href="/genres"
                  onClick={closeMobileMenu}
                  className={`flex items-center justify-between rounded-lg px-3.5 py-3 text-sm font-medium transition ${
                    isActive("/genres")
                      ? "bg-white/[0.09] text-white"
                      : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  Genres

                  {isActive("/genres") && (
                    <span className="size-1.5 rounded-full bg-white shadow-[0_0_7px_rgba(255,255,255,0.8)]" />
                  )}
                </Link>

                {/* My List */}
                <Link
                  href="/my-list"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium transition ${
                    isActive("/my-list")
                      ? "bg-white/[0.09] text-white"
                      : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <ListVideo size={17} />
                  My List
                </Link>

                {/* History */}
                <Link
                  href="/history"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium transition ${
                    isActive("/history")
                      ? "bg-white/[0.09] text-white"
                      : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Clock size={17} />
                  History
                </Link>

                <div className="my-2 border-t border-white/[0.07]" />

                {/* Settings */}
                <Link
                  href="/settings"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium text-white/65 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <Settings size={17} />
                  Settings
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Search */}
      {searchOpen && (
        <SearchPopup onClose={() => setSearchOpen(false)} />
      )}
    </>
  );
}
