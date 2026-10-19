import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";

// Editable from Admin > Тохиргоо. Defaults apply until he changes them.
export const SETTING_DEFAULTS = {
  facebookUrl: "https://www.facebook.com/mb.tseren.5",
  // Messenger chat link; derived from the profile when left empty.
  messengerUrl: "",
  // International format without spaces, e.g. +97699112233.
  viberNumber: "",
  heroProjectId: "",
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

/** m.me link opens the Messenger app directly on phones. */
export function messengerLink(s: Settings) {
  if (s.messengerUrl) return s.messengerUrl;
  const handle = s.facebookUrl.replace(/\/+$/, "").split("/").pop();
  return handle ? `https://m.me/${handle}` : s.facebookUrl;
}

export function viberLink(s: Settings) {
  if (!s.viberNumber) return null;
  return `viber://chat?number=${encodeURIComponent(s.viberNumber.replace(/\s+/g, ""))}`;
}
