import { randomizeQuestionAnswers } from "@/lib/quiz-answer-shuffle";
import { filterQuestionsByLevel } from "@/lib/quiz-levels";
import type { Quiz, QuizQuestion, SchoolLevel } from "@/types/quiz";

/** Target number of questions drawn per session (random within range). */
export const SESSION_QUESTION_RANGES: Record<
  SchoolLevel,
  { min: number; max: number }
> = {
  primar: { min: 5, max: 8 },
  gimnazial: { min: 8, max: 12 },
  liceu: { min: 10, max: 15 },
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Fisher–Yates shuffle (mutates a copy). */
function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Picks a random session size for the level, then samples that many unique
 * questions from the level pool (no repeats within the session).
 */
export function pickSessionQuestions(
  pool: QuizQuestion[],
  level: SchoolLevel
): QuizQuestion[] {
  const levelPool = filterQuestionsByLevel(pool, level);
  if (levelPool.length === 0) return [];

  const { min, max } = SESSION_QUESTION_RANGES[level];
  const desired = randomInt(min, max);
  const count = Math.min(desired, levelPool.length);

  return shuffle(levelPool)
    .slice(0, count)
    .map((question) => randomizeQuestionAnswers(question));
}

/** Builds a quiz document for one play session (subset of the topic pool). */
export function buildQuizSession(quiz: Quiz, level: SchoolLevel): Quiz {
  return {
    ...quiz,
    questions: pickSessionQuestions(quiz.questions, level),
  };
}

export function getSessionRangeLabel(level: SchoolLevel): string {
  const { min, max } = SESSION_QUESTION_RANGES[level];
  return `${min}–${max}`;
}
