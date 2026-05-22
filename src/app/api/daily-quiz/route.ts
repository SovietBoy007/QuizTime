import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUid } from "@/lib/server-auth";
import {
  EMPTY_QUIZZES_MESSAGE,
  getDisplayStreakDays,
  isDailyQuizCompletedToday,
  readDailyQuizFields,
  STREAK_MILESTONES,
  STREAK_MILESTONE_BONUS_XP,
} from "@/lib/daily-quiz";
import { DailyQuizAlreadyCompletedError } from "@/lib/daily-quiz";
import {
  applyDailyQuizCompletion,
  resolveDailyQuizAssignment,
} from "@/lib/daily-quiz-server";
import { adminFetchQuizById } from "@/lib/quiz-firestore-server";
import { isSchoolLevel } from "@/lib/gamification";
import { getAdminFirestore } from "@/lib/firestore-admin";
import type { SchoolLevel } from "@/types/quiz";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function scoreFromAnswers(
  quiz: NonNullable<Awaited<ReturnType<typeof adminFetchQuizById>>>,
  answers: Record<string, string>
): number {
  let correctCount = 0;

  for (const question of quiz.questions) {
    if (answers[question.id] === question.correctAnswerId) {
      correctCount++;
    }
  }

  return correctCount;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUid(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminFirestore();
    const userSnap = await db.collection("users").doc(userId).get();
    const fields = readDailyQuizFields(userSnap.data());

    const { quizId, firestoreEmpty } = await resolveDailyQuizAssignment(userId);
    const completedToday = isDailyQuizCompletedToday(fields.lastQuizDate);
    const displayStreakDays = getDisplayStreakDays(
      fields.lastQuizDate,
      fields.streakDays
    );

    return NextResponse.json({
      quizId,
      firestoreEmpty,
      emptyMessage: firestoreEmpty ? EMPTY_QUIZZES_MESSAGE : undefined,
      completedToday,
      streakDays: fields.streakDays,
      displayStreakDays,
      statusLabel: completedToday ? "Completat azi" : "Disponibil azi",
      milestones: STREAK_MILESTONES.map((days) => ({
        days,
        bonusXp: STREAK_MILESTONE_BONUS_XP[days],
        reached: fields.streakDays >= days,
      })),
    });
  } catch (error) {
    console.error("Error fetching daily quiz status:", error);
    return NextResponse.json(
      { error: "Failed to load daily quiz" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUid(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { quizId, answers, level } = body as {
      quizId?: string;
      answers?: Record<string, string>;
      level?: SchoolLevel;
    };

    if (!quizId || !answers || !isSchoolLevel(level)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { quizId: expectedQuizId, firestoreEmpty } =
      await resolveDailyQuizAssignment(userId);

    if (firestoreEmpty || !expectedQuizId) {
      return NextResponse.json(
        { error: EMPTY_QUIZZES_MESSAGE },
        { status: 404 }
      );
    }

    if (quizId !== expectedQuizId) {
      return NextResponse.json(
        { error: "Invalid daily quiz" },
        { status: 400 }
      );
    }

    const quiz = await adminFetchQuizById(quizId);

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const score = scoreFromAnswers(quiz, answers);

    try {
      const result = await applyDailyQuizCompletion(userId, score, level);

      return NextResponse.json(
        {
          ...result,
          score,
          totalQuestions: quiz.questions.length,
          topic: quiz.category,
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof DailyQuizAlreadyCompletedError) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error completing daily quiz:", error);
    const message =
      error instanceof Error ? error.message : "Failed to complete daily quiz";
    const isCredentials =
      message.includes("Could not load the default credentials") ||
      message.includes("credential");

    return NextResponse.json(
      {
        error: isCredentials
          ? "Server Firebase credentials missing. Use serviceAccount.json or FIREBASE_SERVICE_ACCOUNT_KEY."
          : message,
      },
      { status: 500 }
    );
  }
}
