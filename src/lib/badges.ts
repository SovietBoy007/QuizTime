import { doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { QuizResult, SchoolLevel } from "@/types/quiz";
import type {
  BadgeCategory,
  BadgeDefinition,
  BadgeId,
  UserBadgeState,
} from "@/types/badges";

export const BADGE_CATEGORY_LABELS: Record<BadgeCategory, string> = {
  performanta: "Performanță",
  progres: "Progres",
  categorii: "Categorii",
  streak: "Streak",
};

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "scor-perfect",
    name: "Scor Perfect",
    description: "Obține 100% la un quiz.",
    category: "performanta",
    icon: "💯",
  },
  {
    id: "performanta-ridicata",
    name: "Performanță Ridicată",
    description: "Obține cel puțin 90% la un quiz.",
    category: "performanta",
    icon: "⭐",
  },
  {
    id: "primul-quiz",
    name: "Primul Quiz",
    description: "Completează primul quiz.",
    category: "progres",
    icon: "🎯",
  },
  {
    id: "incepator-quiz",
    name: "Începător Quiz",
    description: "Completează 10 quiz-uri în total.",
    category: "progres",
    icon: "📘",
  },
  {
    id: "activ-quiz",
    name: "Activ Quiz",
    description: "Completează 30 de quiz-uri în total.",
    category: "progres",
    icon: "📚",
  },
  {
    id: "maestru-quiz",
    name: "Maestru Quiz",
    description: "Completează 75 de quiz-uri în total.",
    category: "progres",
    icon: "🏆",
  },
  {
    id: "explorator-primar",
    name: "Explorator Primar",
    description: "Completează 5 quiz-uri la nivel primar.",
    category: "categorii",
    icon: "🌱",
  },
  {
    id: "explorator-gimnaziu",
    name: "Explorator Gimnaziu",
    description: "Completează 5 quiz-uri la nivel gimnazial.",
    category: "categorii",
    icon: "🔬",
  },
  {
    id: "explorator-liceu",
    name: "Explorator Liceu",
    description: "Completează 5 quiz-uri la nivel liceal.",
    category: "categorii",
    icon: "🎓",
  },
  {
    id: "consecvent-3-zile",
    name: "Streak 3 Zile",
    description: "Joacă quiz-uri 3 zile la rând.",
    category: "streak",
    icon: "🔥",
  },
  {
    id: "consecvent-7-zile",
    name: "Streak 7 Zile",
    description: "Joacă quiz-uri 7 zile la rând.",
    category: "streak",
    icon: "⚡",
  },
  {
    id: "consecvent-14-zile",
    name: "Streak 14 Zile",
    description: "Joacă quiz-uri 14 zile la rând.",
    category: "streak",
    icon: "🌟",
  },
];

/** Insignă veche din Firestore — afișată ca „Activ Quiz”. */
const LEGACY_BADGE_ID_ACTIV = "dependent-quiz";

const ALL_BADGE_IDS = BADGE_DEFINITIONS.map((b) => b.id);

function isBadgeId(value: unknown): value is BadgeId {
  return typeof value === "string" && ALL_BADGE_IDS.includes(value as BadgeId);
}

function normalizeEarnedBadgeIds(raw: unknown[]): BadgeId[] {
  const earned = new Set<BadgeId>();

  for (const value of raw) {
    if (value === LEGACY_BADGE_ID_ACTIV) {
      earned.add("activ-quiz");
      continue;
    }
    if (isBadgeId(value)) {
      earned.add(value);
    }
  }

  return [...earned];
}

