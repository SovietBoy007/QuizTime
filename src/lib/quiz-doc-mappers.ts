import { isSchoolLevel } from "@/lib/gamification";
import type { Quiz } from "@/types/quiz";

type RawDoc = Record<string, unknown>;

export function mapResultDoc(
  id: string,
  data: RawDoc,
  createdAt?: { toDate?: () => Date } | null
): {
  id: string;
  userId: string;
  score: number;
  totalQuestions: number;
  topic: string;
  level: "primar" | "gimnazial" | "liceu";
  createdAt: Date | null;
} {
  return {
    id,
    userId: typeof data.userId === "string" ? data.userId : "",
    score: typeof data.score === "number" ? data.score : 0,
    totalQuestions:
      typeof data.totalQuestions === "number" ? data.totalQuestions : 0,
    topic: typeof data.topic === "string" ? data.topic : "general",
    level: isSchoolLevel(data.level) ? data.level : "gimnazial",
    createdAt: createdAt?.toDate?.() ?? null,
  };
}

function normalizeQuestion(
  raw: RawDoc,
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
    id: typeof raw.id === "string" ? raw.id : `q-${index}`,
    level: validLevel,
    topic,
    question: String(raw.question),
    answers: raw.answers as Quiz["questions"][number]["answers"],
    correctAnswerId: String(raw.correctAnswerId),
    explanation:
      typeof raw.explanation === "string" ? raw.explanation : "",
  };
}

/** Builds one quiz from a topic-named collection where each doc may be a question. */
export function mapTopicCollectionToQuiz(
  collectionId: string,
  docs: { id: string; data: () => RawDoc }[]
): Quiz | null {
  if (docs.length === 0) return null;

  for (const doc of docs) {
    const asQuiz = mapQuizDoc(collectionId, doc.data());
    if (asQuiz) {
      return {
        ...asQuiz,
        id: collectionId,
        category: asQuiz.category || collectionId,
      };
    }
  }

  const category = collectionId;
  const questions = docs
    .map((doc, index) => normalizeQuestion(doc.data(), index, category))
    .filter((q): q is Quiz["questions"][number] => q !== null);

  if (questions.length === 0) return null;

  const first = docs[0]?.data() ?? {};
  return {
    id: collectionId,
    title:
      typeof first.title === "string"
        ? first.title
        : collectionId.replace(/-/g, " "),
    description:
      typeof first.description === "string" ? first.description : "",
    category,
    questions,
  };
}

export function mapQuizDoc(id: string, data: RawDoc): Quiz | null {
  const rawQuestions = data.questions;
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    return null;
  }

  const category =
    typeof data.category === "string" ? data.category : "general";

  const questions = rawQuestions
    .map((item, index) =>
      normalizeQuestion(item as RawDoc, index, category)
    )
    .filter((q): q is Quiz["questions"][number] => q !== null);

  if (questions.length === 0) {
    return null;
  }

  return {
    id,
    title: typeof data.title === "string" ? data.title : "Quiz fără titlu",
    description: typeof data.description === "string" ? data.description : "",
    category,
    questions,
  };
}
