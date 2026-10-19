"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { deleteImage } from "@/lib/images";
import { slugify } from "@/lib/slug";
import { ROOMS, SERVICE_SLUGS } from "@/lib/catalog";
import { districts, admin as t } from "@/messages/mn";

/** Public pages cache project data under these tags. */
function invalidate(slug?: string) {
  updateTag("projects");
  if (slug) updateTag(`project:${slug}`);
}

async function uniqueSlug(title: string, excludeId?: number) {
  const base = slugify(title) || "tosol";
  for (let i = 0; ; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await db.project.findFirst({ where: { slug, NOT: excludeId ? { id: excludeId } : undefined } });
    if (!taken) return slug;
  }
}

// ─── Projects ────────────────────────────────────────────────────────────

export type FormState = { error?: string; ok?: boolean };

export async function createProject(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim().slice(0, 190);
  const room = String(formData.get("room") ?? "OTHER");
  if (!title) return { error: t.info.titleRequired };

  const project = await db.project.create({
    data: {
      title,
      description: "",
      slug: await uniqueSlug(title),
      room: (ROOMS as readonly string[]).includes(room) ? (room as (typeof ROOMS)[number]) : "OTHER",
      completedAt: new Date(),
    },
  });
  redirect(`/admin/projects/${project.id}`);
}

const infoSchema = z.object({
  title: z.string().trim().min(1).max(190),
  description: z.string().max(5000),
  room: z.enum(ROOMS),
  district: z.union([z.enum(districts), z.literal("")]),
  areaM2: z.string().trim().max(10),
  durationDays: z.string().trim().max(5),
  completedAt: z.string().trim().max(10),
  services: z.array(z.enum(SERVICE_SLUGS)),
  published: z.boolean(),
  featured: z.boolean(),
});

function toNumber(v: string) {
  const n = Number(v.replace(",", "."));
  return v && Number.isFinite(n) && n > 0 ? n : null;
}

export async function updateProject(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = infoSchema.safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    room: formData.get("room") ?? "OTHER",
    district: formData.get("district") ?? "",
    areaM2: formData.get("areaM2") ?? "",
    durationDays: formData.get("durationDays") ?? "",
    completedAt: formData.get("completedAt") ?? "",
    services: formData.getAll("services"),
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.some((i) => i.path[0] === "title") ? t.info.titleRequired : undefined };
  }
  const d = parsed.data;
  const current = await db.project.findUniqueOrThrow({ where: { id } });

  // Once shared on Facebook the URL must not change; drafts follow the title.
  const slug = current.published || d.title === current.title ? current.slug : await uniqueSlug(d.title, id);
  const area = toNumber(d.areaM2);
  const duration = toNumber(d.durationDays);

  await db.$transaction([
    db.project.update({
      where: { id },
      data: {
        title: d.title,
        slug,
        description: d.description.trim(),
        room: d.room,
        district: d.district,
        areaM2: area,
        durationDays: duration ? Math.round(duration) : null,
        completedAt: /^\d{4}-\d{2}-\d{2}$/.test(d.completedAt) ? new Date(`${d.completedAt}T00:00:00Z`) : null,
        published: d.published,
        featured: d.featured,
      },
    }),
    db.projectService.deleteMany({ where: { projectId: id } }),
    db.projectService.createMany({ data: d.services.map((serviceSlug) => ({ projectId: id, serviceSlug })) }),
  ]);
  invalidate(current.slug);
  if (slug !== current.slug) invalidate(slug);
  return { ok: true };
}

export async function deleteProject(id: number) {
  await requireAdmin();
  const project = await db.project.findUnique({ where: { id }, include: { photos: true } });
  if (!project) redirect("/admin/projects");
  await db.project.delete({ where: { id } });
  await Promise.all(project.photos.map((p) => deleteImage("public", p.storageKey)));
  invalidate(project.slug);
  redirect("/admin/projects");
}

// ─── Photos ──────────────────────────────────────────────────────────────

async function photoWithProject(photoId: number) {
  return db.photo.findUniqueOrThrow({ where: { id: photoId }, include: { project: { select: { slug: true } } } });
}

const photoSchema = z.object({
  alt: z.string().trim().max(250),
  caption: z.string().trim().max(250),
  role: z.enum(["BEFORE", "AFTER", "GALLERY", "PROGRESS"]),
  milestoneDate: z.string().trim().max(10),
});

