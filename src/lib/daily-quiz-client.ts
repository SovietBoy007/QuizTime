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

  console.log(`[DailyQuiz client] Resolving daily quiz for userId=${userId}, today=${todayKey}`);

  const catalog = await loadQuizCatalogClient();
  const quizzes = catalog.quizzes;
  const firestoreEmpty = !catalog.firestoreHadQuizzes;

  console.log(
    `[DailyQuiz client] Catalog loaded: ${quizzes.length} quiz(zes), source="${catalog.source}", firestoreHadQuizzes=${catalog.firestoreHadQuizzes}`
  );

  if (quizzes.length === 0) {
    console.error("[DailyQuiz client] No quizzes available — cannot assign daily quiz.");
    return { quizId: null, firestoreEmpty: true };
  }

  const fromLocal = readLocalAssignment(userId);

  let fromUser: { dailyQuizId?: string; dailyQuizDate?: string } = {};
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    fromUser = readDailyAssignment(userSnap.data());
    console.log(
      `[DailyQuiz client] Firestore user doc — dailyQuizId=${fromUser.dailyQuizId ?? "none"}, dailyQuizDate=${fromUser.dailyQuizDate ?? "none"}`
    );
  } catch (err) {
    console.warn("[DailyQuiz client] Could not read users/{uid} from Firestore:", err);
  }

  console.log(
    `[DailyQuiz client] localStorage — dailyQuizId=${fromLocal.dailyQuizId ?? "none"}, dailyQuizDate=${fromLocal.dailyQuizDate ?? "none"}`
  );

  const existingId =
    hasAssignmentForToday(fromUser.dailyQuizDate) && fromUser.dailyQuizId
      ? fromUser.dailyQuizId
      : hasAssignmentForToday(fromLocal.dailyQuizDate) && fromLocal.dailyQuizId
        ? fromLocal.dailyQuizId
        : undefined;

  if (existingId && quizzes.some((q) => q.id === existingId)) {
    console.log(`[DailyQuiz client] Reusing existing assignment: quizId=${existingId}`);
    writeLocalAssignment(userId, existingId, todayKey);
    if (fromUser.dailyQuizId !== existingId || fromUser.dailyQuizDate !== todayKey) {
      try {
        await setDoc(
          doc(db, "users", userId),
          { dailyQuizId: existingId, dailyQuizDate: todayKey },
          { merge: true }
        );
      } catch (err) {
        console.warn("[DailyQuiz client] Could not persist assignment to Firestore (will use localStorage):", err);
      }
    }
    return { quizId: existingId, firestoreEmpty };
  }

  const newId = pickRandomQuizId(quizzes);
  if (!newId) {
    console.error("[DailyQuiz client] pickRandomQuizId returned null unexpectedly.");
    return { quizId: null, firestoreEmpty: true };
  }

  console.log(`[DailyQuiz client] Assigned new quiz: quizId=${newId}`);
  writeLocalAssignment(userId, newId, todayKey);

  try {
    await setDoc(
      doc(db, "users", userId),
      { dailyQuizId: newId, dailyQuizDate: todayKey },
      { merge: true }
    );
  } catch (err) {
    console.warn("[DailyQuiz client] Could not persist new assignment to Firestore (will use localStorage):", err);
  }

  return { quizId: newId, firestoreEmpty };
}
