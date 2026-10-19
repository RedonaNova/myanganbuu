import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "mb_session";
const SESSION_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return createHmac("sha256", secret).update(token).digest("hex");
}

function cookieSecure() {
  return (process.env.SITE_URL ?? "").startsWith("https://");
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  await db.session.create({
    data: { id: hashToken(token), userId, expiresAt: new Date(Date.now() + SESSION_DAYS * DAY) },
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    // The DB row is the real expiry (sliding); the cookie just outlives it.
    maxAge: 400 * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: hashToken(token) } });
  jar.delete(SESSION_COOKIE);
}

/** The signed-in admin, or null. Deduplicated per request. */
export const getAdmin = cache(async () => {
  // Admin data is always per-request; this also opts the DB driver's and our
  // own clock reads out of prerendering.
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const id = hashToken(token);
  const session = await db.session.findUnique({
    where: { id },
    include: { user: { select: { id: true, username: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;

  // Sliding expiry: he should practically never be logged out on his phone.
  if (session.expiresAt.getTime() - Date.now() < (SESSION_DAYS / 2) * DAY) {
    await db.session.update({
      where: { id },
      data: { expiresAt: new Date(Date.now() + SESSION_DAYS * DAY) },
    });
  }
  return session.user;
});

/** Use at the top of every admin page, data function and server action. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
