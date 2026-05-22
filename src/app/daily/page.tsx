"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import {
  EMPTY_QUIZZES_MESSAGE,
  isDailyQuizCompletedToday,
  readDailyQuizFields,
} from "@/lib/daily-quiz";
import { resolveDailyQuizAssignmentClient } from "@/lib/daily-quiz-client";
import { fetchQuizById } from "@/lib/quiz-firestore";
import { buildQuizSession } from "@/lib/quiz-session";
import DailyQuizPlayer from "@/components/quiz/DailyQuizPlayer";
import LevelSelector from "@/components/quiz/LevelSelector";
import { Button } from "@/components/ui/button";
import type { Quiz, SchoolLevel } from "@/types/quiz";

export default function DailyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [quizId, setQuizId] = useState<string | null>(null);
  const [completedToday, setCompletedToday] = useState(false);
  const [firestoreEmpty, setFirestoreEmpty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    const userId = user.uid;
    let cancelled = false;

    async function loadDaily() {
      setLoading(true);
      setError("");
      setFirestoreEmpty(false);

      try {
        const userSnap = await getDoc(doc(db, "users", userId));
        const fields = readDailyQuizFields(userSnap.data());
        const done = isDailyQuizCompletedToday(fields.lastQuizDate);

        if (!cancelled) {
          setCompletedToday(done);
        }

        if (done) {
          if (!cancelled) setLoading(false);
          return;
        }

        const assignment = await resolveDailyQuizAssignmentClient(userId);

        if (cancelled) return;

        setFirestoreEmpty(assignment.firestoreEmpty);

        if (!assignment.quizId) {
          setError(EMPTY_QUIZZES_MESSAGE);
          setQuiz(null);
          setLoading(false);
          return;
        }

        setQuizId(assignment.quizId);

        const data = await fetchQuizById(assignment.quizId);
        if (cancelled) return;

        if (!data) {
          setError("Quiz-ul zilei nu a putut fi încărcat.");
          setQuiz(null);
        } else {
          setQuiz(data);
        }
      } catch {
        if (!cancelled) {
          setError("Nu am putut încărca quiz-ul Daily.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDaily();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const activeQuiz = useMemo(
    () =>
      quiz && selectedLevel !== null
        ? buildQuizSession(quiz, selectedLevel)
        : null,
    [quiz, selectedLevel]
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Se încarcă...</p>
      </div>
    );
  }

  if (!user) return null;

  if (completedToday) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <p className="text-4xl mb-4">✓</p>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400 mb-2">
              Quizul zilei
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Daily Quiz
            </h1>
            <p className="text-lg text-green-700 dark:text-green-400 font-medium mb-2">
              Completat azi
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Ai completat deja quiz-ul Daily. Revino mâine pentru un quiz nou!
            </p>
            <Link href="/dashboard">
              <Button>Înapoi la dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quizId || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            {error || "Nu am putut încărca quiz-ul Daily."}
          </p>
          {firestoreEmpty ? (
            <p className="text-sm text-amber-700 dark:text-amber-400 mb-6">
              {EMPTY_QUIZZES_MESSAGE} Rulează{" "}
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                npm run seed:quizzes
              </code>{" "}
              pentru a popula colecția <code className="text-xs">quizzes</code>.
            </p>
          ) : null}
          <Link href="/dashboard">
            <Button>Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-amber-50/30 dark:from-gray-900 dark:to-gray-950 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-orange-600 dark:text-orange-400 hover:underline mb-4 inline-block"
          >
            ← Dashboard
          </Link>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400 mb-1">
            Quizul zilei
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Daily Quiz
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Un quiz random pe zi — același quiz toată ziua pentru tine.
          </p>
          <p className="mt-2 text-sm font-medium text-orange-700 dark:text-orange-400">
            Disponibil azi
          </p>
          {firestoreEmpty ? (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              Quiz-uri locale (Firestore gol). Rulează seed pentru date în cloud.
            </p>
          ) : null}
        </div>

        <div className="mb-6 rounded-xl border border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-gray-800/80 px-4 py-3">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {quiz.title}
          </p>
          {quiz.description ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {quiz.description}
            </p>
          ) : null}
        </div>

        {!selectedLevel ? (
          <LevelSelector quiz={quiz} onSelect={setSelectedLevel} />
        ) : activeQuiz && activeQuiz.questions.length > 0 ? (
          <DailyQuizPlayer
            quiz={activeQuiz}
            level={selectedLevel}
            quizId={quizId}
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
