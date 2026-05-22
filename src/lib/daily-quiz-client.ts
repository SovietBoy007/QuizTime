import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  hasAssignmentForToday,
  localStorageDailyKey,
  pickRandomQuizId,
  readDailyAssignment,
  toDateKey,
} from "@/lib/daily-quiz";
import { loadQuizCatalogClient } from "@/lib/quiz-collection-sources";

export type DailyAssignmentResult = {
  quizId: string | null;
  firestoreEmpty: boolean;
};

function readLocalAssignment(userId: string): {
  dailyQuizId?: string;
  dailyQuizDate?: string;
} {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(localStorageDailyKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as {
      dailyQuizId?: string;
      dailyQuizDate?: string;
    };
    return {
      dailyQuizId:
        typeof parsed.dailyQuizId === "string" ? parsed.dailyQuizId : undefined,
      dailyQuizDate:
        typeof parsed.dailyQuizDate === "string"
          ? parsed.dailyQuizDate
          : undefined,
    };
  } catch {
    return {};
  }
}

function writeLocalAssignment(
  userId: string,
  dailyQuizId: string,
  dailyQuizDate: string
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    localStorageDailyKey(userId),
    JSON.stringify({ dailyQuizId, dailyQuizDate })
  );
}

/**
 * Resolves today's daily quiz for a user: reuse assignment or pick a new random quiz.
 * Reads quizzes from Firestore (`quizzes`, alternates, or topic collections), with bundled fallback.
 */
export async function resolveDailyQuizAssignmentClient(
  userId: string
): Promise<DailyAssignmentResult> {
  const todayKey = toDateKey(new Date());
  const catalog = await loadQuizCatalogClient();
  const quizzes = catalog.quizzes;
  const firestoreEmpty = !catalog.firestoreHadQuizzes;

  if (quizzes.length === 0) {
    return { quizId: null, firestoreEmpty: true };
  }

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const fromUser = readDailyAssignment(userSnap.data());
  const fromLocal = readLocalAssignment(userId);

  const existingId =
    hasAssignmentForToday(fromUser.dailyQuizDate) && fromUser.dailyQuizId
      ? fromUser.dailyQuizId
      : hasAssignmentForToday(fromLocal.dailyQuizDate) && fromLocal.dailyQuizId
        ? fromLocal.dailyQuizId
        : undefined;

  if (existingId && quizzes.some((q) => q.id === existingId)) {
    writeLocalAssignment(userId, existingId, todayKey);
    if (
      fromUser.dailyQuizId !== existingId ||
      fromUser.dailyQuizDate !== todayKey
    ) {
      await setDoc(
        userRef,
        { dailyQuizId: existingId, dailyQuizDate: todayKey },
        { merge: true }
      );
    }
    return { quizId: existingId, firestoreEmpty };
  }

  const newId = pickRandomQuizId(quizzes);
  if (!newId) {
    return { quizId: null, firestoreEmpty: true };
  }

  await setDoc(
    userRef,
    { dailyQuizId: newId, dailyQuizDate: todayKey },
    { merge: true }
  );
  writeLocalAssignment(userId, newId, todayKey);

  return { quizId: newId, firestoreEmpty };
}
