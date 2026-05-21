import type { QuizResult } from "@/types/quiz";

export type TopicProgress = {
  topic: string;
  averageScore: number;
  attempts: number;
};

export type DashboardStats = {
  averageScore: number;
  totalQuizzes: number;
  recentResults: QuizResult[];
  topicProgress: TopicProgress[];
  weakestTopic: TopicProgress | null;
};

export function resultPercentage(result: QuizResult): number {
  if (result.totalQuestions <= 0) return 0;
  return Math.round((result.score / result.totalQuestions) * 100);
}

function sortByNewest(results: QuizResult[]): QuizResult[] {
  return [...results].sort((a, b) => {
    const aTime = a.createdAt?.getTime() ?? 0;
    const bTime = b.createdAt?.getTime() ?? 0;
    return bTime - aTime;
  });
}

export function computeDashboardStats(results: QuizResult[]): DashboardStats {
  const totalQuizzes = results.length;

  if (totalQuizzes === 0) {
    return {
      averageScore: 0,
      totalQuizzes: 0,
      recentResults: [],
      topicProgress: [],
      weakestTopic: null,
    };
  }

  const percentages = results.map(resultPercentage);
  const averageScore = Math.round(
    percentages.reduce((sum, value) => sum + value, 0) / percentages.length
  );

  const byTopic = new Map<string, number[]>();
  for (const result of results) {
    const topic = result.topic || "general";
    const bucket = byTopic.get(topic) ?? [];
    bucket.push(resultPercentage(result));
    byTopic.set(topic, bucket);
  }

  const topicProgress: TopicProgress[] = [...byTopic.entries()]
    .map(([topic, scores]) => ({
      topic,
      averageScore: Math.round(
        scores.reduce((sum, value) => sum + value, 0) / scores.length
      ),
      attempts: scores.length,
    }))
    .sort((a, b) => b.averageScore - a.averageScore);

  const weakestTopic =
    topicProgress.length > 0
      ? topicProgress.reduce((weakest, current) =>
          current.averageScore < weakest.averageScore ? current : weakest
        )
      : null;

  return {
    averageScore,
    totalQuizzes,
    recentResults: sortByNewest(results).slice(0, 5),
    topicProgress,
    weakestTopic,
  };
}
