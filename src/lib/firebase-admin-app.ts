import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { resolveServiceAccount } from "@/lib/load-service-account";

const GLOBAL_APP_KEY = "__quiztime_firebase_admin_app__";

type GlobalWithAdmin = typeof globalThis & {
  [GLOBAL_APP_KEY]?: App;
};

export class FirebaseAdminCredentialsError extends Error {
  constructor() {
    super(
      "Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_KEY or add serviceAccount.json to the project root."
    );
    this.name = "FirebaseAdminCredentialsError";
  }
}

/** Initialize Firebase Admin once per process (survives Next.js dev hot reload). */
export function getOrInitAdminApp(): App {
  const globalStore = globalThis as GlobalWithAdmin;
  if (globalStore[GLOBAL_APP_KEY]) {
    return globalStore[GLOBAL_APP_KEY];
  }

  const existing = getApps();
  if (existing.length > 0) {
    globalStore[GLOBAL_APP_KEY] = existing[0];
    return existing[0];
  }

  const serviceAccount = resolveServiceAccount();
  if (!serviceAccount) {
    throw new FirebaseAdminCredentialsError();
  }

  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId:
      serviceAccount.project_id ??
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
      undefined,
  });

  globalStore[GLOBAL_APP_KEY] = app;
  return app;
}
