import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// Reuse one client between Vercel serverless invocations in the same process.
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
