import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { toClientPhoto } from "@/lib/photos";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectTabs } from "@/components/admin/project-tabs";
import { PhotoManager } from "@/components/admin/photo-manager";
import { rooms } from "@/messages/mn";

export default async function ProjectPhotosPage({ params }: PageProps<"/admin/projects/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  const project = Number.isInteger(id)
    ? await db.project.findUnique({ where: { id }, include: { photos: { orderBy: { sortOrder: "asc" } } } })
    : null;
  if (!project) notFound();

  return (
    <>
      <PageHeader title={project.title} backHref="/admin/projects" />
      <ProjectTabs id={project.id} active="photos" />
      <PhotoManager
        projectId={project.id}
        photos={project.photos.map(toClientPhoto)}
        coverPhotoId={project.coverPhotoId}
        heroPairId={project.heroPairId}
        roomLabel={rooms[project.room]}
      />
    </>
  );
}
