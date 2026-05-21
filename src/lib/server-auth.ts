import { NextRequest } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

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

    const prismaUser = await prisma.user.findUnique({
      where: { email: firebaseUser.email },
      select: { id: true },
    });

    return prismaUser?.id ?? null;
  } catch {
    return null;
  }
}
