import { NextRequest } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";

export async function getAuthenticatedUid(
  request: NextRequest
): Promise<string | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice(7);

  try {
    const decoded = await getFirebaseAdminAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}
