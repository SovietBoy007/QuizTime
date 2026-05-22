"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { saveQuizResult } from "@/lib/quiz-firestore";
import { LEVEL_SHORT_LABELS, LEVEL_STYLES } from "@/lib/quiz-levels";
import { getTimedXpMultiplier, TIMER_DURATION_LABELS } from "@/lib/gamification";
import type {
  Quiz,
  QuestionResponse,
  QuizSaveOutcome,
  SchoolLevel,
  TimerDuration,
} from "@/types/quiz";
import QuizProgress from "./QuizProgress";
import QuestionCard from "./QuestionCard";
import QuizResults from "./QuizResults";
import QuizReview from "./QuizReview";

type QuizPlayerProps = {
  quiz: Quiz;
  level: SchoolLevel;
  timedMode?: boolean;
  timerDuration?: TimerDuration;
};

type Phase = "question" | "feedback" | "complete" | "review";

export default function QuizPlayer({ quiz, level, timedMode = false, timerDuration }: QuizPlayerProps) {
  const router = useRouter();
  const { user } = useAuth();

  const attemptIdRef = useRef(crypto.randomUUID());
  const saveStartedRef = useRef(false);
  const timerExpiredRef = useRef(false);

  const totalDuration = timedMode && timerDuration ? timerDuration : 0;

  const [phase, setPhase] = useState<Phase>("question");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resultSaved, setResultSaved] = useState(false);
  const [xpOutcome, setXpOutcome] = useState<QuizSaveOutcome | null>(null);
  const [timeLeft, setTimeLeft] = useState(totalDuration);
  const [timerExpired, setTimerExpired] = useState(false);

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;

  const score = responses.filter((r) => r.isCorrect).length;
  const wrongCount = responses.filter((r) => !r.isCorrect).length;
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  // Force-complete all remaining unanswered questions when timer expires
  const handleTimerExpiry = useCallback(() => {
    if (timerExpiredRef.current) return;
    timerExpiredRef.current = true;
    setTimerExpired(true);

    setResponses((prev) => {
      const answeredIds = new Set(prev.map((r) => r.questionId));
      const remaining: QuestionResponse[] = quiz.questions
        .filter((q) => !answeredIds.has(q.id))
        .map((q) => ({
          questionId: q.id,
          selectedAnswerId: "",
          correctAnswerId: q.correctAnswerId,
          isCorrect: false,
        }));
      return [...prev, ...remaining];
    });

    setPhase("complete");
  }, [quiz.questions]);

  // Countdown timer — single interval, cleared when quiz ends
  useEffect(() => {
    if (!timedMode || !timerDuration || phase === "complete" || phase === "review") return;

    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedMode, timerDuration, phase]);

  // Trigger expiry when timeLeft hits 0
  useEffect(() => {
    if (timedMode && timerDuration && timeLeft === 0 && phase !== "complete" && phase !== "review") {
      handleTimerExpiry();
    }
  }, [timeLeft, timedMode, timerDuration, phase, handleTimerExpiry]);

  // Save result when quiz completes
  useEffect(() => {
    if (phase !== "complete") return;
    if (!user) return;
    if (responses.length !== totalQuestions) return;
    if (saveStartedRef.current) return;

    saveStartedRef.current = true;

    const userId = user.uid;
    const finalScore = responses.filter((r) => r.isCorrect).length;
    const topic = quiz.category;
    const attemptId = attemptIdRef.current;
    const multiplier =
      timedMode && timerDuration ? getTimedXpMultiplier(timerDuration) : 1;

    async function persistOnce() {
      setSaving(true);
      setSaveError(null);

      try {
        const outcome = await saveQuizResult(attemptId, {
          userId,
          score: finalScore,
          totalQuestions,
          topic,
          level,
          ...(timedMode && timerDuration
            ? { timedMode: true, timerDuration, xpMultiplier: multiplier }
            : {}),
        });
        setXpOutcome(outcome);
        setResultSaved(true);
      } catch {
        saveStartedRef.current = false;
        setSaveError("Nu am putut salva rezultatul. Încearcă din nou.");
      } finally {
        setSaving(false);
      }
    }

    persistOnce();
  }, [phase, user, responses, totalQuestions, quiz.category, level, timedMode, timerDuration]);

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
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 sm:p-12">
        <QuizResults
          quizTitle={quiz.title}
          category={quiz.category}
          level={level}
          score={score}
          totalQuestions={totalQuestions}
          percentage={percentage}
          saving={saving}
          saveError={saveError}
          saved={resultSaved}
          xpOutcome={user ? xpOutcome : null}
          wrongCount={wrongCount}
          timedMode={timedMode}
          timerExpired={timerExpired}
          timerDuration={timerDuration}
          onReview={
            wrongCount > 0 ? () => setPhase("review") : undefined
          }
        />
        {!user && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:underline font-medium"
            >
              Autentifică-te
            </button>{" "}
            pentru a salva scorurile viitoare.
          </p>
        )}
      </div>
    );
  }

  // Timer display helpers
  const timerPct = totalDuration > 0 ? timeLeft / totalDuration : 1;
  const timerColor =
    timerPct > 0.5
      ? "text-green-600 dark:text-green-400"
      : timerPct > 0.25
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";
  const timerBarColor =
    timerPct > 0.5
      ? "bg-green-500"
      : timerPct > 0.25
        ? "bg-yellow-500"
        : "bg-red-500";
  const timerUrgent = timerPct <= 0.25;
  const timerMins = Math.floor(timeLeft / 60);
  const timerSecs = timeLeft % 60;
  const timerLabel = `${timerMins}:${String(timerSecs).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      {/* Timer bar */}
      {timedMode && timerDuration && (
        <div
          className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md px-5 py-3 flex items-center gap-4 ${
            timerUrgent ? "ring-2 ring-red-400 dark:ring-red-500" : ""
          }`}
        >
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-lg ${timerUrgent ? "animate-pulse" : ""}`}>⏱</span>
            <span className={`text-2xl font-bold tabular-nums ${timerColor}`}>
              {timerLabel}
            </span>
          </div>
          <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${timerBarColor}`}
              style={{ width: `${timerPct * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 font-medium">
            ×{getTimedXpMultiplier(timerDuration)} XP
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-2">
        <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 capitalize">
          {quiz.category}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-sm ${LEVEL_STYLES[level]}`}
        >
          {LEVEL_SHORT_LABELS[level]}
        </span>
        {timedMode && timerDuration && (
          <span className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 font-medium">
            ⏱ {TIMER_DURATION_LABELS[timerDuration]}
          </span>
        )}
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
