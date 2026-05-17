import Link from "next/link";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          🎯 QuizTime
        </Link>
        
        <div className="flex gap-6">
          <Link href="/quizzes" className="hover:text-gray-200 transition">
            Quizuri
          </Link>
          <Link href="/leaderboard" className="hover:text-gray-200 transition">
            Clasament
          </Link>
          {session?.user ? (
            <>
              <Link href="/profile" className="hover:text-gray-200 transition">
                Profil
              </Link>
              <form action="/api/auth/signout" method="post">
                <button className="hover:text-gray-200 transition">
                  Logout
                </button>
              </form>
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
