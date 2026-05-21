import { FirebaseError } from "firebase/app";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Invalid email or password. Please try again.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/operation-not-allowed": "Email/password sign-in is not enabled.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/missing-password": "Please enter your password.",
  "auth/invalid-login-credentials": "Invalid email or password. Please try again.",
};

export function getFirebaseAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError && error.code in AUTH_ERROR_MESSAGES) {
    return AUTH_ERROR_MESSAGES[error.code];
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
