import type { Quiz, QuizQuestion, SchoolLevel } from "@/types/quiz";

/** Compact row: id, level, question, answers [[id,text]×4], correctId, explanation */
export type QuestionRow = [
  string,
  SchoolLevel,
  string,
  [string, string][],
  string,
  string,
];

export function parseQuestions(topic: string, rows: QuestionRow[]): QuizQuestion[] {
  return rows.map(([id, level, question, answers, correctAnswerId, explanation]) => ({
    id,
    level,
    topic,
    question,
    answers: answers.map(([aid, text]) => ({ id: aid, text })),
    correctAnswerId,
    explanation,
  }));
}

export function buildQuiz(
  id: string,
  title: string,
  description: string,
  rows: QuestionRow[]
): Quiz {
  return {
    id,
    title,
    description,
    category: id,
    questions: parseQuestions(id, rows),
  };
}
