"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { saveQuizResult } from "@/lib/quiz-firestore";
import { LEVEL_SHORT_LABELS, LEVEL_STYLES } from "@/lib/quiz-levels";
import type {
  Quiz,
  QuestionResponse,
  QuizSaveOutcome,
  SchoolLevel,
} from "@/types/quiz";
import QuizProgress from "./QuizProgress";
import QuestionCard from "./QuestionCard";
import QuizResults from "./QuizResults";
import QuizReview from "./QuizReview";

type QuizPlayerProps = {
  quiz: Quiz;
  level: SchoolLevel;
};

type Phase = "question" | "feedback" | "complete" | "review";

export default function QuizPlayer({ quiz, level }: QuizPlayerProps) {
  const router = useRouter();
  const { user } = useAuth();

  const attemptIdRef = useRef(crypto.randomUUID());
  const saveStartedRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("question");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resultSaved, setResultSaved] = useState(false);
  const [xpOutcome, setXpOutcome] = useState<QuizSaveOutcome | null>(null);

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const score = responses.filter((r) => r.isCorrect).length;
  const wrongCount = responses.filter((r) => !r.isCorrect).length;
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

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
  }, [phase, user, responses, totalQuestions, quiz.category, level]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 mb-2">
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
