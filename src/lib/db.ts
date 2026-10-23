import "server-only";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Pool settings. The driver defaults to 10 connections per client, all opened
// up front, and gives up on any new connection after 1 second. Next.js loads
// this module separately for pages, cached functions and image routes, so each
// copy opened its own 10, and on a busy small server a connection that took
// longer than 1 second to open failed and was retried until the pool's own
// 10 second limit ran out (blank social previews, failed uploads, failed builds).
// Now every copy shares one small pool, and a new connection may take up to 8s.
//
// `next build` prerenders in several worker processes while the live site
// still runs on the same server, so the build keeps a smaller share.
const building = process.env.NEXT_PHASE === "phase-production-build";
const POOL = {
  connectionLimit: building ? "3" : "5",
  minimumIdle: "1",
  idleTimeout: "300",
  connectTimeout: "8000",
};

function withPoolSettings(url: string) {
  try {
    // Same parser the adapter uses, so odd characters in the password survive.
    const parsed = new URL(url);
    for (const [key, value] of Object.entries(POOL)) if (!parsed.searchParams.has(key)) parsed.searchParams.set(key, value);
    return parsed.toString();
  } catch {
    return url;
  }
}

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({ adapter: new PrismaMariaDb(withPoolSettings(url)) });
}

// One client per process, in production too (not only across dev hot reloads).
export const db = (globalForPrisma.prisma ??= createClient());
