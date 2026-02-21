import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("CRITICAL ERROR: DATABASE_URL is not set in process.env!");
} else {
    // Log redacted version for diagnostics
    const redacted = connectionString.replace(/:([^@]+)@/, ":****@");
    console.log(`Verified DATABASE_URL in prisma.ts: ${redacted.substring(0, 30)}...`);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
