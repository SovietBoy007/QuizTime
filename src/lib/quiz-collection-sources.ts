import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import type { Firestore } from "firebase-admin/firestore";
import { db } from "@/lib/firebase";
import { SAMPLE_QUIZZES, QUIZ_TOPIC_IDS } from "@/data/sample-quizzes";
import { mapQuizDoc, mapTopicCollectionToQuiz } from "@/lib/quiz-doc-mappers";
import type { Quiz } from "@/types/quiz";

/** Primary path used by seed script: quizzes/{topicId} e.g. quizzes/geografie */
export const PRIMARY_QUIZ_COLLECTION = "quizzes";

/** Alternate collection names seen in older setups */
export const QUIZ_COLLECTION_CANDIDATES = [
  PRIMARY_QUIZ_COLLECTION,
  "quiz",
  "sample-quizzes",
] as const;

/** Topic ids that may exist as top-level collections (geografie, stiinte, …) */
export const QUIZ_TOPIC_COLLECTION_IDS = [...QUIZ_TOPIC_IDS] as const;

export type QuizCatalogSource =
  | typeof PRIMARY_QUIZ_COLLECTION
  | "quiz"
  | "sample-quizzes"
  | "topic-collection"
  | "bundled-fallback";

export type QuizCatalog = {
  quizzes: Quiz[];
  source: QuizCatalogSource;
  /** True if any Firestore path returned at least one valid quiz */
  firestoreHadQuizzes: boolean;
};

type RawDoc = Record<string, unknown>;

function mergeUniqueQuizzes(existing: Quiz[], incoming: Quiz[]): Quiz[] {
  const byId = new Map(existing.map((q) => [q.id, q]));
  for (const quiz of incoming) {
    if (!byId.has(quiz.id)) byId.set(quiz.id, quiz);
  }
  return [...byId.values()];
}

function mapDocsFromNamedCollection(
  collectionName: string,
  docs: { id: string; data: () => RawDoc }[]
): Quiz[] {
  const mapped = docs
    .map((d) => mapQuizDoc(d.id, d.data()))
    .filter((q): q is Quiz => q !== null);

  if (mapped.length > 0) return mapped;

  const topicQuiz = mapTopicCollectionToQuiz(collectionName, docs);
  return topicQuiz ? [topicQuiz] : [];
}

// —— Client (Firebase JS SDK) ——

async function loadFromNamedCollectionClient(
  collectionName: string
): Promise<Quiz[]> {
  const snapshot = await getDocs(collection(db, collectionName));
  return mapDocsFromNamedCollection(
    collectionName,
    snapshot.docs.map((d) => ({ id: d.id, data: () => d.data() }))
  );
}

async function loadFromTopicCollectionsClient(): Promise<Quiz[]> {
  const results = await Promise.all(
    QUIZ_TOPIC_COLLECTION_IDS.map((topicId) =>
      loadFromNamedCollectionClient(topicId)
    )
  );
  return results.flat();
}

export async function loadQuizCatalogClient(): Promise<QuizCatalog> {
  let quizzes: Quiz[] = [];
  let source: QuizCatalogSource = PRIMARY_QUIZ_COLLECTION;

  for (const name of QUIZ_COLLECTION_CANDIDATES) {
    const fromCollection = await loadFromNamedCollectionClient(name);
    if (fromCollection.length > 0) {
      quizzes = mergeUniqueQuizzes(quizzes, fromCollection);
      source = name;
    }
  }

  const fromTopics = await loadFromTopicCollectionsClient();
  if (fromTopics.length > 0) {
    quizzes = mergeUniqueQuizzes(quizzes, fromTopics);
    if (quizzes.length === fromTopics.length) {
      source = "topic-collection";
    }
  }

  const firestoreHadQuizzes = quizzes.length > 0;

  if (quizzes.length === 0) {
    return {
      quizzes: [...SAMPLE_QUIZZES],
      source: "bundled-fallback",
      firestoreHadQuizzes: false,
    };
  }

  return { quizzes, source, firestoreHadQuizzes };
}

