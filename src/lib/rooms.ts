import { ROOMS, type RoomKey } from "@/lib/catalog";
import { rooms } from "@/messages/mn";

/** A work's rooms in the fixed catalog order. */
export function sortRooms(keys: readonly string[]): RoomKey[] {
  return ROOMS.filter((r) => keys.includes(r));
}

/** "Гал тогоо, Угаалгын өрөө" for cards, previews and alt text. */
export function roomNames(keys: readonly RoomKey[]) {
  return sortRooms(keys)
    .map((r) => rooms[r])
    .join(", ");
}
