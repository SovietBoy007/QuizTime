import { toDateKey } from "@/lib/badges";
import type { Quiz } from "@/types/quiz";

export { toDateKey };

export class DailyQuizAlreadyCompletedError extends Error {
  constructor() {
    super("Ai completat deja quiz-ul zilnic");
    this.name = "DailyQuizAlreadyCompletedError";
  }
}

export const DAILY_QUIZ_BASE_XP = 50;

export const STREAK_MILESTONES = [3, 7, 14] as const;

export const STREAK_MILESTONE_BONUS_XP: Record<
  (typeof STREAK_MILESTONES)[number],
  number
> = {
  3: 30,
  7: 80,
  14: 200,
};

export type DailyQuizUserFields = {
  lastQuizDate?: string;
  streakDays: number;
  dailyQuizId?: string;
  dailyQuizDate?: string;
};

export function yesterdayKey(from: Date = new Date()): string {
  const copy = new Date(from);
  copy.setDate(copy.getDate() - 1);
  return toDateKey(copy);
}

export function readDailyQuizFields(
  data: Record<string, unknown> | undefined
): DailyQuizUserFields {
  return {
    lastQuizDate:
      typeof data?.lastQuizDate === "string" ? data.lastQuizDate : undefined,
    streakDays: typeof data?.streakDays === "number" ? data.streakDays : 0,
    dailyQuizId:
      typeof data?.dailyQuizId === "string" ? data.dailyQuizId : undefined,
    dailyQuizDate:
      typeof data?.dailyQuizDate === "string" ? data.dailyQuizDate : undefined,
  };
}

export function readDailyAssignment(
  data: Record<string, unknown> | undefined
): { dailyQuizId?: string; dailyQuizDate?: string } {
  const fields = readDailyQuizFields(data);
  return {
    dailyQuizId: fields.dailyQuizId,
    dailyQuizDate: fields.dailyQuizDate,
  };
}

export function hasAssignmentForToday(
  dailyQuizDate: string | undefined,
  today: Date = new Date()
): boolean {
  return dailyQuizDate === toDateKey(today);
}

export function isDailyQuizCompletedToday(
  lastQuizDate: string | undefined,
  today: Date = new Date()
): boolean {
  return lastQuizDate === toDateKey(today);
}

/** Streak shown in UI — 0 if the user missed a day without completing today. */
export function getDisplayStreakDays(
  lastQuizDate: string | undefined,
  streakDays: number,
  today: Date = new Date()
): number {
  const todayKey = toDateKey(today);
  if (lastQuizDate === todayKey) return streakDays;
  if (lastQuizDate === yesterdayKey(today)) return streakDays;
  return 0;
}

export function computeDailyStreakUpdate(
  lastQuizDate: string | undefined,
  currentStreakDays: number,
  today: Date = new Date()
): { streakDays: number; lastQuizDate: string; alreadyCompletedToday: boolean } {
  const todayKey = toDateKey(today);

  if (lastQuizDate === todayKey) {
    return {
      streakDays: currentStreakDays,
      lastQuizDate: todayKey,
      alreadyCompletedToday: true,
    };
  }

  const newStreak =
    lastQuizDate === yesterdayKey(today) ? currentStreakDays + 1 : 1;

  return {
    streakDays: newStreak,
    lastQuizDate: todayKey,
    alreadyCompletedToday: false,
  };
}

export function streakMilestoneBonus(streakDays: number): number {
  if (streakDays === 14) return STREAK_MILESTONE_BONUS_XP[14];
  if (streakDays === 7) return STREAK_MILESTONE_BONUS_XP[7];
  if (streakDays === 3) return STREAK_MILESTONE_BONUS_XP[3];
  return 0;
}

export function calculateDailyQuizXp(
  score: number,
  newStreakDays: number
): { baseXp: number; streakBonusXp: number; scoreXp: number; totalXp: number } {
  const baseXp = DAILY_QUIZ_BASE_XP;
  const streakBonusXp = streakMilestoneBonus(newStreakDays);
  const scoreXp = score * 10;
  return {
    baseXp,
    streakBonusXp,
    scoreXp,
    totalXp: baseXp + streakBonusXp + scoreXp,
  };
}

/** Random quiz id from a non-empty list (one pick per assignment). */
export function pickRandomQuizId(quizzes: Quiz[]): string | null {
  if (quizzes.length === 0) return null;
  const index = Math.floor(Math.random() * quizzes.length);
  return quizzes[index]?.id ?? null;
}

export const EMPTY_QUIZZES_MESSAGE = "Nu există quizuri disponibile";

export function localStorageDailyKey(userId: string): string {
  return `quiztime:daily:${userId}`;
}

export function nextStreakMilestone(
  streakDays: number
): (typeof STREAK_MILESTONES)[number] | null {
  for (const milestone of STREAK_MILESTONES) {
    if (streakDays < milestone) return milestone;
  }
  return null;
}
