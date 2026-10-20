import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectTabs } from "@/components/admin/project-tabs";
import { ProjectInfoForm } from "./project-info-form";

export default async function ProjectInfoPage({ params }: PageProps<"/admin/projects/[id]/info">) {
  await requireAdmin();
  const id = Number((await params).id);
  const project = Number.isInteger(id)
    ? await db.project.findUnique({ where: { id }, include: { services: true, rooms: true } })
    : null;
  if (!project) notFound();

  return (
    <>
      <PageHeader title={project.title} backHref="/admin/projects" />
      <ProjectTabs id={project.id} active="info" />
      <ProjectInfoForm
        project={{
          id: project.id,
          slug: project.slug,
          title: project.title,
          description: project.description,
          rooms: project.rooms.map((r) => r.room),
          district: project.district,
          areaM2: project.areaM2 ? project.areaM2.toString() : "",
          durationDays: project.durationDays ? String(project.durationDays) : "",
          completedAt: project.completedAt ? project.completedAt.toISOString().slice(0, 10) : "",
          services: project.services.map((s) => s.serviceSlug),
          published: project.published,
          featured: project.featured,
        }}
      />
    </>
  );
}
