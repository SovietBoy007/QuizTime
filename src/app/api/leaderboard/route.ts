import { NextRequest, NextResponse } from "next/server";
import { adminFetchLeaderboard } from "@/lib/quiz-firestore-server";
import type { LeaderboardXpFilter } from "@/lib/gamification";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseLimit(value: string | null): number {
  const parsed = parseInt(value ?? "10", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 10;
  return Math.min(parsed, 100);
}

function parseXpFilter(value: string | null): LeaderboardXpFilter {
  if (value === "primar" || value === "gimnazial" || value === "liceu") {
    return value;
  }
  return "total";
}

export async function GET(request: NextRequest) {
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));
  const xpFilter = parseXpFilter(request.nextUrl.searchParams.get("xpFilter"));

  try {
    const leaderboard = await adminFetchLeaderboard(limit, xpFilter);
    console.log(
      `[Leaderboard] Returning ${leaderboard.length} entries (filter: ${xpFilter}, limit: ${limit})`
    );
    return NextResponse.json(leaderboard, { status: 200 });
  } catch (error) {
    console.error("[Leaderboard] Failed to fetch leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}
