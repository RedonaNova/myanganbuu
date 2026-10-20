// Fixed vocabularies shared by admin and public pages. Labels live in
// src/messages/mn.ts; these are the stable keys stored in the database.

export const SERVICE_SLUGS = [
  "siding",
  "renovation",
  "bathroom",
  "tv-wall",
  "furniture",
  "electrical",
  "stretch-ceiling",
] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export const ROOMS = ["KITCHEN", "BATHROOM", "LIVING", "BEDROOM", "FACADE", "OTHER"] as const;
export type RoomKey = (typeof ROOMS)[number];

export function isServiceSlug(v: string): v is ServiceSlug {
  return (SERVICE_SLUGS as readonly string[]).includes(v);
}

export function isRoom(v: string): v is RoomKey {
  return (ROOMS as readonly string[]).includes(v);
}