export async function fetchQuizByIdFromSourcesClient(
  quizId: string
): Promise<Quiz | null> {
  for (const name of QUIZ_COLLECTION_CANDIDATES) {
    try {
      const snapshot = await getDoc(doc(db, name, quizId));
      if (snapshot.exists()) {
        const quiz = mapQuizDoc(snapshot.id, snapshot.data());
        if (quiz) return quiz;
      }
    } catch {
      /* try next path */
    }
  }

  try {
    const topicSnap = await getDocs(collection(db, quizId));
    if (!topicSnap.empty) {
      const fromTopic = mapTopicCollectionToQuiz(
        quizId,
        topicSnap.docs.map((d) => ({ id: d.id, data: () => d.data() }))
      );
      if (fromTopic) return fromTopic;
    }
  } catch {
    /* ignore */
  }

  return SAMPLE_QUIZZES.find((q) => q.id === quizId) ?? null;
}

// —— Server (Firebase Admin) ——

async function loadFromNamedCollectionAdmin(
  firestore: Firestore,
  collectionName: string
): Promise<Quiz[]> {
  const snapshot = await firestore.collection(collectionName).get();
  return mapDocsFromNamedCollection(
    collectionName,
    snapshot.docs.map((d) => ({ id: d.id, data: () => d.data() }))
  );
}

async function loadFromTopicCollectionsAdmin(
  firestore: Firestore
): Promise<Quiz[]> {
  const results = await Promise.all(
    QUIZ_TOPIC_COLLECTION_IDS.map((topicId) =>
      loadFromNamedCollectionAdmin(firestore, topicId)
    )
  );
  return results.flat();
}

export async function loadQuizCatalogAdmin(
  firestore: Firestore
): Promise<QuizCatalog> {
  let quizzes: Quiz[] = [];
  let source: QuizCatalogSource = PRIMARY_QUIZ_COLLECTION;

  for (const name of QUIZ_COLLECTION_CANDIDATES) {
    const fromCollection = await loadFromNamedCollectionAdmin(
      firestore,
      name
    );
    console.log(
      `[QuizCatalog] Firestore collection "${name}": ${fromCollection.length} quiz(zes) found`
    );
    if (fromCollection.length > 0) {
      quizzes = mergeUniqueQuizzes(quizzes, fromCollection);
      source = name;
    }
  }

  const fromTopics = await loadFromTopicCollectionsAdmin(firestore);
  if (fromTopics.length > 0) {
    quizzes = mergeUniqueQuizzes(quizzes, fromTopics);
    if (quizzes.length === fromTopics.length) {
      source = "topic-collection";
    }
  }

  const firestoreHadQuizzes = quizzes.length > 0;

  if (quizzes.length === 0) {
    console.error(
      "[QuizCatalog] CRITICAL: All Firestore collections returned 0 quizzes. " +
        "Falling back to bundled data. Run `npm run seed:quizzes` to populate Firestore."
    );
    return {
      quizzes: [...SAMPLE_QUIZZES],
      source: "bundled-fallback",
      firestoreHadQuizzes: false,
    };
  }

  console.log(
    `[QuizCatalog] Loaded ${quizzes.length} quiz(zes) from source "${source}"`
  );
  return { quizzes, source, firestoreHadQuizzes };
}

export async function fetchQuizByIdFromSourcesAdmin(
  firestore: Firestore,
  quizId: string
): Promise<Quiz | null> {
  for (const name of QUIZ_COLLECTION_CANDIDATES) {
    const snapshot = await firestore.collection(name).doc(quizId).get();
    if (snapshot.exists) {
      const quiz = mapQuizDoc(snapshot.id, snapshot.data() ?? {});
      if (quiz) return quiz;
    }
  }

  const topicSnap = await firestore.collection(quizId).get();
  if (!topicSnap.empty) {
    const fromTopic = mapTopicCollectionToQuiz(
      quizId,
      topicSnap.docs.map((d) => ({ id: d.id, data: () => d.data() }))
    );
    if (fromTopic) return fromTopic;
  }

  return SAMPLE_QUIZZES.find((q) => q.id === quizId) ?? null;
}
