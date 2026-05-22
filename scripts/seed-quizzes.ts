/**
 * Regenerates the full quiz dataset in Firestore from src/data/quizzes.
 * Usage: npm run seed:quizzes
 * Requires serviceAccount.json in the project root (see serviceAccount.json.example).
 */

import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { cert, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  SAMPLE_QUIZZES,
  QUIZ_TOPIC_IDS,
  LEGACY_QUIZ_IDS,
} from "../src/data/sample-quizzes";
import { validateQuizBank } from "../src/data/quizzes/validate";

const scriptDir =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

const serviceAccountPath = join(scriptDir, "..", "serviceAccount.json");

function loadServiceAccount(): ServiceAccount {
  if (!existsSync(serviceAccountPath)) {
    throw new Error(
      `Missing ${serviceAccountPath}\n` +
        "Copy serviceAccount.json.example to serviceAccount.json, then paste your Firebase service account JSON from:\n" +
        "Firebase Console → Project settings → Service accounts → Generate new private key"
    );
  }

  const raw = readFileSync(serviceAccountPath, "utf8").trim();
  if (!raw) {
    throw new Error(
      `${serviceAccountPath} is empty.\n` +
        "Paste the full JSON from your Firebase service account key file (not FIREBASE_SERVICE_ACCOUNT_KEY — use the .json file contents)."
    );
  }

  try {
    return JSON.parse(raw) as ServiceAccount;
  } catch {
    throw new Error(
      `${serviceAccountPath} is not valid JSON. Re-download the service account key from Firebase and paste the entire file.`
    );
  }
}

async function main() {
  validateQuizBank(SAMPLE_QUIZZES);

  initializeApp({ credential: cert(loadServiceAccount()) });
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
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
