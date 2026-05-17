// Use runtime import for Prisma client to avoid package version type mismatches.
declare const require: any;
const { PrismaClient } = require("@prisma/client");

const globalForPrisma = global as unknown as { prisma: any };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
