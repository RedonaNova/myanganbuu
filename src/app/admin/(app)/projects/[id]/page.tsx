import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { toClientPhoto } from "@/lib/photos";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectTabs } from "@/components/admin/project-tabs";
import { PhotoManager } from "@/components/admin/photo-manager";
import { VideoManager } from "@/components/admin/video-manager";
import { toClientVideo } from "@/lib/videos";
import { rooms } from "@/messages/mn";
import { roomNames } from "@/lib/rooms";

export default async function ProjectPhotosPage({ params }: PageProps<"/admin/projects/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  const project = Number.isInteger(id)
    ? await db.project.findUnique({ where: { id }, include: { photos: { orderBy: { sortOrder: "asc" } }, rooms: true, videos: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } } })
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
        roomLabel={roomNames(project.rooms.map((r) => r.room)) || rooms.OTHER}
      />
      <VideoManager projectId={project.id} initial={project.videos.map(toClientVideo)} />
    </>
  );
}
