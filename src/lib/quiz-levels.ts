import type { Quiz, QuizQuestion, SchoolLevel } from "@/types/quiz";

export const SCHOOL_LEVELS: SchoolLevel[] = ["primar", "gimnazial", "liceu"];

export const LEVEL_LABELS: Record<SchoolLevel, string> = {
  primar: "Nivel primar",
  gimnazial: "Nivel gimnazial",
  liceu: "Nivel liceu",
};

export const LEVEL_SHORT_LABELS: Record<SchoolLevel, string> = {
  primar: "Primar",
  gimnazial: "Gimnazial",
  liceu: "Liceu",
};

export const LEVEL_STYLES: Record<SchoolLevel, string> = {
  primar:
    "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  gimnazial:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  liceu: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

export function filterQuestionsByLevel(
  questions: QuizQuestion[],
  level: SchoolLevel
): QuizQuestion[] {
  return questions.filter((q) => q.level === level);
}

export function getQuestionCountsByLevel(
  questions: QuizQuestion[]
): Record<SchoolLevel, number> {
  return {
    primar: questions.filter((q) => q.level === "primar").length,
    gimnazial: questions.filter((q) => q.level === "gimnazial").length,
    liceu: questions.filter((q) => q.level === "liceu").length,
  };
}

export function getAvailableLevels(quiz: Quiz): SchoolLevel[] {
  const counts = getQuestionCountsByLevel(quiz.questions);
  return SCHOOL_LEVELS.filter((level) => counts[level] > 0);
}

export function quizHasLevel(quiz: Quiz, level: SchoolLevel): boolean {
  return quiz.questions.some((q) => q.level === level);
}

/** Full level pool (all questions). Prefer `buildQuizSession` for play. */
export function buildQuizForLevel(quiz: Quiz, level: SchoolLevel): Quiz {
  return {
    ...quiz,
    questions: filterQuestionsByLevel(quiz.questions, level),
  };
}
