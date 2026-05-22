import { NextRequest } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { getPrisma } from "@/lib/prisma";
import { getAuthenticatedUid } from "@/lib/server-auth";

/** Resolves Prisma user id from Firebase token — for API routes only. */
export async function getPrismaUserIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  const uid = await getAuthenticatedUid(request);
  if (!uid) {
    return null;
  }

  try {
    const firebaseUser = await getFirebaseAdminAuth().getUser(uid);
    if (!firebaseUser.email) {
      return null;
    }

    const prismaUser = await getPrisma().user.findUnique({
      where: { email: firebaseUser.email },
      select: { id: true },
    });

    return prismaUser?.id ?? null;
  } catch {
    return null;
  }
}
