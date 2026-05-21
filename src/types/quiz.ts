export type SchoolLevel = "primar" | "gimnazial" | "liceu";

export type QuizAnswer = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  level: SchoolLevel;
  topic: string;
  question: string;
  answers: QuizAnswer[];
  correctAnswerId: string;
  explanation: string;
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: QuizQuestion[];
};

export type QuestionResponse = {
  questionId: string;
  selectedAnswerId: string;
  correctAnswerId: string;
  isCorrect: boolean;
};

export type QuizResultPayload = {
  userId: string;
  score: number;
  totalQuestions: number;
  topic: string;
  level: SchoolLevel;
};

import type { BadgeId } from "@/types/badges";

export type QuizSaveOutcome = {
  docId: string;
  xpGained: number;
  categoryXpTotal: number;
  level: SchoolLevel;
  newBadges: BadgeId[];
};

export type QuizResultDocument = QuizResultPayload & {
  createdAt: unknown;
};

export type QuizResult = QuizResultPayload & {
  id: string;
  createdAt: Date | null;
};
