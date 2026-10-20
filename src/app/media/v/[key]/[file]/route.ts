import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { KEY_PATTERN } from "@/lib/images";
import { VIDEO_TYPES, videoFile } from "@/lib/videos";

const TYPE_BY_EXT = Object.fromEntries(Object.entries(VIDEO_TYPES).map(([mime, ext]) => [ext, mime]));

// GET /media/v/<key>/video.<mp4|mov|webm> with HTTP Range support, so phones
// can start playing and seek without downloading the whole file.
export async function GET(request: Request, ctx: RouteContext<"/media/v/[key]/[file]">) {
  const { key, file } = await ctx.params;
  const ext = /^video\.(mp4|mov|webm)$/.exec(file)?.[1];
  if (!KEY_PATTERN.test(key) || !ext) return new Response(null, { status: 404 });

  const filePath = videoFile(key, ext);
  let size: number;
  try {
    size = (await stat(filePath)).size;
  } catch {
    return new Response(null, { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": TYPE_BY_EXT[ext],
    "Accept-Ranges": "bytes",
    // Keys are random and never reused.
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
  if (range && (range[1] || range[2])) {
    // "bytes=500-" (from 500), "bytes=-500" (last 500), "bytes=0-999".
    let start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    let end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    start = Math.max(0, start);
    end = Math.max(start, end);
    const body = Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream;
    return new Response(body, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }

  const body = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
  return new Response(body, { headers: { ...headers, "Content-Length": String(size) } });
}
