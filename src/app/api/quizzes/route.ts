import { NextRequest, NextResponse } from "next/server";
import { getPrismaUserIdFromRequest } from "@/lib/prisma-auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET all quizzes or search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");

    const where: any = {};
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const quizzes = await getPrisma().quiz.findMany({
      where,
      include: {
        author: { select: { id: true, username: true } },
        questions: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quizzes, { status: 200 });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

// POST create new quiz
export async function POST(request: NextRequest) {
  try {
    const userId = await getPrismaUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, category, difficulty, questions } = body;

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const quiz = await getPrisma().quiz.create({
      data: {
        title,
        description: description || "",
        category: category || "general",
        difficulty: difficulty || "medium",
        authorId: userId,
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            type: q.type || "multiple",
            image: q.image,
            answers: {
              create: q.answers.map((a: any) => ({
                text: a.text,
                isCorrect: a.isCorrect,
              })),
            },
          })),
        },
      },
      include: {
        questions: { include: { answers: true } },
      },
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
