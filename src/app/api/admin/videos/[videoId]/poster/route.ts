import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/session";
import { deleteImage, processImage } from "@/lib/images";
import { toClientVideo } from "@/lib/videos";

const MAX_BYTES = 10 * 1024 * 1024;

// POST multipart { file }: the poster frame the browser grabbed from the video.
// Processed like a photo, so it gets the same sizes and blurred placeholder.
export async function POST(request: Request, ctx: RouteContext<"/api/admin/videos/[videoId]/poster">) {
  if (!(await getAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });

  const id = Number((await ctx.params).videoId);
  const video = await db.video.findUnique({ where: { id }, include: { project: true } });
  if (!video) return Response.json({ error: "not_found" }, { status: 404 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size > MAX_BYTES) return Response.json({ error: "no_file" }, { status: 400 });

  let image;
  try {
    image = await processImage(Buffer.from(await file.arrayBuffer()), "public");
  } catch {
    return Response.json({ error: "unsupported" }, { status: 415 });
  }
  if (video.posterKey) await deleteImage("public", video.posterKey);
  const updated = await db.video.update({
    where: { id },
    data: {
      posterKey: image.storageKey,
      posterLqip: image.lqip,
      // The frame's real size is the most reliable aspect ratio we have.
      width: video.width || image.width,
      height: video.height || image.height,
    },
  });
  revalidateTag("projects", { expire: 0 });
  revalidateTag(`project:${video.project.slug}`, { expire: 0 });
  return Response.json(toClientVideo(updated));
}
