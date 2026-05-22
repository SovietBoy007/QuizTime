import { existsSync, readFileSync } from "fs";
import { join } from "path";

/** Loads Firebase Admin service account from project root (local dev / scripts). */
export function loadServiceAccountFromFile(): Record<string, string> | null {
  const path = join(process.cwd(), "serviceAccount.json");
  if (!existsSync(path)) return null;

  const raw = readFileSync(path, "utf8").trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}

/** Service account from env (Vercel) or serviceAccount.json (local). Never uses ADC. */
export function resolveServiceAccount(): Record<string, string> | null {
  const fromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (fromEnv) {
    try {
      const parsed = JSON.parse(fromEnv) as Record<string, string>;
      console.log(
        "[Firebase Admin] Loaded credentials from FIREBASE_SERVICE_ACCOUNT_KEY env var. project_id:",
        parsed.project_id ?? "(missing)"
      );
      return parsed;
    } catch {
      console.error(
        "[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_KEY is set but failed to parse as JSON."
      );
      return null;
    }
  }

  const fromFile = loadServiceAccountFromFile();
  if (fromFile) {
    console.log(
      "[Firebase Admin] Loaded credentials from serviceAccount.json. project_id:",
      fromFile.project_id ?? "(missing)"
    );
    return fromFile;
  }

  console.error(
    "[Firebase Admin] No credentials found — set FIREBASE_SERVICE_ACCOUNT_KEY env var on Vercel."
  );
  return null;
}
