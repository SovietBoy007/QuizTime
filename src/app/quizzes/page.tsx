"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fetchQuizzes } from "@/lib/quiz-firestore";
import {
  LEVEL_LABELS,
  LEVEL_STYLES,
  getQuestionCountsByLevel,
} from "@/lib/quiz-levels";
import type { Quiz, SchoolLevel, TimerDuration } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { SCHOOL_QUIZ_IDS, GENERAL_QUIZ_IDS } from "@/data/quizzes";
import { TIMED_XP_MULTIPLIERS, TIMER_DURATION_LABELS } from "@/lib/gamification";

const TIMER_OPTIONS: { value: TimerDuration; label: string; multiplier: number }[] = [
  { value: 300, label: "5 minute", multiplier: TIMED_XP_MULTIPLIERS[300] },
  { value: 120, label: "2 minute", multiplier: TIMED_XP_MULTIPLIERS[120] },
  { value: 60, label: "1 minut", multiplier: TIMED_XP_MULTIPLIERS[60] },
  { value: 30, label: "30 secunde", multiplier: TIMED_XP_MULTIPLIERS[30] },
];

const CATEGORY_LABELS: Record<string, string> = {
  geografie: "Geografie",
  stiinte: "Științe naturale",
  istorie: "Istorie și cultură",
  matematica: "Matematică",
  informatica: "Informatică",
  "limba-romana": "Limba română",
  "cultura-generala": "Cultură generală",
  "tari-si-steaguri": "Țări și steaguri",
  animale: "Animale",
  "true-false": "Adevărat sau Fals",
  "mixed-challenge": "Mixed Challenge",
  "pop-culture": "Pop Culture",
  general: "General",
};

const CATEGORY_ICONS: Record<string, string> = {
  geografie: "🌍",
  stiinte: "🔬",
  istorie: "🏛️",
  matematica: "📐",
  informatica: "💻",
  "limba-romana": "📖",
  "cultura-generala": "🧠",
  "tari-si-steaguri": "🏳️",
  animale: "🦁",
  "true-false": "✅",
  "mixed-challenge": "🎯",
  "pop-culture": "🎬",
  general: "📋",
};

const CARD_ACCENT: Record<string, string> = {
  geografie: "from-blue-500 to-cyan-400",
  stiinte: "from-green-500 to-emerald-400",
  istorie: "from-amber-600 to-yellow-400",
  matematica: "from-violet-600 to-purple-400",
  informatica: "from-sky-600 to-blue-400",
  "limba-romana": "from-rose-500 to-pink-400",
  "cultura-generala": "from-indigo-600 to-blue-400",
  "tari-si-steaguri": "from-teal-500 to-cyan-400",
  animale: "from-orange-500 to-amber-400",
  "true-false": "from-lime-500 to-green-400",
  "mixed-challenge": "from-fuchsia-600 to-pink-400",
  "pop-culture": "from-red-500 to-orange-400",
  general: "from-gray-500 to-slate-400",
};

type FilterGroup = "all" | "school" | "general";

const SCHOOL_OPTIONS = [
  { value: "geografie", label: "Geografie" },
  { value: "stiinte", label: "Științe naturale" },
  { value: "istorie", label: "Istorie și cultură" },
  { value: "matematica", label: "Matematică" },
  { value: "informatica", label: "Informatică" },
  { value: "limba-romana", label: "Limba română" },
];

const GENERAL_OPTIONS = [
  { value: "cultura-generala", label: "Cultură generală" },
  { value: "tari-si-steaguri", label: "Țări și steaguri" },
  { value: "animale", label: "Animale" },
  { value: "true-false", label: "Adevărat sau Fals" },
  { value: "mixed-challenge", label: "Mixed Challenge" },
  { value: "pop-culture", label: "Pop Culture" },
];

