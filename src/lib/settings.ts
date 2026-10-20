import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";

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
