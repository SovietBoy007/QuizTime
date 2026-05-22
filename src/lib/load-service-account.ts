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
      return JSON.parse(fromEnv) as Record<string, string>;
    } catch {
      return null;
    }
  }

  return loadServiceAccountFromFile();
}
