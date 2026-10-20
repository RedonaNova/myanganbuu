"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { deleteImage } from "@/lib/images";
import { notifyAdmin } from "@/lib/push";
import { putSetting } from "@/lib/featured";
import type { SettingKey } from "@/lib/settings";
import { adminSettings as t } from "@/messages/mn";

export type SettingsState = { ok?: boolean; error?: string };

const url = z.union([z.literal(""), z.url().max(500)]);

export async function saveSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireAdmin();
  const parsed = z
    .object({ facebookUrl: url, messengerUrl: url, viberNumber: z.string().trim().max(20) })
    .safeParse({
      facebookUrl: String(formData.get("facebookUrl") ?? "").trim(),
      messengerUrl: String(formData.get("messengerUrl") ?? "").trim(),
      viberNumber: String(formData.get("viberNumber") ?? "").replace(/[^\d+]/g, ""),
    });
  if (!parsed.success) return { error: "invalid" };
  for (const [key, value] of Object.entries(parsed.data)) await putSetting(key as SettingKey, value);
  updateTag("settings");
  return { ok: true };
}

// ─── Home page ───────────────────────────────────────────────────────────

export async function saveHome(input: { availability: string; heroProjectId: string; featured: number[] }) {
  await requireAdmin();
  const d = z
    .object({
      availability: z.string().trim().max(80),
      heroProjectId: z.string().regex(/^\d*$/),
      featured: z.array(z.number().int().positive()).max(4),
    })
    .parse(input);
  await putSetting("availability", d.availability);
  await putSetting("heroProjectId", d.heroProjectId);
  await putSetting("featuredProjectIds", d.featured.join(","));
  // Keep the per-project flag in step, so the project screen shows it too.
  await db.project.updateMany({ data: { featured: false } });
  if (d.featured.length) await db.project.updateMany({ where: { id: { in: d.featured } }, data: { featured: true } });
  updateTag("settings");
  updateTag("projects");
}

// ─── About page ──────────────────────────────────────────────────────────

export async function saveAbout(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireAdmin();
  const parsed = z
    .object({
      aboutHeadline: z.string().trim().max(120),
      aboutBio: z.string().trim().max(4000),
      aboutYears: z.string().regex(/^\d{0,2}$/),
    })
    .safeParse({
      aboutHeadline: formData.get("aboutHeadline") ?? "",
      aboutBio: formData.get("aboutBio") ?? "",
      aboutYears: String(formData.get("aboutYears") ?? "").trim(),
    });
  if (!parsed.success) return { error: "invalid" };
  for (const [key, value] of Object.entries(parsed.data)) await putSetting(key as SettingKey, value);
  updateTag("settings");
  updateTag("about");
  return { ok: true };
}

export async function updateSitePhoto(id: number, input: { alt: string; caption: string }) {
  await requireAdmin();
  const d = z.object({ alt: z.string().trim().max(250), caption: z.string().trim().max(250) }).parse(input);
  await db.sitePhoto.update({ where: { id }, data: d });
  updateTag("about");
}

export async function deleteSitePhoto(id: number) {
  await requireAdmin();
  const photo = await db.sitePhoto.delete({ where: { id } });
  await deleteImage("public", photo.storageKey);
  updateTag("about");
}

/** Saves the order; the first photo is the portrait at the top of the page. */
export async function reorderSitePhotos(ids: number[]) {
  await requireAdmin();
  await db.$transaction(ids.map((id, i) => db.sitePhoto.update({ where: { id }, data: { sortOrder: i } })));
  updateTag("about");
}

// ─── Notifications ───────────────────────────────────────────────────────

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
