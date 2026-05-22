"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchQuizById } from "@/lib/quiz-firestore";
import { buildQuizSession } from "@/lib/quiz-session";
import type { Quiz, SchoolLevel, TimerDuration } from "@/types/quiz";
import QuizPlayer from "@/components/quiz/QuizPlayer";
import LevelSelector from "@/components/quiz/LevelSelector";
import { Button } from "@/components/ui/button";

export default function QuizPlayPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = params?.id as string;

  const timedMode = searchParams.get("mode") === "timed";
  const rawDuration = Number(searchParams.get("duration"));
  const timerDuration: TimerDuration =
    rawDuration === 300 || rawDuration === 120 || rawDuration === 60 || rawDuration === 30
      ? rawDuration
      : 300;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!quizId) return;

    async function loadQuiz() {
      setLoading(true);
      setError("");
      setSelectedLevel(null);
      try {
        const data = await fetchQuizById(quizId);
        if (!data) {
          setError("Quiz-ul nu a fost găsit.");
          setQuiz(null);
        } else {
          setQuiz(data);
        }
      } catch {
        setError("Nu am putut încărca quiz-ul. Încearcă din nou.");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [quizId]);

  const activeQuiz = useMemo(
    () =>
      quiz && selectedLevel !== null
        ? buildQuizSession(quiz, selectedLevel)
        : null,
    [quiz, selectedLevel]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3 mx-auto" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl mt-8" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-6">
            Se încarcă quiz-ul...
          </p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
            {error || "Quiz-ul nu a fost găsit."}
          </p>
          <Button onClick={() => router.push("/quizzes")}>
            Înapoi la quiz-uri
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-950 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link
            href="/quizzes"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Înapoi la quiz-uri
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {quiz.title}
          </h1>
          {quiz.description && (
            <p className="text-gray-600 dark:text-gray-300">
              {quiz.description}
            </p>
          )}
        </div>

        {!selectedLevel ? (
          <LevelSelector quiz={quiz} onSelect={setSelectedLevel} timedMode={timedMode} timerDuration={timerDuration} />
        ) : activeQuiz && activeQuiz.questions.length > 0 ? (
          <QuizPlayer
            quiz={activeQuiz}
            level={selectedLevel}
            timedMode={timedMode}
            timerDuration={timedMode ? timerDuration : undefined}
          />
        ) : (
          <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Nu există întrebări pentru nivelul selectat.
            </p>
            <Button onClick={() => setSelectedLevel(null)}>
              Alege alt nivel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
