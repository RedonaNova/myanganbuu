import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { featuredIds, getSettings, showcaseOrder } from "@/lib/settings";
import { PageHeader } from "@/components/admin/page-header";
import { HomeEditor } from "./home-editor";
import { adminHome, serviceNames } from "@/messages/mn";

export default async function AdminHomePage() {
  await requireAdmin();
  const [settings, projects, photos] = await Promise.all([
    getSettings(),
    db.project.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
      include: { coverPhoto: true, photos: { orderBy: { sortOrder: "asc" }, take: 1 }, services: true },
    }),
    // Every photo of his published works, for picking each type's picture.
    db.photo.findMany({
      where: { project: { published: true } },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { id: true, projectId: true, storageKey: true, width: true, height: true, lqip: true },
    }),
  ]);

  return (
    <>
      <PageHeader title={adminHome.title} backHref="/admin/settings" />
      <HomeEditor
        heroProjectId={settings.heroProjectId}
        featured={featuredIds(settings)}
        showcase={showcaseOrder(settings)}
        typeNames={serviceNames}
        photos={photos.map((p) => ({ id: p.id, projectId: p.projectId, src: `/media/${p.storageKey}`, width: p.width, height: p.height, lqip: p.lqip }))}
        projects={projects.map((p) => {
          const cover = p.coverPhoto ?? p.photos[0];
          return {
            id: p.id,
            title: p.title,
            hasPair: !!p.heroPairId,
            services: p.services.map((s) => s.serviceSlug),
            cover: cover ? { src: `/media/${cover.storageKey}`, width: cover.width, height: cover.height, lqip: cover.lqip } : null,
          };
        })}
      />
    </>
  );
}
