import { MediaImage } from "@/components/media-image";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/admin/page-header";
import { cardClass, primaryButtonClass } from "@/components/admin/ui";
import { IconPlus, IconStar } from "@/components/icons";
import { admin, rooms } from "@/messages/mn";

const t = admin.projects;

export default async function ProjectsPage() {
  await requireAdmin();
  const projects = await db.project.findMany({
    orderBy: [{ completedAt: "desc" }, { id: "desc" }],
    include: { coverPhoto: true, _count: { select: { photos: true } } },
  });

  return (
    <>
      <PageHeader
        title={t.title}
        action={
          <Link href="/admin/projects/new" className={`${primaryButtonClass} min-h-12 px-5 text-base`}>
            <IconPlus size={22} />
            {t.add}
          </Link>
        }
      />
      <div className="container-page">
        {projects.length === 0 ? (
          <p className="text-lg text-ink-2">{t.empty}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/projects/${p.id}`}
                  className={`${cardClass} flex items-center gap-4 p-3 transition-colors duration-150 hover:border-ink-2`}
                >
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-surface-2">
                    {p.coverPhoto && (
                      <MediaImage photo={{ src: `/media/${p.coverPhoto.storageKey}`, width: p.coverPhoto.width, height: p.coverPhoto.height, lqip: p.coverPhoto.lqip }} alt="" sizes="96px" fill className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-lg leading-snug font-bold">{p.title}</p>
                    <p className="mt-1 text-base text-ink-2">
                      {rooms[p.room]} · {p._count.photos ? `${p._count.photos} ${t.photosCount}` : t.noPhotos}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${p.published ? "bg-success/15 text-success" : "bg-surface-2 text-ink-2"}`}
                      >
                        {p.published ? t.published : t.draft}
                      </span>
                      {p.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-sm font-semibold text-accent">
                          <IconStar size={14} />
                          {t.featured}
                        </span>
                      )}
                      {p.isSample && (
                        <span className="rounded-full border border-line px-2.5 py-0.5 text-sm font-semibold text-ink-2">
                          {t.sample}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
