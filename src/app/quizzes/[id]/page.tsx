"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AnswerOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  answers: AnswerOption[];
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  author: { username: string };
  questions: Question[];
}

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!quizId) return;

    async function fetchQuiz() {
      setLoading(true);
      try {
        const response = await fetch(`/api/quizzes/${quizId}`);
        if (!response.ok) {
          throw new Error("Quiz not found");
        }
        const data = await response.json();
        setQuiz(data);
      } catch (err) {
        setError("Nu am putut încărca quizul. Încearcă din nou mai târziu.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId]);

  function handleSelect(questionId: string, answerId: string) {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  }

  async function handleSubmit() {
    if (!quiz) return;
    setError("");
    setSubmitting(true);

    const missingAnswers = quiz.questions.filter(
      (question) => !selectedAnswers[question.id]
    );

    if (missingAnswers.length > 0) {
      setError("Te rog răspunde la toate întrebările înainte de a trimite.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, answers: selectedAnswers, timeSpent: 0 }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Eroare la trimitere");
      }

      setSuccessMessage("Quiz trimis cu succes! Vezi scorul în profil.");
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err) {
      setError("Eroare la trimitere. Te rog încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          Se încarcă quizul...
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          Quizul nu poate fi găsit.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{quiz.title}</h1>
            <p className="text-gray-600 mb-4">{quiz.description}</p>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {quiz.category}
              </span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                {quiz.difficulty}
              </span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                Autor: {quiz.author.username}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3">
              {successMessage}
            </div>
          )}

          <div className="space-y-8">
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="rounded-3xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Întrebarea {index + 1}</p>
                    <h2 className="text-xl font-semibold text-gray-900">{question.text}</h2>
                  </div>
                  <span className="text-sm text-gray-600">{question.type}</span>
                </div>

                <div className="grid gap-3">
                  {question.answers.map((answer) => (
                    <button
                      key={answer.id}
                      type="button"
                      onClick={() => handleSelect(question.id, answer.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        selectedAnswers[question.id] === answer.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      {answer.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? "Se trimite..." : "Trimite quizul"}
            </Button>
            <Button variant="secondary" onClick={() => router.push("/quizzes")}>Înapoi la Quizuri</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
