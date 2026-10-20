import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/session";
import { processImage } from "@/lib/images";
import { site } from "@/messages/mn";

const MAX_BYTES = 40 * 1024 * 1024;

// POST multipart { file } → the created about-page photo (XHR, for progress).
export async function POST(request: Request) {
  if (!(await getAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "no_file" }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "too_big" }, { status: 413 });

  let image;
  try {
    image = await processImage(Buffer.from(await file.arrayBuffer()), "public");
  } catch {
    return Response.json({ error: "unsupported" }, { status: 415 });
  }

  const last = await db.sitePhoto.findFirst({ orderBy: { sortOrder: "desc" } });
  const photo = await db.sitePhoto.create({
    data: { ...image, alt: site.name, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });
  revalidateTag("about", { expire: 0 });

  return Response.json(
    {
      id: photo.id,
      src: `/media/${photo.storageKey}`,
      width: photo.width,
      height: photo.height,
      lqip: photo.lqip,
      alt: photo.alt,
      caption: photo.caption,
    },
    { status: 201 },
  );
}
