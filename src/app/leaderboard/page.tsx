"use client";

import { useState, useEffect } from "react";

interface LeaderboardEntry {
  id: string;
  points: number;
  percentage: number;
  user: {
    username: string;
    avatar?: string;
  };
  quiz: {
    title: string;
  };
  completedAt: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    setLoading(true);
    try {
      const response = await fetch("/api/leaderboard?limit=100");
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          🏆 Clasament Global
        </h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Se încarcă clasamentul...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Nu sunt încă scoruri pe clasament.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">#</th>
                    <th className="px-6 py-4 text-left">Utilizator</th>
                    <th className="px-6 py-4 text-left">Quiz</th>
                    <th className="px-6 py-4 text-center">Puncte</th>
                    <th className="px-6 py-4 text-center">Procent</th>
                    <th className="px-6 py-4 text-left">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-bold text-lg">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {entry.user.avatar && (
                            <img
                              src={entry.user.avatar}
                              alt={entry.user.username}
                              className="w-10 h-10 rounded-full"
                            />
                          )}
                          <span className="font-medium text-gray-800">
                            {entry.user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {entry.quiz.title}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold">
                        {entry.points}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            entry.percentage >= 80
                              ? "bg-green-100 text-green-800"
                              : entry.percentage >= 60
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {entry.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(entry.completedAt).toLocaleDateString("ro-RO")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
