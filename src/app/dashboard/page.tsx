"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { subscribeUserResults } from "@/lib/quiz-firestore";
import {
  computeDashboardStats,
  resultPercentage,
} from "@/lib/quiz-stats";
import type { QuizResult } from "@/types/quiz";

function formatTopic(topic: string) {
  return topic.replace(/-/g, " ");
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, username, loading: authLoading } = useAuth();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    setResultsLoading(true);
    setResultsError(null);

    const unsubscribe = subscribeUserResults(
      user.uid,
      (nextResults) => {
        setResults(nextResults);
        setResultsLoading(false);
      },
      () => {
        setResultsError("Could not load your quiz results. Please try again.");
        setResultsLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const stats = useMemo(() => computeDashboardStats(results), [results]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              Welcome back
              {username ? (
                <>
                  , <span className="font-semibold">@{username}</span>
                </>
              ) : null}
              !
            </p>
          </div>
          <Link href="/quizzes" className="shrink-0">
            <Button>Take a quiz</Button>
          </Link>
        </header>

        {resultsError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {resultsError}
          </div>
        ) : null}

        {resultsLoading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading statistics...</p>
        ) : stats.totalQuizzes === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-8 text-center">
            <p className="text-gray-700 dark:text-gray-200 font-medium">
              No quiz results yet
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Complete a quiz while signed in and your stats will appear here.
            </p>
            <div className="mt-6">
              <Link href="/quizzes">
                <Button>Browse quizzes</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                label="Average score"
                value={`${stats.averageScore}%`}
                hint="Across all completed quizzes"
              />
              <StatCard
                label="Quizzes taken"
                value={String(stats.totalQuizzes)}
                hint="Total saved attempts"
              />
              <StatCard
                label="Weakest topic"
                value={
                  stats.weakestTopic
                    ? formatTopic(stats.weakestTopic.topic)
                    : "—"
                }
                hint={
                  stats.weakestTopic
                    ? `${stats.weakestTopic.averageScore}% average · ${stats.weakestTopic.attempts} attempt${stats.weakestTopic.attempts === 1 ? "" : "s"}`
                    : undefined
                }
              />
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent results
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Your last 5 quiz attempts
                </p>
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {stats.recentResults.map((result) => {
                    const pct = resultPercentage(result);
                    return (
                      <li
                        key={result.id}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 capitalize truncate">
                            {formatTopic(result.topic)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(result.createdAt)} · {result.score}/
                            {result.totalQuestions} correct
                          </p>
                        </div>
                        <span className="shrink-0 text-lg font-bold text-blue-600 dark:text-blue-400">
                          {pct}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Progress by topic
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Average score per topic
                </p>
                {stats.topicProgress.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No topic data yet.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {stats.topicProgress.map((topic) => (
                      <li key={topic.topic}>
                        <div className="flex items-center justify-between gap-2 text-sm mb-1">
                          <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                            {formatTopic(topic.topic)}
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">
                            {topic.averageScore}% · {topic.attempts} quiz
                            {topic.attempts === 1 ? "" : "zes"}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                            style={{ width: `${topic.averageScore}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
