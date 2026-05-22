"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import UserAvatar from "@/components/UserAvatar";

const NAV_LINKS = [
  { href: "/quizzes", label: "Quizuri" },
  { href: "/leaderboard", label: "Clasament" },
  { href: "/daily", label: "Daily" },
  { href: "/badges", label: "Insigne" },
];

const AUTH_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profil" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, username, avatarId, loading, logout } = useAuth();
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    router.push("/");
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function linkClass(href: string, extra = "") {
    const base = "transition-colors font-medium text-sm " + extra;
    return isActive(href)
      ? base + " text-amber-500 dark:text-amber-400"
      : base + " text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white";
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">

          {/* LEFT: Logo + username */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="shrink-0 hover:opacity-85 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={theme === "dark" ? "/logoDark.png" : "/logoLight.png"}
                alt="QuizTime"
                style={{ display: "block", height: "56px", width: "auto", flexShrink: 0 }}
              />
            </Link>
            {!loading && user && (
              <div className="hidden sm:flex items-center gap-2 min-w-0">
                <UserAvatar avatarId={avatarId} size={32} className="ring-2 ring-amber-400/60 rounded-lg" />
                {username && (
                  <span className="text-gray-400 dark:text-gray-500 text-sm font-medium truncate max-w-[120px]">
                    @{username}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href, "px-3 py-2 rounded-md")}>
                {link.label}
              </Link>
            ))}

            {!loading && user && AUTH_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href, "px-3 py-2 rounded-md")}>
                {link.label}
              </Link>
            ))}

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-2" />

            {!loading && (
              user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Logout
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className={linkClass("/login", "px-3 py-2 rounded-md")}>
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold text-sm transition-colors shadow-sm"
                  >
                    Înregistrare
                  </Link>
                </div>
              )
            )}

            <ThemeToggle />
          </div>

          {/* MOBILE: hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label="Deschide meniul"
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-1">
            {!loading && user && (
              <div className="px-3 py-2 flex items-center gap-2">
                <UserAvatar avatarId={avatarId} size={28} className="ring-2 ring-amber-400/60 rounded-lg" />
                {username && (
                  <span className="text-gray-400 dark:text-gray-500 text-xs font-medium">
                    @{username}
                  </span>
                )}
              </div>
            )}

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={linkClass(link.href, "px-3 py-2.5 rounded-md block")}
              >
                {link.label}
              </Link>
            ))}

            {!loading && user && AUTH_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={linkClass(link.href, "px-3 py-2.5 rounded-md block")}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />

            {!loading && (
              user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-left px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className={linkClass("/login", "px-3 py-2.5 rounded-md block")}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="mx-3 mt-1 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold text-sm text-center transition-colors"
                  >
                    Înregistrare
                  </Link>
                </>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
