import { getAuth, type Auth } from "firebase-admin/auth";
import { getOrInitAdminApp } from "@/lib/firebase-admin-app";

export function getFirebaseAdminAuth(): Auth {
  return getAuth(getOrInitAdminApp());
}
