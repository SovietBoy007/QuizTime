import { NextRequest, NextResponse } from "next/server";
import {
  aggregateTotalScoresByUser,
  readCategoryXp,
  xpForFilter,
  type LeaderboardEntry,
  type LeaderboardXpFilter,
} from "@/lib/gamification";

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

async function fetchLeaderboardFromFirestore(
  limit: number,
  xpFilter: LeaderboardXpFilter
): Promise<LeaderboardEntry[]> {
  const { cert, getApps, initializeApp } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  const existingApps = getApps();
  const app =
    existingApps.length > 0
      ? existingApps[0]
      : (() => {
          const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
          if (serviceAccountKey) {
            const serviceAccount = JSON.parse(serviceAccountKey) as Record<
              string,
              string
            >;
            return initializeApp({ credential: cert(serviceAccount) });
          }
          return initializeApp({
            projectId:
              process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "quiztime-b875d",
          });
        })();

  const db = getFirestore(app);
  const resultsSnapshot = await db.collection("results").get();

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

export async function GET(request: NextRequest) {
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));
  const xpFilter = parseXpFilter(request.nextUrl.searchParams.get("xpFilter"));

  try {
    const leaderboard = await fetchLeaderboardFromFirestore(limit, xpFilter);
    return NextResponse.json(leaderboard, { status: 200 });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json([], { status: 200 });
  }
}
