"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchQuizzes } from "@/lib/quiz-firestore";
import {
  LEVEL_LABELS,
  LEVEL_STYLES,
  getQuestionCountsByLevel,
} from "@/lib/quiz-levels";
import type { Quiz, SchoolLevel } from "@/types/quiz";
import { Button } from "@/components/ui/button";

const CATEGORY_LABELS: Record<string, string> = {
  geografie: "Geografie",
  stiinte: "Științe naturale",
  istorie: "Istorie și cultură",
  matematica: "Matematică",
  informatica: "Informatică",
  "limba-romana": "Limba română",
  general: "General",
};

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel | "">("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchQuizzes(
          selectedCategory || undefined,
          selectedLevel || undefined
        );
        setQuizzes(data);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCategory, selectedLevel]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-gray-100">
          Quiz-uri disponibile
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Alege un subiect și nivelul școlar. La fiecare sesiune primești un
          set aleator de întrebări din banca subiectului (5–8 primar, 8–12
          gimnazial, 10–15 liceu).
        </p>

        <div className="flex gap-4 mb-8 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toate subiectele</option>
            <option value="geografie">Geografie</option>
            <option value="stiinte">Științe naturale</option>
            <option value="istorie">Istorie și cultură</option>
            <option value="matematica">Matematică</option>
            <option value="informatica">Informatică</option>
            <option value="limba-romana">Limba română</option>
          </select>

          <select
            value={selectedLevel}
            onChange={(e) =>
              setSelectedLevel(e.target.value as SchoolLevel | "")
            }
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toate nivelurile</option>
            <option value="primar">{LEVEL_LABELS.primar}</option>
            <option value="gimnazial">{LEVEL_LABELS.gimnazial}</option>
            <option value="liceu">{LEVEL_LABELS.liceu}</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">
              Se încarcă quiz-urile...
            </p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Nu am găsit quiz-uri.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const counts = getQuestionCountsByLevel(quiz.questions);
              const categoryLabel =
                CATEGORY_LABELS[quiz.category] ?? quiz.category;

              return (
                <article
                  key={quiz.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden flex flex-col"
                >
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">
                      {quiz.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm flex-1">
                      {quiz.description}
                    </p>

                    <div className="flex gap-2 mb-3 flex-wrap">
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                        {categoryLabel}
                      </span>
                    </div>

                    <div className="flex gap-2 mb-4 flex-wrap">
                      {(["primar", "gimnazial", "liceu"] as SchoolLevel[]).map(
                        (level) =>
                          counts[level] > 0 ? (
                            <span
                              key={level}
                              className={`px-2 py-0.5 rounded-full text-xs ${LEVEL_STYLES[level]}`}
                            >
                              {counts[level]} · {LEVEL_LABELS[level].replace("Nivel ", "")}
                            </span>
                          ) : null
                      )}
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Bancă: {quiz.questions.length} întrebări · sesiune
                      aleatorie per nivel
                    </p>

                    <Link href={`/quizzes/${quiz.id}`} className="mt-auto">
                      <Button size="lg" className="w-full">
                        Alege nivelul și începe
                      </Button>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
