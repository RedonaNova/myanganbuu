import { getProject } from "@/lib/queries";
import { OG_SIZE, ogImage, photoDataUrl } from "@/lib/og";
import { area, days } from "@/lib/format";
import { rooms, site } from "@/messages/mn";

// Facebook link preview for one work: the finished photo, title and facts.
export const alt = site.name;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const project = await getProject((await params).slug);
  const cover = project?.heroPair?.after ?? project?.cover;
  const facts = project
    ? [rooms[project.room], project.district, project.areaM2 ? area(project.areaM2) : "", project.durationDays ? days(project.durationDays) : ""]
        .filter(Boolean)
        .join(", ")
    : site.tagline;
  return ogImage({ title: project?.title ?? site.name, subtitle: facts, photos: [await photoDataUrl(cover?.src)] });
}
