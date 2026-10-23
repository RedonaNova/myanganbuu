import "server-only";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// The driver's defaults are a pool of 10 connections, all opened up front and
// kept. Next.js loads this module separately for pages, cached functions and
// image routes, so each copy used to open its own 10 and together they hit the
// database user's connection limit. Routes that started last then waited 10
// seconds for a connection and failed (blank social previews, slow uploads).
// Now every copy shares one small pool and connections are opened on demand.
const POOL = { connectionLimit: "5", minimumIdle: "1", idleTimeout: "120" };

function withPoolSettings(url: string) {
  const [base, query = ""] = url.split("?");
  const params = new URLSearchParams(query);
  for (const [key, value] of Object.entries(POOL)) if (!params.has(key)) params.set(key, value);
  return `${base}?${params}`;
}

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({ adapter: new PrismaMariaDb(withPoolSettings(url)) });
}

// One client per process, in production too (not only across dev hot reloads).
export const db = (globalForPrisma.prisma ??= createClient());
