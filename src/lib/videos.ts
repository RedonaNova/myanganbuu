import "server-only";
import { randomBytes } from "node:crypto";
import { rm } from "node:fs/promises";
import path from "node:path";
import { KEY_PATTERN, deleteImage, uploadRoot } from "@/lib/images";

// Videos are kept exactly as uploaded: the VPS has no transcoder, and phones
// already record H.264/HEVC that browsers play. 500 MB is several minutes of
// 1080p phone video. nginx must allow it (see README, client_max_body_size).
export const VIDEO_MAX_BYTES = 500 * 1024 * 1024;

export const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

export function newVideoKey() {
  return randomBytes(12).toString("hex");
}

export function videoDir(key: string) {
  return path.join(/*turbopackIgnore: true*/ uploadRoot(), "videos", key);
}

export function videoFile(key: string, ext: string) {
  return path.join(/*turbopackIgnore: true*/ videoDir(key), `video.${ext}`);
}

export async function deleteVideoFiles(video: { storageKey: string; posterKey: string | null }) {
  if (KEY_PATTERN.test(video.storageKey)) await rm(videoDir(video.storageKey), { recursive: true, force: true });
  if (video.posterKey) await deleteImage("public", video.posterKey);
}

export type ClientVideo = {
  id: number;
  src: string;
  mime: string;
  width: number;
  height: number;
  durationSec: number;
  sizeBytes: number;
  caption: string;
  /** Poster frame as a photo key (served by /media/<key>/...), when one was captured. */
  poster: { src: string; lqip: string } | null;
};

export function toClientVideo(v: {
  id: number;
  storageKey: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  durationSec: number;
  sizeBytes: number;
  caption: string;
  posterKey: string | null;
  posterLqip: string | null;
}): ClientVideo {
  return {
    id: v.id,
    src: `/media/v/${v.storageKey}/video.${v.ext}`,
    mime: v.mime,
    width: v.width,
    height: v.height,
    durationSec: v.durationSec,
    sizeBytes: v.sizeBytes,
    caption: v.caption,
    poster: v.posterKey ? { src: `/media/${v.posterKey}`, lqip: v.posterLqip ?? "" } : null,
  };
}
