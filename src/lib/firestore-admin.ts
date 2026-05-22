import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getOrInitAdminApp } from "@/lib/firebase-admin-app";

/** Admin Firestore for API routes and server-only code. */
export function getAdminFirestore(): Firestore {
  return getFirestore(getOrInitAdminApp());
}
