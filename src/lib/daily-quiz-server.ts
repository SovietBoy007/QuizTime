import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firestore-admin";
import {
  calculateDailyQuizXp,
  computeDailyStreakUpdate,
  DailyQuizAlreadyCompletedError,
  hasAssignmentForToday,
  pickRandomQuizId,
  readDailyAssignment,
  readDailyQuizFields,
  toDateKey,
} from "@/lib/daily-quiz";

export { DailyQuizAlreadyCompletedError };
import { loadQuizCatalogAdmin } from "@/lib/quiz-collection-sources";
import { LEVEL_XP_FIELD } from "@/lib/gamification";
import type { SchoolLevel } from "@/types/quiz";

export type DailyAssignmentResult = {
  quizId: string | null;
  firestoreEmpty: boolean;
};

/**
 * Returns today's assigned quiz for the user, creating a random assignment if needed.
 */
export async function resolveDailyQuizAssignment(
  userId: string
): Promise<DailyAssignmentResult> {
  const db = getAdminFirestore();
  const userRef = db.collection("users").doc(userId);
  const todayKey = toDateKey(new Date());
  const catalog = await loadQuizCatalogAdmin(db);
  const quizzes = catalog.quizzes;
  const firestoreEmpty = !catalog.firestoreHadQuizzes;

  console.log(
    `[DailyQuiz] userId=${userId} — catalog source="${catalog.source}", ` +
      `quizzes=${quizzes.length}, firestoreHadQuizzes=${catalog.firestoreHadQuizzes}`
  );

  if (quizzes.length === 0) {
    console.error(
      `[DailyQuiz] CRITICAL: No quizzes available for user=${userId}. ` +
        "Firestore 'quizzes' collection is empty. Run `npm run seed:quizzes`."
    );
    return { quizId: null, firestoreEmpty: true };
  }

  const quizId = await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const assignment = readDailyAssignment(snap.data());

    if (
      hasAssignmentForToday(assignment.dailyQuizDate) &&
      assignment.dailyQuizId &&
      quizzes.some((q) => q.id === assignment.dailyQuizId)
    ) {
      return assignment.dailyQuizId;
    }

    const newId = pickRandomQuizId(quizzes);
    if (!newId) return null;

    tx.set(
      userRef,
      { dailyQuizId: newId, dailyQuizDate: todayKey },
      { merge: true }
    );

    return newId;
  });

  return { quizId, firestoreEmpty };
}

export type DailyQuizCompletionResult = {
  streakDays: number;
  lastQuizDate: string;
  baseXp: number;
  streakBonusXp: number;
  scoreXp: number;
  totalXp: number;
};

/**
 * Atomically applies daily quiz completion on users/{uid} only.
 * Re-reads and recomputes streak inside the transaction to avoid duplicate increments.
 */
export async function applyDailyQuizCompletion(
  userId: string,
  score: number,
  level: SchoolLevel
): Promise<DailyQuizCompletionResult> {
  const db = getAdminFirestore();
  const userRef = db.collection("users").doc(userId);
  const xpField = LEVEL_XP_FIELD[level];

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const data = snap.data() ?? {};
    const fields = readDailyQuizFields(data);

    const update = computeDailyStreakUpdate(
      fields.lastQuizDate,
      fields.streakDays
    );

    if (update.alreadyCompletedToday) {
      throw new DailyQuizAlreadyCompletedError();
    }

    const xp = calculateDailyQuizXp(score, update.streakDays);

    const todayKey = toDateKey(new Date());

    tx.set(
      userRef,
      {
        lastQuizDate: update.lastQuizDate,
        streakDays: update.streakDays,
        dailyQuizDate: todayKey,
        [xpField]: FieldValue.increment(xp.totalXp),
      },
      { merge: true }
    );

    return {
      streakDays: update.streakDays,
      lastQuizDate: update.lastQuizDate,
      baseXp: xp.baseXp,
      streakBonusXp: xp.streakBonusXp,
      scoreXp: xp.scoreXp,
      totalXp: xp.totalXp,
    };
  });
}
