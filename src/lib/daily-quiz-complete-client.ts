import {
  doc,
  increment,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  calculateDailyQuizXp,
  computeDailyStreakUpdate,
  DailyQuizAlreadyCompletedError,
  readDailyQuizFields,
  toDateKey,
} from "@/lib/daily-quiz";
import { LEVEL_XP_FIELD } from "@/lib/gamification";
import { logFirebaseError } from "@/lib/firebase-error-message";
import type { SchoolLevel } from "@/types/quiz";

export type DailyQuizCompleteOutcome = {
  streakDays: number;
  baseXp: number;
  streakBonusXp: number;
  scoreXp: number;
  totalXp: number;
  score: number;
  totalQuestions: number;
};

export type DailyQuizCompleteInput = {
  userId: string;
  score: number;
  totalQuestions: number;
  topic: string;
  level: SchoolLevel;
  quizId: string;
};

/**
 * Completes the daily quiz via client Firestore (rules-compatible).
 * Single transaction on users/{uid} prevents duplicate streak/XP grants.
 */
export async function completeDailyQuizClient(
  input: DailyQuizCompleteInput
): Promise<DailyQuizCompleteOutcome> {
  const { userId, score, totalQuestions, topic, level, quizId } = input;
  const todayKey = toDateKey(new Date());
  const userRef = doc(db, "users", userId);
  const resultRef = doc(db, "results", `${userId}_daily_${todayKey}`);
  const xpField = LEVEL_XP_FIELD[level];

  let outcome: {
    streakDays: number;
    baseXp: number;
    streakBonusXp: number;
    scoreXp: number;
    totalXp: number;
  };

  try {
    outcome = await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const fields = readDailyQuizFields(userSnap.data());

      const streakUpdate = computeDailyStreakUpdate(
        fields.lastQuizDate,
        fields.streakDays
      );

      if (streakUpdate.alreadyCompletedToday) {
        throw new DailyQuizAlreadyCompletedError();
      }

      const xp = calculateDailyQuizXp(score, streakUpdate.streakDays);

      transaction.set(
        userRef,
        {
          lastQuizDate: streakUpdate.lastQuizDate,
          streakDays: streakUpdate.streakDays,
          dailyQuizId: quizId,
          dailyQuizDate: todayKey,
          [xpField]: increment(xp.totalXp),
        },
        { merge: true }
      );

      transaction.set(resultRef, {
        userId,
        score,
        totalQuestions,
        topic,
        level,
        daily: true,
        quizId,
        createdAt: serverTimestamp(),
      });

      return {
        streakDays: streakUpdate.streakDays,
        ...xp,
      };
    });
  } catch (error) {
    logFirebaseError("completeDailyQuizClient", error);
    throw error;
  }

  return {
    ...outcome,
    score,
    totalQuestions,
  };
}
