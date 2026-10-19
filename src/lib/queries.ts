import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { toClientPhoto, type ClientPhoto } from "@/lib/photos";
import type { RoomKey, ServiceSlug } from "@/lib/catalog";

// Public data. Cached in memory and invalidated by the admin actions through
// the "projects" / "project:<slug>" tags, so pages are fast on a small VM.

export type ProjectCard = {
  slug: string;
  title: string;
  room: RoomKey;
  district: string;
  areaM2: number | null;
  durationDays: number | null;
  completedAt: Date | null;
  services: ServiceSlug[];
  cover: ClientPhoto | null;
  photoCount: number;
};

const cardInclude = {
  coverPhoto: true,
  // Fallback when no cover is set.
  photos: { orderBy: { sortOrder: "asc" }, take: 1 },
  heroPair: { include: { pairedAfter: true } },
  services: true,
  _count: { select: { photos: true } },
} as const;

type CardRow = Awaited<ReturnType<typeof fetchCards>>[number];

async function fetchCards(where: object, take?: number) {
  return db.project.findMany({
    where: { published: true, ...where },
    include: cardInclude,
    orderBy: [{ sortOrder: "asc" }, { completedAt: "desc" }, { id: "desc" }],
    take,
  });
}

function toCard(p: CardRow): ProjectCard {
  // Prefer the finished result: the main pair's AFTER, else the cover.
  const coverRow = p.heroPair?.pairedAfter ?? p.coverPhoto ?? p.photos[0];
  return {
    slug: p.slug,
    title: p.title,
    room: p.room,
    district: p.district,
    areaM2: p.areaM2 ? Number(p.areaM2) : null,
    durationDays: p.durationDays,
    completedAt: p.completedAt,
    services: p.services.map((s) => s.serviceSlug as ServiceSlug),
    cover: coverRow ? toClientPhoto(coverRow) : null,
    photoCount: p._count.photos,
  };
}

export async function getProjectCards(filter: { room?: RoomKey; service?: ServiceSlug } = {}) {
  "use cache";
  cacheLife("days");
  cacheTag("projects");
  const rows = await fetchCards({
    ...(filter.room ? { room: filter.room } : {}),
    ...(filter.service ? { services: { some: { serviceSlug: filter.service } } } : {}),
  });
  return rows.map(toCard);
}

export async function getFeaturedCards(limit = 4) {
  "use cache";
  cacheLife("days");
  cacheTag("projects");
  const featured = await fetchCards({ featured: true }, limit);
  // Fall back to the newest work so the home page is never empty.
  const rows = featured.length ? featured : await fetchCards({}, limit);
  return rows.map(toCard);
}

export async function getProjectsByService(service: ServiceSlug, limit = 3) {
  "use cache";
  cacheLife("days");
  cacheTag("projects");
  return (await fetchCards({ services: { some: { serviceSlug: service } } }, limit)).map(toCard);
}

export type Pair = { before: ClientPhoto; after: ClientPhoto };

export type ProjectDetail = ProjectCard & {
  id: number;
  description: string;
  updatedAt: Date;
  heroPair: Pair | null;
  pairs: Pair[];
  gallery: ClientPhoto[];
  progress: ClientPhoto[];
};

export async function getProject(slug: string): Promise<ProjectDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag("projects", `project:${slug}`);

  const p = await db.project.findFirst({
    where: { slug, published: true },
    include: { ...cardInclude, photos: { orderBy: { sortOrder: "asc" } } },
  });
  if (!p) return null;

  const photos = p.photos.map(toClientPhoto);
  const byId = new Map(photos.map((x) => [x.id, x]));
  const paired = new Set<number>();
  const pairs: Pair[] = [];
  for (const before of photos) {
    const after = before.pairedAfterId ? byId.get(before.pairedAfterId) : undefined;
    if (before.role === "BEFORE" && after) {
      pairs.push({ before, after });
      paired.add(before.id).add(after.id);
    }
  }
  // Main pair first.
  pairs.sort((a, b) => Number(b.before.id === p.heroPairId) - Number(a.before.id === p.heroPairId));

  return {
    ...toCard(p),
    id: p.id,
    description: p.description,
    updatedAt: p.updatedAt,
    heroPair: pairs[0] ?? null,
    pairs: pairs.slice(1),
    gallery: photos.filter((x) => !paired.has(x.id) && x.role !== "PROGRESS"),
    progress: photos
      .filter((x) => x.role === "PROGRESS")
      .sort((a, b) => (a.milestoneDate || "9").localeCompare(b.milestoneDate || "9")),
  };
}

export async function getMoreProjects(excludeSlug: string, limit = 3) {
  "use cache";
  cacheLife("days");
  cacheTag("projects");
  return (await fetchCards({ NOT: { slug: excludeSlug } }, limit)).map(toCard);
}

export async function getPublishedSlugs() {
  "use cache";
  cacheLife("days");
  cacheTag("projects");
  return db.project.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { id: "desc" },
  });
}

/** The before/after shown above the fold: chosen in settings, else the first featured. */
export async function getHeroPair(heroProjectId: string) {
  "use cache";
  cacheLife("days");
  cacheTag("projects", "settings");
  const id = Number(heroProjectId);
  const include = { heroPair: { include: { pairedAfter: true } } } as const;
  const chosen = id ? await db.project.findFirst({ where: { id, published: true, heroPairId: { not: null } }, include }) : null;
  const project =
    chosen ??
    (await db.project.findFirst({
      where: { published: true, heroPairId: { not: null } },
      include,
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { completedAt: "desc" }],
    }));
  const before = project?.heroPair;
  if (!project || !before?.pairedAfter) return null;
  return {
    slug: project.slug,
    title: project.title,
    pair: { before: toClientPhoto(before), after: toClientPhoto(before.pairedAfter) } satisfies Pair,
  };
}

/** Everything presentation mode needs, in display order. */
export async function getPresentation() {
  "use cache";
  cacheLife("days");
  cacheTag("projects");
  const slugs = await db.project.findMany({
    where: { published: true },
    select: { slug: true },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { completedAt: "desc" }],
  });
  const projects = await Promise.all(slugs.map((s) => getProject(s.slug)));
  return projects.filter((p): p is ProjectDetail => !!p);
}
