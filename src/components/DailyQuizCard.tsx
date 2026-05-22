"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getDisplayStreakDays,
  isDailyQuizCompletedToday,
  nextStreakMilestone,
  readDailyQuizFields,
  STREAK_MILESTONES,
} from "@/lib/daily-quiz";
import { Button } from "@/components/ui/button";

type DailyQuizCardProps = {
  userId: string;
};

export default function DailyQuizCard({ userId }: DailyQuizCardProps) {
  const [streakDays, setStreakDays] = useState(0);
  const [displayStreak, setDisplayStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        const fields = readDailyQuizFields(snap.data());
        setStreakDays(fields.streakDays);
        setDisplayStreak(
          getDisplayStreakDays(fields.lastQuizDate, fields.streakDays)
        );
        setCompletedToday(isDailyQuizCompletedToday(fields.lastQuizDate));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsubscribe;
  }, [userId]);

  const nextMilestone = nextStreakMilestone(
    completedToday ? streakDays : displayStreak
  );
  const progressTarget = nextMilestone ?? STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
  const progressCurrent = completedToday ? streakDays : displayStreak;
  const progressPct = Math.min(
    100,
    Math.round((progressCurrent / progressTarget) * 100)
  );

  if (loading) {
    return (
      <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 p-5 shadow-sm animate-pulse h-36" />
    );
  }

  return (
    <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400">
            Quizul zilei · Daily
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Streak curent: {displayStreak}{" "}
            {displayStreak === 1 ? "zi" : "zile"}
          </p>
          <p
            className={`mt-1 text-sm font-medium ${
              completedToday
                ? "text-green-700 dark:text-green-400"
                : "text-orange-800 dark:text-orange-300"
            }`}
          >
            {completedToday ? "Completat azi" : "Disponibil azi"}
          </p>
        </div>

        {!completedToday ? (
          <Link href="/daily" className="shrink-0">
            <Button>Joacă Daily</Button>
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/40 px-3 py-1 text-sm font-medium text-green-800 dark:text-green-300">
            ✓ Finalizat
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>Progres streak</span>
          <span>
            {progressCurrent}/{progressTarget} zile
            {nextMilestone ? ` → bonus la ${nextMilestone} zile` : " — maxim!"}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-orange-100 dark:bg-orange-900/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-2 flex gap-2 flex-wrap">
          {STREAK_MILESTONES.map((m) => (
            <span
              key={m}
              className={`text-xs px-2 py-0.5 rounded-full border ${
                (completedToday ? streakDays : displayStreak) >= m
                  ? "border-amber-400 bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-600"
                  : "border-gray-200 text-gray-500 dark:border-gray-600 dark:text-gray-400"
              }`}
            >
              {m}z 🔥
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
