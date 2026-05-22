import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUid } from "@/lib/server-auth";
import {
  adminCreateQuiz,
  adminFetchQuizzes,
} from "@/lib/quiz-firestore-server";
import { isSchoolLevel } from "@/lib/gamification";
import type { Quiz } from "@/types/quiz";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const levelParam = searchParams.get("level");
    const level = isSchoolLevel(levelParam) ? levelParam : null;

    const quizzes = await adminFetchQuizzes(category, level);
    return NextResponse.json(quizzes, { status: 200 });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUid(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, questions } = body as {
      title?: string;
      description?: string;
      category?: string;
      questions?: Quiz["questions"];
    };

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const quiz = await adminCreateQuiz(userId, {
      title,
      description,
      category,
      questions,
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
