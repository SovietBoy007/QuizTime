import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

function initAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(serviceAccountKey) as Record<string, string>;
    return initializeApp({
      credential: cert(serviceAccount),
    });
  }

  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "quiztime-b875d",
  });
}

export function getFirebaseAdminAuth(): Auth {
  return getAuth(initAdminApp());
}
