"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LEVEL_LABELS, LEVEL_STYLES } from "@/lib/quiz-levels";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import { fireQuizConfetti } from "@/lib/quiz-confetti";
import type { QuizSaveOutcome, SchoolLevel } from "@/types/quiz";

type QuizResultsProps = {
  quizTitle: string;
  category: string;
  level: SchoolLevel;
  score: number;
  totalQuestions: number;
  percentage: number;
  saving: boolean;
  saveError: string | null;
  saved?: boolean;
  xpOutcome: QuizSaveOutcome | null;
  wrongCount?: number;
  onReview?: () => void;
};

export default function QuizResults({
  quizTitle,
  category,
  level,
  score,
  totalQuestions,
  percentage,
  saving,
  saveError,
  saved,
  xpOutcome,
  wrongCount = 0,
  onReview,
}: QuizResultsProps) {
  const confettiFiredRef = useRef(false);

  const gradeMessage =
    percentage >= 80
      ? "Excelent!"
      : percentage >= 60
      ? "Foarte bine!"
      : percentage >= 40
      ? "Continuă să exersezi!"
      : "Mai exersează — poți reîncerca!";

  useEffect(() => {
    if (percentage <= 50 || !saved || confettiFiredRef.current) return;
    confettiFiredRef.current = true;
    void fireQuizConfetti();
  }, [percentage, saved]);

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl mb-6">
        <div>
          <p className="text-3xl font-bold">{percentage}%</p>
          <p className="text-xs opacity-90">
            {score}/{totalQuestions}
          </p>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Quiz finalizat!
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
        {gradeMessage}
      </p>

      <p className="text-gray-500 dark:text-gray-400 mb-6">{quizTitle}</p>

      <div className="flex justify-center gap-2 mb-6 flex-wrap">
        <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 capitalize">
          {category}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-sm ${LEVEL_STYLES[level]}`}
        >
          {LEVEL_LABELS[level]}
        </span>
      </div>

      {xpOutcome && saved && !saving && !saveError ? (
        <div className="mx-auto max-w-sm mb-6 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 px-5 py-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400 mb-3">
            Recompense XP
          </p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600 dark:text-gray-300">Scor</dt>
              <dd className="font-semibold text-gray-900 dark:text-gray-100">
                {score}/{totalQuestions}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600 dark:text-gray-300">XP câștigat</dt>
              <dd className="font-bold text-purple-600 dark:text-purple-400">
                +{xpOutcome.xpGained.toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600 dark:text-gray-300">Categorie</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">
                {LEVEL_LABELS[xpOutcome.level]}
              </dd>
            </div>
            <div className="flex justify-between gap-4 pt-2 border-t border-purple-200 dark:border-purple-800">
              <dt className="text-gray-600 dark:text-gray-300">
                Total XP ({LEVEL_LABELS[xpOutcome.level]})
              </dt>
              <dd className="font-bold text-gray-900 dark:text-gray-100">
                {xpOutcome.categoryXpTotal.toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      {xpOutcome && saved && !saving && !saveError && xpOutcome.newBadges.length > 0 ? (
        <div className="mx-auto max-w-sm mb-6 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-5 py-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-3">
            Insigne noi
          </p>
          <ul className="space-y-2 text-sm">
            {xpOutcome.newBadges.map((badgeId) => {
              const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
              if (!badge) return null;
              return (
                <li key={badgeId} className="flex items-center gap-2">
                  <span aria-hidden>{badge.icon}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {badge.name}
                  </span>
                </li>
              );
            })}
          </ul>
          <Link
            href="/badges"
            className="mt-3 inline-block text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline"
          >
            Vezi toate insignele
          </Link>
        </div>
      ) : null}

      {saving && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Se salvează rezultatul...
        </p>
      )}
      {saved && !saving && !saveError && !xpOutcome ? (
        <p className="text-sm text-green-600 dark:text-green-400 mb-4">
          Rezultat salvat cu succes.
        </p>
      ) : null}
      {saveError && (
        <p
          role="alert"
          className="text-sm text-red-600 dark:text-red-400 mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2"
        >
          {saveError}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {wrongCount > 0 && onReview && (
          <Button size="lg" onClick={onReview}>
            Revizuiește greșelile ({wrongCount})
          </Button>
        )}
        <Link href="/quizzes">
          <Button
            size="lg"
            variant={wrongCount > 0 && onReview ? "secondary" : undefined}
          >
            Alte quiz-uri
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button size="lg" variant="secondary">
            Panou principal
          </Button>
        </Link>
      </div>
    </div>
  );
}
