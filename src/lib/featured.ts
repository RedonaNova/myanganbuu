import "server-only";
import { db } from "@/lib/db";
import { SETTING_DEFAULTS, featuredIds, type SettingKey } from "@/lib/settings";

export async function putSetting(key: SettingKey, value: string) {
  await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
}

/**
 * Adds or removes a project from his ordered highlight list (max 4), used
 * when he flips "Нүүр хуудсанд гаргах" on a project. Caller invalidates tags.
 */
export async function setFeatured(projectId: number, on: boolean) {
  // Read the row directly: getSettings() is cached and may lag a previous edit.
  const row = await db.setting.findUnique({ where: { key: "featuredProjectIds" } });
  const ids = featuredIds({ ...SETTING_DEFAULTS, featuredProjectIds: row?.value ?? "" }).filter((id) => id !== projectId);
  if (on && ids.length < 4) ids.push(projectId);
  await putSetting("featuredProjectIds", ids.join(","));
  await db.project.update({ where: { id: projectId }, data: { featured: on && ids.includes(projectId) } });
}
