import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { featuredIds, getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/page-header";
import { HomeEditor } from "./home-editor";
import { adminHome } from "@/messages/mn";

export default async function AdminHomePage() {
  await requireAdmin();
  const [settings, projects] = await Promise.all([
    getSettings(),
    db.project.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
      include: { coverPhoto: true, photos: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
  ]);

  return (
    <>
      <PageHeader title={adminHome.title} backHref="/admin/settings" />
      <HomeEditor
        availability={settings.availability}
        heroProjectId={settings.heroProjectId}
        featured={featuredIds(settings)}
        projects={projects.map((p) => {
          const cover = p.coverPhoto ?? p.photos[0];
          return {
            id: p.id,
            title: p.title,
            hasPair: !!p.heroPairId,
            cover: cover ? { src: `/media/${cover.storageKey}`, width: cover.width, height: cover.height, lqip: cover.lqip } : null,
          };
        })}
      />
    </>
  );
}
