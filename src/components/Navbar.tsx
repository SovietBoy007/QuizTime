"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const router = useRouter();
  const { user, username, loading, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          🎯 QuizTime
        </Link>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link href="/quizzes" className="hover:text-gray-200 transition">
            Quizuri
          </Link>
          <Link href="/leaderboard" className="hover:text-gray-200 transition">
            Clasament
          </Link>
          <Link href="/badges" className="hover:text-gray-200 transition">
            Insigne
          </Link>
          {loading ? null : user ? (
            <>
              {username && (
                <span className="text-sm font-medium text-white/90">
                  @{username}
                </span>
              )}
              <Link href="/dashboard" className="hover:text-gray-200 transition">
                Dashboard
              </Link>
              <Link href="/profile" className="hover:text-gray-200 transition">
                Profil
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hover:text-gray-200 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-200 transition">
                Login
              </Link>
              <Link href="/register" className="hover:text-gray-200 transition">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
