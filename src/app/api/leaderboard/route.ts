import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const quizId = searchParams.get("quizId");
    const limit = parseInt(searchParams.get("limit") || "100");

    let where: any = {};
    if (quizId) {
      where.quizId = quizId;
    }

    // Get top scores with user info
    const leaderboard = await prisma.score.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        quiz: { select: { id: true, title: true } },
      },
      orderBy: [
        { percentage: "desc" },
        { completedAt: "desc" },
      ],
      take: limit,
    });

    return NextResponse.json(leaderboard, { status: 200 });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
