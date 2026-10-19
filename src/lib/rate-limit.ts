import "server-only";
import { db } from "@/lib/db";

/**
 * Fixed-window rate limiter stored in MySQL so it survives PM2 restarts.
 * Returns true when the action is allowed (and counts it).
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = new Date();
  const windowFloor = new Date(now.getTime() - windowMs);
  const row = await db.rateLimit.findUnique({ where: { key } });

  if (!row || row.windowStart < windowFloor) {
    await db.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
    return true;
  }
  if (row.count >= limit) return false;
  await db.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}

export async function resetRateLimit(key: string) {
  await db.rateLimit.deleteMany({ where: { key } });
}

/** Client IP as reported by the reverse proxy. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
