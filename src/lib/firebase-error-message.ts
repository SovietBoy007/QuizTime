import { FirebaseError } from "firebase/app";

const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  "permission-denied":
    "Acces refuzat la Firestore. Verifică regulile de securitate și autentificarea.",
  "unauthenticated": "Trebuie să fii autentificat pentru această acțiune.",
  "not-found": "Documentul nu a fost găsit.",
  "already-exists": "Datele există deja.",
  "failed-precondition": "Operația nu poate fi efectuată în starea curentă.",
  "resource-exhausted": "Prea multe cereri. Încearcă din nou în câteva secunde.",
  "unavailable": "Firestore este temporar indisponibil.",
  "deadline-exceeded": "Cererea a expirat. Verifică conexiunea și încearcă din nou.",
};

export function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    const localized = FIRESTORE_ERROR_MESSAGES[error.code];
    if (localized) return localized;
    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "A apărut o eroare necunoscută.";
}

export function logFirebaseError(context: string, error: unknown): void {
  if (error instanceof FirebaseError) {
    console.error(`[${context}]`, error.code, error.message);
    return;
  }
  console.error(`[${context}]`, error);
}