export async function updatePhoto(photoId: number, input: z.input<typeof photoSchema>) {
  await requireAdmin();
  const d = photoSchema.parse(input);
  const photo = await photoWithProject(photoId);

  // Changing role away from BEFORE/AFTER dissolves the pair.
  if (photo.role === "BEFORE" && d.role !== "BEFORE") await unpairInternal(photo.id);
  if (photo.role === "AFTER" && d.role !== "AFTER") {
    const before = await db.photo.findUnique({ where: { pairedAfterId: photo.id } });
    if (before) await unpairInternal(before.id);
  }
  await db.photo.update({
    where: { id: photoId },
    data: {
      alt: d.alt,
      caption: d.caption,
      role: d.role,
      milestoneDate: /^\d{4}-\d{2}-\d{2}$/.test(d.milestoneDate) ? new Date(`${d.milestoneDate}T00:00:00Z`) : null,
    },
  });
  invalidate(photo.project.slug);
}

export async function deletePhoto(photoId: number) {
  await requireAdmin();
  const photo = await photoWithProject(photoId);
  await db.photo.delete({ where: { id: photoId } });
  await deleteImage("public", photo.storageKey);

  // Keep a cover if any photos remain.
  const project = await db.project.findUniqueOrThrow({ where: { id: photo.projectId } });
  if (!project.coverPhotoId) {
    const next = await db.photo.findFirst({ where: { projectId: project.id }, orderBy: { sortOrder: "asc" } });
    if (next) await db.project.update({ where: { id: project.id }, data: { coverPhotoId: next.id } });
  }
  invalidate(photo.project.slug);
}

export async function reorderPhotos(projectId: number, ids: number[]) {
  await requireAdmin();
  const project = await db.project.findUniqueOrThrow({ where: { id: projectId }, include: { photos: true } });
  const owned = new Set(project.photos.map((p) => p.id));
  const ordered = ids.filter((id) => owned.has(id));
  await db.$transaction(ordered.map((id, i) => db.photo.update({ where: { id }, data: { sortOrder: i } })));
  invalidate(project.slug);
}

export async function pairPhotos(beforeId: number, afterId: number) {
  await requireAdmin();
  if (beforeId === afterId) return;
  const [before, after] = await Promise.all([photoWithProject(beforeId), photoWithProject(afterId)]);
  if (before.projectId !== after.projectId) return;

  // Each photo can be in at most one pair.
  for (const id of [beforeId, afterId]) {
    await unpairInternal(id);
    const asAfter = await db.photo.findUnique({ where: { pairedAfterId: id } });
    if (asAfter) await unpairInternal(asAfter.id);
  }
  await db.$transaction([
    db.photo.update({ where: { id: afterId }, data: { role: "AFTER" } }),
    db.photo.update({ where: { id: beforeId }, data: { role: "BEFORE", pairedAfterId: afterId } }),
  ]);
  const project = await db.project.findUniqueOrThrow({ where: { id: before.projectId } });
  if (!project.heroPairId) {
    await db.project.update({ where: { id: project.id }, data: { heroPairId: beforeId } });
  }
  invalidate(before.project.slug);
}

async function unpairInternal(beforeId: number) {
  const photo = await db.photo.findUnique({ where: { id: beforeId } });
  if (!photo?.pairedAfterId) return;
  await db.photo.update({ where: { id: beforeId }, data: { pairedAfterId: null } });
  const project = await db.project.findUnique({ where: { id: photo.projectId } });
  if (project?.heroPairId === beforeId) {
    const other = await db.photo.findFirst({
      where: { projectId: photo.projectId, pairedAfterId: { not: null } },
      orderBy: { sortOrder: "asc" },
    });
    await db.project.update({ where: { id: photo.projectId }, data: { heroPairId: other?.id ?? null } });
  }
}

export async function unpairPhotos(beforeId: number) {
  await requireAdmin();
  const photo = await photoWithProject(beforeId);
  await unpairInternal(beforeId);
  invalidate(photo.project.slug);
}

export async function setCover(photoId: number) {
  await requireAdmin();
  const photo = await photoWithProject(photoId);
  await db.project.update({ where: { id: photo.projectId }, data: { coverPhotoId: photoId } });
  invalidate(photo.project.slug);
}

export async function setHeroPair(beforeId: number) {
  await requireAdmin();
  const photo = await photoWithProject(beforeId);
  if (!photo.pairedAfterId) return;
  await db.project.update({ where: { id: photo.projectId }, data: { heroPairId: beforeId } });
  invalidate(photo.project.slug);
}
