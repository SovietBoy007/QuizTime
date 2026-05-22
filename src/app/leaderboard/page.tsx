"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import type { LeaderboardEntry, LeaderboardXpFilter } from "@/lib/gamification";
import { LEADERBOARD_XP_FILTERS } from "@/lib/gamification";
import UserAvatar from "@/components/UserAvatar";

async function fetchLeaderboardFromApi(
  limit: number,
  xpFilter: LeaderboardXpFilter
): Promise<LeaderboardEntry[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    xpFilter,
  });
  const res = await fetch(`/api/leaderboard?${params}`);
  if (!res.ok) throw new Error("Leaderboard fetch failed");
  return res.json() as Promise<LeaderboardEntry[]>;
}

function rankLabel(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return String(rank);
}

function LeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  return (
    <tr
      className={`border-b border-gray-200 dark:border-gray-700 transition ${
        isCurrentUser
          ? "bg-blue-50 dark:bg-blue-950/50 ring-2 ring-inset ring-blue-400 dark:ring-blue-500"
          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
      }`}
    >
      <td className="px-4 sm:px-6 py-4 font-bold text-lg w-16">
        {rankLabel(entry.rank)}
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar avatarId={entry.avatarId} size={36} />
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              @{entry.username}
            </span>
            {isCurrentUser ? (
              <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Tu
              </span>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 text-center font-semibold text-purple-600 dark:text-purple-400">
        {entry.xp.toLocaleString()}
      </td>
      <td className="px-4 sm:px-6 py-4 text-center font-semibold text-gray-900 dark:text-gray-100">
        {entry.totalScore.toLocaleString()}
      </td>
    </tr>
  );
}

function LeaderboardCard({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        isCurrentUser
          ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/50 ring-2 ring-blue-400 dark:ring-blue-500"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold w-8 shrink-0">{rankLabel(entry.rank)}</span>
        <UserAvatar avatarId={entry.avatarId} size={40} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            @{entry.username}
          </p>
          {isCurrentUser ? (
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Contul tău
            </p>
          ) : null}
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-900/60 px-3 py-2">
          <dt className="text-gray-500 dark:text-gray-400">XP</dt>
          <dd className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {entry.xp.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-900/60 px-3 py-2">
          <dt className="text-gray-500 dark:text-gray-400">Scor total</dt>
          <dd className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {entry.totalScore.toLocaleString()}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [xpFilter, setXpFilter] = useState<LeaderboardXpFilter>("total");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchLeaderboardFromApi(10, xpFilter);
        if (!cancelled) setEntries(data);
      } catch {
        if (!cancelled) {
          setError("Nu am putut încărca clasamentul. Încearcă din nou.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [xpFilter]);

  const xpColumnLabel =
    LEADERBOARD_XP_FILTERS.find((f) => f.value === xpFilter)?.label ?? "XP";

  const currentUserInTop10 = entries.some((e) => e.userId === user?.uid);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Clasament
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Top 10 jucători
            {xpFilter === "total"
              ? " după scorul total"
              : ` după XP ${xpColumnLabel.toLowerCase()}`}
            . Câștigi{" "}
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              10 XP
            </span>{" "}
            per răspuns corect, în categoria nivelului ales.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {LEADERBOARD_XP_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setXpFilter(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  xpFilter === filter.value
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </header>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="text-center py-12 text-gray-600 dark:text-gray-300">
            Se încarcă clasamentul...
          </p>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-8 text-center">
            <p className="text-gray-700 dark:text-gray-200 font-medium">
              Nu sunt încă rezultate pe clasament.
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Finalizează un quiz autentificat pentru a apărea aici.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left w-16">#</th>
                      <th className="px-6 py-4 text-left">Utilizator</th>
                      <th className="px-6 py-4 text-center">{xpColumnLabel}</th>
                      <th className="px-6 py-4 text-center">Scor total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <LeaderboardRow
                        key={entry.userId}
                        entry={entry}
                        isCurrentUser={entry.userId === user?.uid}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sm:hidden space-y-3">
              {entries.map((entry) => (
                <LeaderboardCard
                  key={entry.userId}
                  entry={entry}
                  isCurrentUser={entry.userId === user?.uid}
                />
              ))}
            </div>

            {user && !currentUserInTop10 ? (
              <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Nu ești în top 10 încă — continuă să joci pentru a urca!
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
