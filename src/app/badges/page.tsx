"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import {
  BADGE_CATEGORY_LABELS,
  BADGE_DEFINITIONS,
  badgesByCategory,
  readUserBadges,
} from "@/lib/badges";
import type { BadgeCategory, BadgeDefinition, BadgeId } from "@/types/badges";

function BadgeCard({
  badge,
  obtained,
}: {
  badge: BadgeDefinition;
  obtained: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 transition ${
        obtained
          ? "border-amber-300 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30 shadow-sm"
          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 opacity-80"
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`text-3xl shrink-0 ${obtained ? "" : "grayscale opacity-50"}`}
          aria-hidden
        >
          {badge.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">
              {badge.name}
            </h3>
            <span
              className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                obtained
                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {obtained ? "Obținut" : "Neobținut"}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {badge.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function CategorySection({
  category,
  badges,
  earnedSet,
}: {
  category: BadgeCategory;
  badges: BadgeDefinition[];
  earnedSet: Set<BadgeId>;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        {BADGE_CATEGORY_LABELS[category]}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {badges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            obtained={earnedSet.has(badge.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default function BadgesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [earnedIds, setEarnedIds] = useState<BadgeId[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => badgesByCategory(), []);
  const earnedSet = useMemo(() => new Set(earnedIds), [earnedIds]);
  const obtainedCount = earnedIds.length;
  const totalCount = BADGE_DEFINITIONS.length;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const userId = user.uid;

    async function loadBadges() {
      setLoading(true);
      setError(null);
      try {
        const snapshot = await getDoc(doc(db, "users", userId));
        const state = readUserBadges(snapshot.data());
        setEarnedIds(state.earnedIds);
        setStreakCount(state.streakCount);
      } catch {
        setError("Nu am putut încărca insignele. Încearcă din nou.");
      } finally {
        setLoading(false);
      }
    }

    loadBadges();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="text-center py-12 dark:text-gray-300">
        Se încarcă insignele...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            🏅 Insignele Mele
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Câștigă insignele jucând quiz-uri și menținând o serie zilnică.
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="mb-6 bg-red-100 dark:bg-red-950/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded"
          >
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Obținute
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
              {obtainedCount} / {totalCount}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Neobținute
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
              {totalCount - obtainedCount}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Serie zilnică
            </p>
            <p className="mt-2 text-3xl font-bold text-orange-600 dark:text-orange-400">
              {streakCount} {streakCount === 1 ? "zi" : "zile"}
            </p>
          </div>
        </div>

        {(Object.keys(grouped) as BadgeCategory[]).map((category) => (
          <CategorySection
            key={category}
            category={category}
            badges={grouped[category]}
            earnedSet={earnedSet}
          />
        ))}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          <Link href="/quizzes" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Mergi la quiz-uri
          </Link>{" "}
          pentru a obține mai multe insignele.
        </p>
      </div>
    </div>
  );
}