export default function QuizzesPage() {
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState<FilterGroup>("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel | "">("");
  const [timedMode, setTimedMode] = useState(false);
  const [timerDuration, setTimerDuration] = useState<TimerDuration>(300);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchQuizzes();
        setAllQuizzes(data);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
        setAllQuizzes([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const quizzes = useMemo(() => {
    let filtered = allQuizzes;

    if (filterGroup === "school") {
      filtered = filtered.filter((q) => SCHOOL_QUIZ_IDS.includes(q.id));
    } else if (filterGroup === "general") {
      filtered = filtered.filter((q) => GENERAL_QUIZ_IDS.includes(q.id));
    }

    if (selectedCategory) {
      filtered = filtered.filter((q) => q.category === selectedCategory);
    }

    if (selectedLevel) {
      filtered = filtered.filter((q) =>
        q.questions.some((qu) => qu.level === selectedLevel)
      );
    }

    return filtered;
  }, [allQuizzes, filterGroup, selectedCategory, selectedLevel]);

  const categoryOptions =
    filterGroup === "school"
      ? SCHOOL_OPTIONS
      : filterGroup === "general"
        ? GENERAL_OPTIONS
        : [...SCHOOL_OPTIONS, ...GENERAL_OPTIONS];

  function handleGroupChange(group: FilterGroup) {
    setFilterGroup(group);
    setSelectedCategory("");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-gray-100">
          Quiz-uri disponibile
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Alege categoria și nivelul. La fiecare sesiune primești un set aleator
          de întrebări (5–8 primar · 8–12 gimnazial · 10–15 liceu).
        </p>

        {/* Group filter tabs */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {(
            [
              { value: "all", label: "Toate" },
              { value: "school", label: "🏫 Materii școlare" },
              { value: "general", label: "🌐 Categorii generale" },
            ] as { value: FilterGroup; label: string }[]
          ).map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleGroupChange(tab.value)}
              className={`px-5 py-2 rounded-full font-medium transition text-sm ${
                filterGroup === tab.value
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Unified filter bar: category · level · mode toggle · reset */}
        <div className="flex gap-3 mb-3 flex-wrap items-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Toate categoriile</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) =>
              setSelectedLevel(e.target.value as SchoolLevel | "")
            }
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Toate nivelurile</option>
            <option value="primar">{LEVEL_LABELS.primar}</option>
            <option value="gimnazial">{LEVEL_LABELS.gimnazial}</option>
            <option value="liceu">{LEVEL_LABELS.liceu}</option>
          </select>

          {/* Mode toggle — visually consistent with the select controls */}
          <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 text-sm font-medium">
            <button
              onClick={() => setTimedMode(false)}
              className={`px-4 py-2 transition ${
                !timedMode
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              ▶ Normal
            </button>
            <button
              onClick={() => setTimedMode(true)}
              className={`px-4 py-2 transition border-l border-gray-300 dark:border-gray-600 ${
                timedMode
                  ? "bg-orange-500 text-white border-l-orange-500"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              ⏱ Cronometrat
            </button>
          </div>

          {(selectedCategory || selectedLevel || filterGroup !== "all") && (
            <button
              onClick={() => {
                setSelectedCategory("");
                setSelectedLevel("");
                setFilterGroup("all");
              }}
              className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700 rounded-lg transition"
            >
              ✕ Resetează
            </button>
          )}
        </div>

        {/* Duration selector — only shown when timed mode is active */}
        {timedMode && (
          <div className="flex gap-2 mb-6 flex-wrap items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Timp:</span>
            {TIMER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimerDuration(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
                  timerDuration === opt.value
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-orange-400"
                }`}
              >
                {opt.label}
                <span
                  className={`ml-1.5 text-xs font-bold ${
                    timerDuration === opt.value ? "text-orange-100" : "text-orange-500 dark:text-orange-400"
                  }`}
                >
                  ×{opt.multiplier}
                </span>
              </button>
            ))}
          </div>
        )}

        {!timedMode && <div className="mb-5" />}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">
              Se încarcă quiz-urile...
            </p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Nu am găsit quiz-uri pentru filtrele selectate.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {quizzes.length} quiz{quizzes.length !== 1 ? "-uri" : ""} găsit
              {quizzes.length !== 1 ? "e" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => {
                const counts = getQuestionCountsByLevel(quiz.questions);
                const categoryLabel =
                  CATEGORY_LABELS[quiz.category] ?? quiz.category;
                const icon = CATEGORY_ICONS[quiz.category] ?? "📋";
                const accent =
                  CARD_ACCENT[quiz.category] ??
                  "from-blue-500 to-purple-500";
                const isSchool = SCHOOL_QUIZ_IDS.includes(quiz.id);

                return (
                  <article
                    key={quiz.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden flex flex-col"
                  >
                    <div
                      className={`h-2 bg-gradient-to-r ${accent}`}
                    />
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-3xl leading-none">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                            {quiz.title}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                            {isSchool ? "Materie școlară" : "Categorie generală"}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm flex-1">
                        {quiz.description}
                      </p>

                      <div className="flex gap-2 mb-3 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${accent} text-white`}
                        >
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
                                {counts[level]} ·{" "}
                                {LEVEL_LABELS[level].replace("Nivel ", "")}
                              </span>
                            ) : null
                        )}
                      </div>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Bancă: {quiz.questions.length} întrebări · sesiune
                        aleatorie per nivel
                      </p>

                      <Link
                        href={
                          timedMode
                            ? `/quizzes/${quiz.id}?mode=timed&duration=${timerDuration}`
                            : `/quizzes/${quiz.id}`
                        }
                        className="mt-auto"
                      >
                        <Button
                          size="lg"
                          className={`w-full ${timedMode ? "!bg-orange-500 hover:!bg-orange-600" : ""}`}
                        >
                          {timedMode ? `⏱ Începe (${TIMER_DURATION_LABELS[timerDuration]})` : "Alege nivelul și începe"}
                        </Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