export function readUserBadges(data: Record<string, unknown> | undefined): UserBadgeState {
  const raw = data?.badges;
  const earnedIds = Array.isArray(raw) ? normalizeEarnedBadgeIds(raw) : [];

  return {
    earnedIds,
    streakCount: typeof data?.streakCount === "number" ? data.streakCount : 0,
  };
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function yesterdayKey(from: Date): string {
  const copy = new Date(from);
  copy.setDate(copy.getDate() - 1);
  return toDateKey(copy);
}

export function computeStreakAfterQuiz(
  lastActivityDate: string | undefined,
  currentStreak: number,
  today: Date = new Date()
): { streakCount: number; lastActivityDate: string } {
  const todayKey = toDateKey(today);

  if (lastActivityDate === todayKey) {
    return { streakCount: currentStreak, lastActivityDate: todayKey };
  }

  if (lastActivityDate === yesterdayKey(today)) {
    return { streakCount: Math.max(currentStreak, 0) + 1, lastActivityDate: todayKey };
  }

  return { streakCount: 1, lastActivityDate: todayKey };
}

function quizPercentage(score: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return (score / totalQuestions) * 100;
}

function countByLevel(results: QuizResult[], level: SchoolLevel): number {
  return results.filter((r) => r.level === level).length;
}

export function evaluateEligibleBadges(input: {
  earnedIds: BadgeId[];
  streakCount: number;
  allResults: QuizResult[];
  currentScore: number;
  currentTotalQuestions: number;
}): BadgeId[] {
  const { earnedIds, streakCount, allResults, currentScore, currentTotalQuestions } =
    input;
  const owned = new Set(earnedIds);
  const eligible = new Set<BadgeId>();

  const totalQuizzes = allResults.length;
  const currentPercentage = quizPercentage(currentScore, currentTotalQuestions);

  if (totalQuizzes >= 1) eligible.add("primul-quiz");
  if (currentPercentage >= 100) eligible.add("scor-perfect");
  if (currentPercentage >= 90) eligible.add("performanta-ridicata");

  if (totalQuizzes >= 10) eligible.add("incepator-quiz");
  if (totalQuizzes >= 30) eligible.add("activ-quiz");
  if (totalQuizzes >= 75) eligible.add("maestru-quiz");

  if (countByLevel(allResults, "primar") >= 5) eligible.add("explorator-primar");
  if (countByLevel(allResults, "gimnazial") >= 5) eligible.add("explorator-gimnaziu");
  if (countByLevel(allResults, "liceu") >= 5) eligible.add("explorator-liceu");

  if (streakCount >= 3) eligible.add("consecvent-3-zile");
  if (streakCount >= 7) eligible.add("consecvent-7-zile");
  if (streakCount >= 14) eligible.add("consecvent-14-zile");

  return [...eligible].filter((id) => !owned.has(id));
}

export type BadgeCheckContext = {
  score: number;
  totalQuestions: number;
  level: SchoolLevel;
  allResults: QuizResult[];
};

export async function checkAndAwardBadges(
  userId: string,
  context: BadgeCheckContext
): Promise<BadgeId[]> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();
  const { earnedIds, streakCount: previousStreak } = readUserBadges(userData);

  const lastActivityDate =
    typeof userData?.lastActivityDate === "string"
      ? userData.lastActivityDate
      : undefined;

  const { streakCount, lastActivityDate: nextActivityDate } =
    computeStreakAfterQuiz(lastActivityDate, previousStreak);

  const toAward = evaluateEligibleBadges({
    earnedIds,
    streakCount,
    allResults: context.allResults,
    currentScore: context.score,
    currentTotalQuestions: context.totalQuestions,
  });

  const updatePayload: Record<string, unknown> = {
    streakCount,
    lastActivityDate: nextActivityDate,
  };

  if (toAward.length > 0) {
    updatePayload.badges = arrayUnion(...toAward);
  }

  if (
    toAward.length > 0 ||
    streakCount !== previousStreak ||
    lastActivityDate !== nextActivityDate
  ) {
    await setDoc(userRef, updatePayload, { merge: true });
  }

  return toAward;
}

export function badgesByCategory(): Record<BadgeCategory, BadgeDefinition[]> {
  const grouped: Record<BadgeCategory, BadgeDefinition[]> = {
    performanta: [],
    progres: [],
    categorii: [],
    streak: [],
  };

  for (const badge of BADGE_DEFINITIONS) {
    grouped[badge.category].push(badge);
  }

  return grouped;
}
