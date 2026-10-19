// Prisma client for CLI scripts (src/lib/db.ts is server-only and can't be
// imported outside Next.js).
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../src/generated/prisma/client";

export function createPrisma() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set (.env)");
  return new PrismaClient({ adapter: new PrismaMariaDb(url) });
}
