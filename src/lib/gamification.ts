import type { SchoolLevel, TimerDuration } from "@/types/quiz";

/** XP earned per correct answer (score point). */
export const XP_PER_SCORE_POINT = 10;

/** XP multipliers for each timed-mode duration. */
export const TIMED_XP_MULTIPLIERS: Record<TimerDuration, number> = {
  300: 1.1,
  120: 1.3,
  60: 1.6,
  30: 2.0,
};

export const TIMER_DURATION_LABELS: Record<TimerDuration, string> = {
  300: "5 minute",
  120: "2 minute",
  60: "1 minut",
  30: "30 secunde",
};

export function getTimedXpMultiplier(duration: TimerDuration): number {
  return TIMED_XP_MULTIPLIERS[duration];
}

export type CategoryXpField = "xpPrimar" | "xpGimnazial" | "xpLiceal";

export const LEVEL_XP_FIELD: Record<SchoolLevel, CategoryXpField> = {
  primar: "xpPrimar",
  gimnazial: "xpGimnazial",
  liceu: "xpLiceal",
};

export type LeaderboardXpFilter = "total" | SchoolLevel;

export const LEADERBOARD_XP_FILTERS: { value: LeaderboardXpFilter; label: string }[] =
  [
    { value: "total", label: "XP total" },
    { value: "primar", label: "Primar" },
    { value: "gimnazial", label: "Gimnazial" },
    { value: "liceu", label: "Liceu" },
  ];

export type CategoryXp = Record<CategoryXpField, number>;

export type LeaderboardEntry = {
  userId: string;
  username: string;
  totalScore: number;
  xp: number;
  rank: number;
  avatarId?: number;
};

export function scoreToXp(score: number): number {
  return score * XP_PER_SCORE_POINT;
}

export function isSchoolLevel(value: unknown): value is SchoolLevel {
  return value === "primar" || value === "gimnazial" || value === "liceu";
}

export function readCategoryXp(data: Record<string, unknown> | undefined): CategoryXp {
  return {
    xpPrimar: typeof data?.xpPrimar === "number" ? data.xpPrimar : 0,
    xpGimnazial: typeof data?.xpGimnazial === "number" ? data.xpGimnazial : 0,
    xpLiceal: typeof data?.xpLiceal === "number" ? data.xpLiceal : 0,
  };
}

export function totalXpFromCategories(xp: CategoryXp): number {
  return xp.xpPrimar + xp.xpGimnazial + xp.xpLiceal;
}

export function xpForFilter(xp: CategoryXp, filter: LeaderboardXpFilter): number {
  if (filter === "total") return totalXpFromCategories(xp);
  return xp[LEVEL_XP_FIELD[filter]];
}

export const INITIAL_CATEGORY_XP: CategoryXp = {
  xpPrimar: 0,
  xpGimnazial: 0,
  xpLiceal: 0,
};

export function aggregateTotalScoresByUser(
  results: { userId: string; score: number }[]
): Map<string, number> {
  const totals = new Map<string, number>();

  for (const { userId, score } of results) {
    if (!userId) continue;
    totals.set(userId, (totals.get(userId) ?? 0) + score);
  }

  return totals;
}
