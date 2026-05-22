import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUid } from "@/lib/server-auth";
import {
  adminFetchQuizById,
  adminFetchUserResults,
  adminSaveQuizResult,
} from "@/lib/quiz-firestore-server";
import { isSchoolLevel } from "@/lib/gamification";
import type { QuizResultPayload, SchoolLevel } from "@/types/quiz";

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

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUid(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      quizId,
      answers,
      attemptId,
      score,
      totalQuestions,
      topic,
      level,
    } = body as {
      quizId?: string;
      answers?: Record<string, string>;
      attemptId?: string;
      score?: number;
      totalQuestions?: number;
      topic?: string;
      level?: SchoolLevel;
    };

    let payload: QuizResultPayload;
    const resultAttemptId = attemptId ?? crypto.randomUUID();

    if (
      typeof score === "number" &&
      typeof totalQuestions === "number" &&
      topic &&
      isSchoolLevel(level)
    ) {
      payload = { userId, score, totalQuestions, topic, level };
    } else if (quizId && answers) {
      const quiz = await adminFetchQuizById(quizId);

      if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }

      const correctCount = scoreFromAnswers(quiz, answers);
      const resolvedLevel =
        quiz.questions.find((q) => isSchoolLevel(q.level))?.level ?? "gimnazial";

      payload = {
        userId,
        score: correctCount,
        totalQuestions: quiz.questions.length,
        topic: quiz.category,
        level: resolvedLevel,
      };
    } else {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const saved = await adminSaveQuizResult(resultAttemptId, payload);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUid(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scores = await adminFetchUserResults(userId);
    return NextResponse.json(scores, { status: 200 });
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json([], { status: 200 });
  }
}
