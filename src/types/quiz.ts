export type SchoolLevel = "primar" | "gimnazial" | "liceu";

export type QuizMode = "normal" | "timed";

/** Timed-mode durations in seconds: 300s=5min, 120s=2min, 60s=1min, 30s=30sec */
export type TimerDuration = 300 | 120 | 60 | 30;

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
  xpMultiplier?: number;
  timedMode?: boolean;
  timerDuration?: TimerDuration;
};

import type { BadgeId } from "@/types/badges";

export type QuizSaveOutcome = {
  docId: string;
  xpGained: number;
  categoryXpTotal: number;
  level: SchoolLevel;
  newBadges: BadgeId[];
  xpMultiplier?: number;
  timedMode?: boolean;
};

export type QuizResultDocument = QuizResultPayload & {
  createdAt: unknown;
};

export type QuizResult = QuizResultPayload & {
  id: string;
  createdAt: Date | null;
};
