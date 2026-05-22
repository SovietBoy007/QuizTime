"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { DailyQuizAlreadyCompletedError } from "@/lib/daily-quiz";
import { completeDailyQuizClient } from "@/lib/daily-quiz-complete-client";
import {
  getFirebaseErrorMessage,
  logFirebaseError,
} from "@/lib/firebase-error-message";
import { LEVEL_SHORT_LABELS, LEVEL_STYLES } from "@/lib/quiz-levels";
import type {
  Quiz,
  QuestionResponse,
  SchoolLevel,
} from "@/types/quiz";
import QuizProgress from "./QuizProgress";
import QuestionCard from "./QuestionCard";
import QuizReview from "./QuizReview";

type Phase = "question" | "feedback" | "complete" | "review";

type DailyOutcome = {
  streakDays: number;
  baseXp: number;
  streakBonusXp: number;
  scoreXp: number;
  totalXp: number;
  score: number;
  totalQuestions: number;
};

type DailyQuizPlayerProps = {
  quiz: Quiz;
  level: SchoolLevel;
  quizId: string;
};

export default function DailyQuizPlayer({
  quiz,
  level,
  quizId,
}: DailyQuizPlayerProps) {
  const router = useRouter();
  const { user } = useAuth();

  const saveStartedRef = useRef(false);
  const saveGenerationRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("question");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [outcome, setOutcome] = useState<DailyOutcome | null>(null);

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const score = responses.filter((r) => r.isCorrect).length;
  const wrongCount = responses.filter((r) => !r.isCorrect).length;
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const persistDaily = useCallback(async () => {
    if (!user) return;

    const generation = ++saveGenerationRef.current;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    setAlreadyCompleted(false);

    try {
      const result = await completeDailyQuizClient({
        userId: user.uid,
        score: responses.filter((r) => r.isCorrect).length,
        totalQuestions,
        topic: quiz.category,
        level,
        quizId,
      });

      if (saveGenerationRef.current !== generation) return;

      setOutcome(result);
      setSaved(true);
    } catch (error) {
      if (saveGenerationRef.current !== generation) return;

      logFirebaseError("DailyQuizPlayer.save", error);

      if (error instanceof DailyQuizAlreadyCompletedError) {
        setAlreadyCompleted(true);
        setSaveError(error.message);
        return;
      }

      saveStartedRef.current = false;
      setSaveError(getFirebaseErrorMessage(error));
    } finally {
      if (saveGenerationRef.current === generation) {
        setSaving(false);
      }
    }
  }, [user, responses, totalQuestions, quiz.category, level, quizId]);

  useEffect(() => {
    if (phase !== "complete") return;
    if (!user) return;
    if (responses.length !== totalQuestions) return;
    if (saveStartedRef.current) return;

    saveStartedRef.current = true;
    void persistDaily();
  }, [phase, user, responses, totalQuestions, persistDaily]);

  function handleRetrySave() {
    setSaveError(null);
    setSaved(false);
    setOutcome(null);
    void persistDaily();
  }

  function handleSelectAnswer(answerId: string) {
    if (phase !== "question" || !currentQuestion) return;

    setSelectedAnswerId(answerId);
    setPhase("feedback");

    const isCorrect = answerId === currentQuestion.correctAnswerId;
    setResponses((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedAnswerId: answerId,
        correctAnswerId: currentQuestion.correctAnswerId,
        isCorrect,
      },
    ]);
  }

  function handleNext() {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswerId(null);
      setPhase("question");
      return;
    }

    setPhase("complete");
  }

  if (phase === "review") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-10">
        <QuizReview
          quiz={quiz}
          responses={responses}
          onExit={() => setPhase("complete")}
        />
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 sm:p-12 text-center">
        <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-xl mb-6">
          <div>
            <p className="text-3xl font-bold">{percentage}%</p>
            <p className="text-xs opacity-90">
              {score}/{totalQuestions}
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Quizul zilei finalizat!
        </h2>

        {alreadyCompleted ? (
          <p
            role="alert"
            className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 mb-4"
          >
            Ai completat deja quiz-ul zilnic
          </p>
        ) : null}

        {saving && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Se salvează rezultatul...
          </p>
        )}

        {saved && !saving && !saveError && (
          <p className="text-sm text-green-600 dark:text-green-400 mb-4 font-medium">
            Rezultat salvat cu succes!
          </p>
        )}

        {saveError && !alreadyCompleted ? (
          <div className="mb-4 space-y-3">
            <p
              role="alert"
              className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3"
            >
              {saveError}
            </p>
            <Button size="sm" variant="secondary" onClick={handleRetrySave}>
              Încearcă din nou
            </Button>
          </div>
        ) : null}

        {outcome && saved && !saving && !saveError ? (
          <div className="mx-auto max-w-sm mb-6 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40 px-5 py-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400 mb-3">
              Recompense zilnice
            </p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600 dark:text-gray-300">Streak</dt>
                <dd className="font-bold text-orange-600 dark:text-orange-400">
                  {outcome.streakDays}{" "}
                  {outcome.streakDays === 1 ? "zi" : "zile"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600 dark:text-gray-300">XP quiz zilnic</dt>
                <dd className="font-semibold">+{outcome.baseXp}</dd>
              </div>
              {outcome.streakBonusXp > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-600 dark:text-gray-300">Bonus streak</dt>
                  <dd className="font-semibold text-amber-600 dark:text-amber-400">
                    +{outcome.streakBonusXp}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600 dark:text-gray-300">XP scor</dt>
                <dd className="font-semibold">+{outcome.scoreXp}</dd>
              </div>
              <div className="flex justify-between gap-4 pt-2 border-t border-orange-200 dark:border-orange-800">
                <dt className="text-gray-600 dark:text-gray-300">Total XP</dt>
                <dd className="font-bold text-orange-600 dark:text-orange-400">
                  +{outcome.totalXp}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {wrongCount > 0 && !alreadyCompleted && saved && (
            <Button size="lg" onClick={() => setPhase("review")}>
              Revizuiește greșelile ({wrongCount})
            </Button>
          )}
          <Link href="/dashboard">
            <Button size="lg" variant="secondary">
              Panou principal
            </Button>
          </Link>
        </div>

        {!user && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:underline font-medium"
            >
              Autentifică-te
            </button>{" "}
            pentru quiz-ul zilnic.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <span className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">
          Daily · Quizul zilei
        </span>
        <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 capitalize">
          {quiz.category}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-sm ${LEVEL_STYLES[level]}`}
        >
          {LEVEL_SHORT_LABELS[level]}
        </span>
      </div>

      <QuizProgress current={currentIndex + 1} total={totalQuestions} />

      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          selectedAnswerId={selectedAnswerId}
          showFeedback={phase === "feedback"}
          onSelectAnswer={handleSelectAnswer}
        />
      )}

      {phase === "feedback" && (
        <div className="flex justify-end">
          <Button size="lg" onClick={handleNext}>
            {currentIndex < totalQuestions - 1
              ? "Următoarea întrebare"
              : "Vezi rezultatele"}
          </Button>
        </div>
      )}
    </div>
  );
}
