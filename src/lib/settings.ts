import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { SERVICE_SLUGS, isServiceSlug, type ServiceSlug } from "@/lib/catalog";

// Editable from Admin > Тохиргоо. Defaults apply until he changes them.
export const SETTING_DEFAULTS = {
  facebookUrl: "https://www.facebook.com/mb.tseren.5",
  // International format without spaces, e.g. +97699112233.
  viberNumber: "",
  // Instagram handle (@name) or profile URL; the button shows only when set.
  instagram: "",
  heroProjectId: "",
  // Comma-separated project ids, in display order (max 4).
  featuredProjectIds: "",
  // «Юу хийдэг вэ»: JSON list of { slug, photoId, hidden } in his order.
  // photoId is any photo he uploaded (null: the newest work's cover);
  // hidden types are left out of the home page, chips, services page and footer.
  showcase: "",
  aboutHeadline: "",
  aboutBio: "",
  // JSON list of { value, label }, e.g. [{"value":"15","label":"жил туршлага"}].
  aboutStats: "",
};

export type Settings = typeof SETTING_DEFAULTS;
export type SettingKey = keyof Settings;

export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  const rows = await db.setting.findMany();
  const values = { ...SETTING_DEFAULTS };
  for (const row of rows) {
    if (row.key in values) values[row.key as SettingKey] = row.value;
  }
  return values;
}

export function instagramLink(s: Settings) {
  const v = s.instagram.trim();
  if (!v) return null;
  if (/^https?:\/\//.test(v)) return v;
  const handle = v
    .replace(/^@/, "")
    .replace(/^(www\.)?instagram\.com\//, "")
    .replace(/\/+$/, "");
  return handle ? `https://www.instagram.com/${handle}/` : null;
}

export function viberLink(s: Settings) {
  if (!s.viberNumber) return null;
  return `viber://chat?number=${encodeURIComponent(s.viberNumber.replace(/\s+/g, ""))}`;
}

/** Featured project ids in his chosen order. */
export function featuredIds(s: Settings): number[] {
  return s.featuredProjectIds
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 4);
}

export type AboutStat = { value: string; label: string };

/** His own about-page numbers, in his order (max 4). */
export function aboutStats(s: Settings): AboutStat[] {
  try {
    const parsed = JSON.parse(s.aboutStats || "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is AboutStat => typeof x?.value === "string" && typeof x?.label === "string" && !!x.value.trim())
      .slice(0, 4);
  } catch {
    return [];
  }
}

export type ShowcaseItem = { slug: ServiceSlug; photoId: number | null; hidden: boolean };

/** Shown by default, in this order. The other types start hidden until he turns them on. */
export const DEFAULT_SHOWCASE: readonly ServiceSlug[] = ["siding", "renovation", "tv-wall", "bathroom", "electrical"];

/** Every work type in his order with his picked photo and whether it is hidden from the site. */
export function showcaseOrder(s: Settings): ShowcaseItem[] {
  let saved: unknown = [];
  try {
    saved = JSON.parse(s.showcase || "[]");
  } catch {
    // Unreadable value: fall back to the default order.
  }
  const items: ShowcaseItem[] = [];
  for (const x of Array.isArray(saved) ? saved : []) {
    if (!x || typeof x.slug !== "string" || !isServiceSlug(x.slug) || items.some((i) => i.slug === x.slug)) continue;
    items.push({ slug: x.slug, photoId: Number.isInteger(x.photoId) && x.photoId > 0 ? x.photoId : null, hidden: x.hidden === true });
  }
  // Types he has not placed yet: the default five first, then the rest hidden.
  for (const slug of [...DEFAULT_SHOWCASE, ...SERVICE_SLUGS]) {
    if (!items.some((i) => i.slug === slug)) items.push({ slug, photoId: null, hidden: !DEFAULT_SHOWCASE.includes(slug) });
  }
  return items;
}
