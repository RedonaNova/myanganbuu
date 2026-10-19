import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/session";
import { processImage } from "@/lib/images";
import { toClientPhoto } from "@/lib/photos";
import { rooms } from "@/messages/mn";

const MAX_BYTES = 40 * 1024 * 1024;

// POST multipart { file } → the created photo. Used by the admin uploader via
// XHR so the phone can show real upload progress.
export async function POST(request: Request, ctx: RouteContext<"/api/admin/projects/[id]/photos">) {
  if (!(await getAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });

  const projectId = Number((await ctx.params).id);
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return Response.json({ error: "not_found" }, { status: 404 });

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

  const last = await db.photo.findFirst({ where: { projectId }, orderBy: { sortOrder: "desc" } });
  const photo = await db.photo.create({
    data: {
      projectId,
      ...image,
      alt: `${rooms[project.room]}, ${project.title}`.slice(0, 250),
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
  if (!project.coverPhotoId) {
    await db.project.update({ where: { id: projectId }, data: { coverPhotoId: photo.id } });
  }
  revalidateTag("projects", { expire: 0 });
  revalidateTag(`project:${project.slug}`, { expire: 0 });

  return Response.json(toClientPhoto(photo), { status: 201 });
}
