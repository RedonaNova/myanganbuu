"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hash, verify } from "@node-rs/argon2";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { admin as t } from "@/messages/mn";

export type LoginState = { error?: string };

const schema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(256),
});

// Verified against when the username doesn't exist, so response timing does
// not reveal which usernames are valid.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hash("not-a-real-password"));

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: t.login.invalid };

  const ip = clientIp(await headers());
  const key = `login:${ip}`;
  if (!(await rateLimit(key, 8, 15 * 60 * 1000))) return { error: t.login.tooMany };

  const user = await db.adminUser.findUnique({ where: { username: parsed.data.username } });
  const ok = await verify(user?.passwordHash ?? (await getDummyHash()), parsed.data.password).catch(
    () => false,
  );
  if (!user || !ok) return { error: t.login.invalid };

  await resetRateLimit(key);
  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
