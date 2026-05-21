import { NextRequest, NextResponse } from "next/server";
import { getPrismaUserIdFromRequest } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

// POST submit quiz answers and save score
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
    const { quizId, answers, timeSpent } = body;

    if (!quizId || !answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the quiz and its questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { answers: { where: { isCorrect: true } } },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Calculate score
    let correctCount = 0;
    const userAnswers: any[] = [];

    for (const question of quiz.questions) {
      const userAnswer = answers[question.id];
      const correctAnswerId = question.answers[0]?.id;
      const isCorrect = userAnswer === correctAnswerId;

      if (isCorrect) correctCount++;

      userAnswers.push({
        questionId: question.id,
        selectedAnswerId: userAnswer,
        isCorrect,
      });
    }

    const percentage = (correctCount / quiz.questions.length) * 100;

    // Create score record
    const score = await prisma.score.create({
      data: {
        userId,
        quizId,
        points: correctCount,
        totalQuestions: quiz.questions.length,
        percentage,
        timeSpent: timeSpent || 0,
        userAnswers: {
          create: userAnswers,
        },
      },
      include: {
        userAnswers: true,
      },
    });

    return NextResponse.json(score, { status: 201 });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}

// GET user scores
export async function GET(request: NextRequest) {
  try {
    const userId = await getPrismaUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const scores = await prisma.score.findMany({
      where: { userId },
      include: {
        quiz: { select: { id: true, title: true, category: true } },
      },
      orderBy: { completedAt: "desc" },
    });

    return NextResponse.json(scores, { status: 200 });
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}
