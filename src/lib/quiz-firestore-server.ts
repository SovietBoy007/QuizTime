import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firestore-admin";
import {
  aggregateTotalScoresByUser,
  isSchoolLevel,
  LEVEL_XP_FIELD,
  readCategoryXp,
  scoreToXp,
  xpForFilter,
  type LeaderboardEntry,
  type LeaderboardXpFilter,
} from "@/lib/gamification";
import {
  fetchQuizByIdFromSourcesAdmin,
  loadQuizCatalogAdmin,
} from "@/lib/quiz-collection-sources";
import { mapResultDoc } from "@/lib/quiz-doc-mappers";
import { quizHasLevel } from "@/lib/quiz-levels";
import { SAMPLE_QUIZZES } from "@/data/sample-quizzes";
import type { Quiz, QuizResult, QuizResultPayload, SchoolLevel } from "@/types/quiz";

export async function adminFetchQuizzes(
  category?: string | null,
  level?: SchoolLevel | null
): Promise<Quiz[]> {
  const db = getAdminFirestore();
  const catalog = await loadQuizCatalogAdmin(db);
  let quizzes = catalog.quizzes;

  if (category) {
    quizzes = quizzes.filter((q) => q.category === category);
  }
  if (level) {
    quizzes = quizzes.filter((q) => quizHasLevel(q, level));
  }

  return quizzes;
}

export async function adminFetchQuizById(quizId: string): Promise<Quiz | null> {
  const db = getAdminFirestore();
  return fetchQuizByIdFromSourcesAdmin(db, quizId);
}

export async function adminCreateQuiz(
  authorId: string,
  payload: {
    title: string;
    description?: string;
    category?: string;
    questions: Quiz["questions"];
  }
): Promise<Quiz> {
  const db = getAdminFirestore();
  const ref = db.collection("quizzes").doc();

  const quiz: Quiz = {
    id: ref.id,
    title: payload.title,
    description: payload.description ?? "",
    category: payload.category ?? "general",
    questions: payload.questions,
  };

  await ref.set({
    title: quiz.title,
    description: quiz.description,
    category: quiz.category,
    authorId,
    questions: quiz.questions,
    createdAt: FieldValue.serverTimestamp(),
  });

  return quiz;
}

export async function adminSaveQuizResult(
  attemptId: string,
  result: QuizResultPayload
): Promise<{ docId: string; score: number; totalQuestions: number }> {
  const db = getAdminFirestore();
  const docId = `${result.userId}_${attemptId}`;
  const docRef = db.collection("results").doc(docId);
  const userRef = db.collection("users").doc(result.userId);
  const xpField = LEVEL_XP_FIELD[result.level];

  const existing = await docRef.get();
  const existingData = existing.data();
  const previousScore =
    existingData && typeof existingData.score === "number"
      ? existingData.score
      : 0;
  const previousLevel = isSchoolLevel(existingData?.level)
    ? existingData.level
    : null;

  await docRef.set({
    userId: result.userId,
    score: result.score,
    totalQuestions: result.totalQuestions,
    topic: result.topic,
    level: result.level,
    createdAt: FieldValue.serverTimestamp(),
  });

  if (previousLevel && previousLevel !== result.level) {
    const previousField = LEVEL_XP_FIELD[previousLevel];
    await userRef.set(
      {
        [previousField]: FieldValue.increment(-scoreToXp(previousScore)),
        [xpField]: FieldValue.increment(scoreToXp(result.score)),
      },
      { merge: true }
    );
  } else {
    const xpDelta = scoreToXp(result.score - previousScore);
    if (xpDelta !== 0) {
      await userRef.set({ [xpField]: FieldValue.increment(xpDelta) }, { merge: true });
    }
  }

  return {
    docId,
    score: result.score,
    totalQuestions: result.totalQuestions,
  };
}

export async function adminFetchUserResults(userId: string): Promise<QuizResult[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("results")
    .where("userId", "==", userId)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const createdAt = data.createdAt as { toDate?: () => Date } | undefined;
    return mapResultDoc(doc.id, data, createdAt);
  });
}

export async function adminFetchLeaderboard(
  limit = 10,
  xpFilter: LeaderboardXpFilter = "total"
): Promise<LeaderboardEntry[]> {
  return fetchLeaderboardFromFirestore(limit, xpFilter);
}

async function fetchLeaderboardFromFirestore(
  limit: number,
  xpFilter: LeaderboardXpFilter
): Promise<LeaderboardEntry[]> {
  const db = getAdminFirestore();
  const resultsSnapshot = await db.collection("results").get();
  console.log(
    `[Leaderboard] Fetched ${resultsSnapshot.size} result doc(s) from Firestore`
  );

  const totals = aggregateTotalScoresByUser(
    resultsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        userId: typeof data.userId === "string" ? data.userId : "",
        score: typeof data.score === "number" ? data.score : 0,
      };
    })
  );

  const withProfiles = await Promise.all(
    [...totals.entries()].map(async ([userId, totalScore]) => {
      const userSnap = await db.collection("users").doc(userId).get();
      const data = userSnap.data();

      return {
        userId,
        username:
          typeof data?.username === "string" && data.username.length > 0
            ? data.username
            : "Jucător",
        totalScore,
        xp: xpForFilter(readCategoryXp(data), xpFilter),
        avatarId:
          typeof data?.avatarId === "number" &&
          data.avatarId >= 1 &&
          data.avatarId <= 21
            ? data.avatarId
            : 1,
      };
    })
  );

  const sorted = [...withProfiles].sort((a, b) => {
    if (xpFilter === "total") {
      return b.totalScore - a.totalScore || b.xp - a.xp;
    }
    return b.xp - a.xp || b.totalScore - a.totalScore;
  });

  return sorted.slice(0, limit).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
