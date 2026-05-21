import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  increment,
  type DocumentData,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SAMPLE_QUIZZES } from "@/data/sample-quizzes";
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
import { checkAndAwardBadges } from "@/lib/badges";
import { quizHasLevel } from "@/lib/quiz-levels";
import type { BadgeId } from "@/types/badges";
import type {
  Quiz,
  QuizResult,
  QuizResultPayload,
  QuizSaveOutcome,
  SchoolLevel,
} from "@/types/quiz";

function mapResultDoc(id: string, data: DocumentData): QuizResult {
  const createdAt = data.createdAt as Timestamp | undefined;
  return {
    id,
    userId: data.userId ?? "",
    score: typeof data.score === "number" ? data.score : 0,
    totalQuestions:
      typeof data.totalQuestions === "number" ? data.totalQuestions : 0,
    topic: data.topic ?? "general",
    level: isSchoolLevel(data.level) ? data.level : "gimnazial",
    createdAt: createdAt?.toDate?.() ?? null,
  };
}

function normalizeQuestion(
  raw: DocumentData,
  index: number,
  quizCategory: string
): Quiz["questions"][number] | null {
  const level = raw.level;
  const validLevel =
    level === "primar" || level === "gimnazial" || level === "liceu"
      ? level
      : "gimnazial";

  if (!raw.question || !Array.isArray(raw.answers) || !raw.correctAnswerId) {
    return null;
  }

  const topic =
    typeof raw.topic === "string" && raw.topic.length > 0
      ? raw.topic
      : quizCategory;

  return {
    id: raw.id ?? `q-${index}`,
    level: validLevel,
    topic,
    question: raw.question,
    answers: raw.answers,
    correctAnswerId: raw.correctAnswerId,
    explanation: raw.explanation ?? "",
  };
}

function mapQuizDoc(id: string, data: DocumentData): Quiz | null {
  const rawQuestions = data.questions;
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    return null;
  }

  const category = data.category ?? "general";

  const questions = rawQuestions
    .map((item, index) =>
      normalizeQuestion(item as DocumentData, index, category)
    )
    .filter((q): q is Quiz["questions"][number] => q !== null);

  if (questions.length === 0) {
    return null;
  }

  return {
    id,
    title: data.title ?? "Quiz fără titlu",
    description: data.description ?? "",
    category: data.category ?? "general",
    questions,
  };
}

export async function fetchQuizzes(
  category?: string,
  level?: SchoolLevel
): Promise<Quiz[]> {
  try {
    const snapshot = await getDocs(collection(db, "quizzes"));
    let quizzes = snapshot.docs
      .map((d) => mapQuizDoc(d.id, d.data()))
      .filter((q): q is Quiz => q !== null);

    if (quizzes.length === 0) {
      quizzes = [...SAMPLE_QUIZZES];
    }

    if (category) {
      quizzes = quizzes.filter((q) => q.category === category);
    }
    if (level) {
      quizzes = quizzes.filter((q) => quizHasLevel(q, level));
    }

    return quizzes;
  } catch (error) {
    console.error("Failed to fetch quizzes from Firestore:", error);
    let fallback = [...SAMPLE_QUIZZES];
    if (category) fallback = fallback.filter((q) => q.category === category);
    if (level) fallback = fallback.filter((q) => quizHasLevel(q, level));
    return fallback;
  }
}

export async function fetchQuizById(quizId: string): Promise<Quiz | null> {
  try {
    const snapshot = await getDoc(doc(db, "quizzes", quizId));
    if (snapshot.exists()) {
      const quiz = mapQuizDoc(snapshot.id, snapshot.data());
      if (quiz) return quiz;
    }
  } catch (error) {
    console.error("Failed to fetch quiz from Firestore:", error);
  }

  return SAMPLE_QUIZZES.find((q) => q.id === quizId) ?? null;
}

/**
 * Saves a quiz result once per attempt using a deterministic document id.
 * Re-calling with the same attemptId overwrites the same doc (no duplicate rows).
 */
export async function saveQuizResult(
  attemptId: string,
  result: QuizResultPayload
): Promise<QuizSaveOutcome> {
  const docId = `${result.userId}_${attemptId}`;
  const docRef = doc(db, "results", docId);
  const userRef = doc(db, "users", result.userId);
  const xpField = LEVEL_XP_FIELD[result.level];

  const existing = await getDoc(docRef);
  const existingData = existing.exists() ? existing.data() : null;
  const previousScore =
    existingData && typeof existingData.score === "number"
      ? existingData.score
      : 0;
  const previousLevel = isSchoolLevel(existingData?.level)
    ? existingData.level
    : null;

  await setDoc(docRef, {
    userId: result.userId,
    score: result.score,
    totalQuestions: result.totalQuestions,
    topic: result.topic,
    level: result.level,
    createdAt: serverTimestamp(),
  });

  if (previousLevel && previousLevel !== result.level) {
    const previousField = LEVEL_XP_FIELD[previousLevel];
    await setDoc(
      userRef,
      {
        [previousField]: increment(-scoreToXp(previousScore)),
        [xpField]: increment(scoreToXp(result.score)),
      },
      { merge: true }
    );
  } else {
    const xpDelta = scoreToXp(result.score - previousScore);
    if (xpDelta !== 0) {
      await setDoc(userRef, { [xpField]: increment(xpDelta) }, { merge: true });
    }
  }

  const userSnap = await getDoc(userRef);
  const categoryXp = readCategoryXp(userSnap.data());
  const xpGained =
    previousLevel && previousLevel !== result.level
      ? scoreToXp(result.score)
      : scoreToXp(result.score - previousScore);

  let newBadges: BadgeId[] = [];
  const isNewAttempt = !existing.exists();

  if (isNewAttempt) {
    const allResults = await fetchUserResults(result.userId);
    newBadges = await checkAndAwardBadges(result.userId, {
      score: result.score,
      totalQuestions: result.totalQuestions,
      level: result.level,
      allResults,
    });
  }

  return {
    docId,
    xpGained,
    categoryXpTotal: categoryXp[xpField],
    level: result.level,
    newBadges,
  };
}

export async function fetchLeaderboard(
  limit = 10,
  xpFilter: LeaderboardXpFilter = "total"
): Promise<LeaderboardEntry[]> {
  const snapshot = await getDocs(collection(db, "results"));
  const totals = aggregateTotalScoresByUser(
    snapshot.docs.map((d) => {
      const data = d.data();
      return {
        userId: data.userId ?? "",
        score: typeof data.score === "number" ? data.score : 0,
      };
    })
  );

  const withProfiles = await Promise.all(
    [...totals.entries()].map(async ([userId, totalScore]) => {
      const userSnap = await getDoc(doc(db, "users", userId));
      const data = userSnap.data();
      const categoryXp = readCategoryXp(data);

      return {
        userId,
        username:
          typeof data?.username === "string" && data.username.length > 0
            ? data.username
            : "Jucător",
        totalScore,
        xp: xpForFilter(categoryXp, xpFilter),
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

export async function fetchUserResults(userId: string): Promise<QuizResult[]> {
  const q = query(collection(db, "results"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapResultDoc(d.id, d.data()));
}

/** Live listener — dashboard stays in sync when new results are saved. */
export function subscribeUserResults(
  userId: string,
  onResults: (results: QuizResult[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, "results"), where("userId", "==", userId));
  return onSnapshot(
    q,
    (snapshot) => {
      onResults(snapshot.docs.map((d) => mapResultDoc(d.id, d.data())));
    },
    (error) => {
      console.error("Failed to subscribe to user results:", error);
      onError?.(error);
    }
  );
}
