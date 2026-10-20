import { createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/session";
import { VIDEO_MAX_BYTES, VIDEO_TYPES, newVideoKey, toClientVideo, videoDir, videoFile } from "@/lib/videos";

// POST raw video bytes (not multipart), so a large file streams straight to
// disk instead of being held in memory. The browser sends what it measured:
//   Content-Type: video/mp4 | video/quicktime | video/webm
//   X-Video-Width, X-Video-Height, X-Video-Duration (seconds)
export async function POST(request: Request, ctx: RouteContext<"/api/admin/projects/[id]/videos">) {
  if (!(await getAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });

  const projectId = Number((await ctx.params).id);
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return Response.json({ error: "not_found" }, { status: 404 });

  const mime = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const ext = VIDEO_TYPES[mime];
  if (!ext || !request.body) return Response.json({ error: "unsupported" }, { status: 415 });
  if (Number(request.headers.get("content-length") ?? 0) > VIDEO_MAX_BYTES) return Response.json({ error: "too_big" }, { status: 413 });

  const key = newVideoKey();
  await mkdir(videoDir(key), { recursive: true });
  let size = 0;
  try {
    await pipeline(
      Readable.fromWeb(request.body as import("node:stream/web").ReadableStream),
      new Transform({
        transform(chunk: Buffer, _enc, done) {
          size += chunk.length;
          done(size > VIDEO_MAX_BYTES ? new Error("too_big") : null, chunk);
        },
      }),
      createWriteStream(videoFile(key, ext)),
    );
  } catch (err) {
    await rm(videoDir(key), { recursive: true, force: true });
    const tooBig = err instanceof Error && err.message === "too_big";
    return Response.json({ error: tooBig ? "too_big" : "upload_failed" }, { status: tooBig ? 413 : 400 });
  }
  if (!size) {
    await rm(videoDir(key), { recursive: true, force: true });
    return Response.json({ error: "no_file" }, { status: 400 });
  }

  const num = (name: string) => {
    const n = Math.round(Number(request.headers.get(name)));
    return Number.isFinite(n) && n > 0 && n < 100000 ? n : 0;
  };
  const last = await db.video.findFirst({ where: { projectId }, orderBy: { sortOrder: "desc" } });
  const video = await db.video.create({
    data: {
      projectId,
      storageKey: key,
      mime,
      ext,
      sizeBytes: size,
      width: num("x-video-width"),
      height: num("x-video-height"),
      durationSec: num("x-video-duration"),
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
  revalidateTag("projects", { expire: 0 });
  revalidateTag(`project:${project.slug}`, { expire: 0 });
  return Response.json(toClientVideo(video), { status: 201 });
}
