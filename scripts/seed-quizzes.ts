/**
 * Regenerates the full quiz dataset in Firestore from src/data/quizzes.
 * Usage: npm run seed:quizzes
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY in environment or .env.local
 */

import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  SAMPLE_QUIZZES,
  QUIZ_TOPIC_IDS,
  LEGACY_QUIZ_IDS,
} from "../src/data/sample-quizzes";
import { validateQuizBank } from "../src/data/quizzes/validate";

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  }
  try {
    const env = readFileSync(".env.local", "utf8");
    const match = env.match(/FIREBASE_SERVICE_ACCOUNT_KEY='([^']+)'/);
    if (match) return JSON.parse(match[1]);
  } catch {
    /* ignore */
  }
  throw new Error("Set FIREBASE_SERVICE_ACCOUNT_KEY to run this script.");
}

validateQuizBank(SAMPLE_QUIZZES);

const serviceAccount = loadServiceAccount();
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const idsToRemove = [...new Set([...QUIZ_TOPIC_IDS, ...LEGACY_QUIZ_IDS])];

console.log(`Removing ${idsToRemove.length} quiz document(s)...`);
for (const id of idsToRemove) {
  await db.collection("quizzes").doc(id).delete();
}

console.log(`Seeding ${SAMPLE_QUIZZES.length} quiz topic(s)...`);
for (const quiz of SAMPLE_QUIZZES) {
  const { id, ...data } = quiz;
  await db.collection("quizzes").doc(id).set(data);
  const byLevel = {
    primar: quiz.questions.filter((q) => q.level === "primar").length,
    gimnazial: quiz.questions.filter((q) => q.level === "gimnazial").length,
    liceu: quiz.questions.filter((q) => q.level === "liceu").length,
  };
  console.log(
    `  ${id}: ${quiz.questions.length} întrebări (primar ${byLevel.primar}, gimnazial ${byLevel.gimnazial}, liceu ${byLevel.liceu})`
  );
}

const total = SAMPLE_QUIZZES.reduce((n, q) => n + q.questions.length, 0);
console.log(`Done. ${total} întrebări în ${SAMPLE_QUIZZES.length} subiecte.`);
