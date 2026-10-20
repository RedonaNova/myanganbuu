import { getProjectCards } from "@/lib/queries";
import { isServiceSlug } from "@/lib/catalog";
import { OG_SIZE, ogImage, photoDataUrl } from "@/lib/og";
import { services } from "@/content/services";
import { serviceNames, site } from "@/messages/mn";

// Facebook preview for a work type: up to three of his photos of that work.
export const alt = site.name;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  if (!isServiceSlug(service)) return ogImage({ title: site.name, subtitle: site.tagline, photos: [] });
  const works = await getProjectCards({ service });
  const photos = await Promise.all(works.slice(0, 3).map((w) => photoDataUrl(w.cover?.src)));
  return ogImage({ title: serviceNames[service], subtitle: services[service].short, photos });
}
