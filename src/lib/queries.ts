import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { toClientPhoto, type ClientPhoto } from "@/lib/photos";
import type { RoomKey, ServiceSlug } from "@/lib/catalog";
import { aboutStats, featuredIds, getSettings, showcaseOrder } from "@/lib/settings";
import { sortRooms } from "@/lib/rooms";
import { toClientVideo, type ClientVideo } from "@/lib/videos";

// Public data. Cached in memory and invalidated by the admin actions through
// the "projects" / "project:<slug>" tags, so pages are fast on a small VM.

export type ProjectCard = {
  slug: string;
  title: string;
  rooms: RoomKey[];
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
  rooms: true,
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
    rooms: sortRooms(p.rooms.map((r) => r.room)),
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
    ...(filter.room ? { rooms: { some: { room: filter.room } } } : {}),
    ...(filter.service ? { services: { some: { serviceSlug: filter.service } } } : {}),
  });
  return rows.map(toCard);
}

/** His highlighted works, in the order he set in Admin > Нүүр хуудас. */
export async function getFeaturedCards(limit = 4) {
  "use cache";
  cacheLife("days");
  cacheTag("projects", "settings");
  const ids = featuredIds(await getSettings());
  if (ids.length) {
    const rows = await fetchCards({ id: { in: ids } });
    const ordered = ids.map((id) => rows.find((r) => r.id === id)).filter((r) => !!r);
    if (ordered.length) return ordered.slice(0, limit).map(toCard);
  }
  // Nothing chosen yet: the newest work, so the home page is never empty.
  return (await fetchCards({}, limit)).map(toCard);
}

/**
 * Every work type in his order (Admin > Нүүр хуудас), with how many published
 * works it has and the photo he picked for it (any of his photos), else the
 * newest work's cover.
 */
export async function getServiceShowcase() {
  "use cache";
  cacheLife("days");
  cacheTag("projects", "settings");
  const order = showcaseOrder(await getSettings()).filter((o) => !o.hidden);
  const pickedIds = order.flatMap((o) => (o.photoId ? [o.photoId] : []));
  const picked = pickedIds.length
    ? await db.photo.findMany({ where: { id: { in: pickedIds }, project: { published: true } } })
    : [];
  return Promise.all(
    order.map(async ({ slug, photoId }) => {
      const rows = await fetchCards({ services: { some: { serviceSlug: slug } } });
      const photo = picked.find((p) => p.id === photoId);
      const cover = photo ? toClientPhoto(photo) : rows[0] ? toCard(rows[0]).cover : null;
      return { slug, count: rows.length, cover };
    }),
  );
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
  videos: ClientVideo[];
};

export async function getProject(slug: string): Promise<ProjectDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag("projects", `project:${slug}`);

  const p = await db.project.findFirst({
    where: { slug, published: true },
    include: { ...cardInclude, photos: { orderBy: { sortOrder: "asc" } }, videos: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
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
    videos: p.videos.map(toClientVideo),
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
  // Otherwise the first highlighted work that has a before/after pair.
  const highlighted = featuredIds(await getSettings());
  const candidates = chosen
    ? []
    : await db.project.findMany({ where: { published: true, heroPairId: { not: null } }, include, orderBy: [{ sortOrder: "asc" }, { id: "desc" }] });
  const project =
    chosen ??
    highlighted.map((hid) => candidates.find((c) => c.id === hid)).find((c) => !!c) ??
    candidates[0];
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

export type AboutPhoto = { id: number; src: string; width: number; height: number; lqip: string; alt: string; caption: string };

/** Everything the about page shows; text falls back to defaults in messages. */
export async function getAbout() {
  "use cache";
  cacheLife("days");
  cacheTag("about", "settings", "projects");
  const [settings, photos, works] = await Promise.all([
    getSettings(),
    db.sitePhoto.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    db.project.count({ where: { published: true } }),
  ]);
  const toAbout = (p: (typeof photos)[number]): AboutPhoto => ({
    id: p.id,
    src: `/media/${p.storageKey}`,
    width: p.width,
    height: p.height,
    lqip: p.lqip,
    alt: p.alt,
    caption: p.caption,
  });
  const portrait = photos.find((p) => p.isPortrait);
  return {
    headline: settings.aboutHeadline,
    bio: settings.aboutBio,
    stats: aboutStats(settings),
    works,
    portrait: portrait ? toAbout(portrait) : null,
    album: photos.filter((p) => !p.isPortrait).map(toAbout),
  };
}
