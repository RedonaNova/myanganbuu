"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { deleteImage } from "@/lib/images";
import { notifyAdmin } from "@/lib/push";
import type { SettingKey } from "@/lib/settings";
import { adminSettings as t } from "@/messages/mn";

export type SettingsState = { ok?: boolean; error?: string };

async function put(key: SettingKey, value: string) {
  await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
}

const url = z.union([z.literal(""), z.url().max(500)]);

export async function saveSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireAdmin();
  const parsed = z
    .object({
      facebookUrl: url,
      messengerUrl: url,
      viberNumber: z.string().trim().max(20),
      heroProjectId: z.string().regex(/^\d*$/),
    })
    .safeParse({
      facebookUrl: String(formData.get("facebookUrl") ?? "").trim(),
      messengerUrl: String(formData.get("messengerUrl") ?? "").trim(),
      viberNumber: String(formData.get("viberNumber") ?? "").replace(/[^\d+]/g, ""),
      heroProjectId: String(formData.get("heroProjectId") ?? ""),
    });
  if (!parsed.success) return { error: "invalid" };
  for (const [key, value] of Object.entries(parsed.data)) await put(key as SettingKey, value);
  updateTag("settings");
  return { ok: true };
}

export async function savePushSubscription(sub: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  await requireAdmin();
  const data = z
    .object({ endpoint: z.url().max(512), keys: z.object({ p256dh: z.string().max(255), auth: z.string().max(255) }) })
    .parse(sub);
  await db.pushSubscription.upsert({
    where: { endpoint: data.endpoint },
    create: { endpoint: data.endpoint, p256dh: data.keys.p256dh, auth: data.keys.auth },
    update: { p256dh: data.keys.p256dh, auth: data.keys.auth },
  });
}

export async function sendTestPush() {
  await requireAdmin();
  await notifyAdmin({ title: t.pushTestTitle, body: t.pushTestBody, url: "/admin/settings" });
}

export async function deleteSampleProjects() {
  await requireAdmin();
  const samples = await db.project.findMany({ where: { isSample: true }, include: { photos: true } });
  for (const p of samples) {
    await db.project.delete({ where: { id: p.id } });
    await Promise.all(p.photos.map((ph) => deleteImage("public", ph.storageKey)));
  }
  updateTag("projects");
}
