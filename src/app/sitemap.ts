import type { MetadataRoute } from "next";
import { getPublishedSlugs } from "@/lib/queries";
import { SERVICE_SLUGS } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:4000";
  const projects = await getPublishedSlugs();
  const latest = projects.reduce<Date | undefined>((d, p) => (!d || p.updatedAt > d ? p.updatedAt : d), undefined);

  return [
    { url: `${base}/`, lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/ajluud`, lastModified: latest, changeFrequency: "weekly", priority: 0.9 },
    ...SERVICE_SLUGS.map((s) => ({ url: `${base}/ajluud/torol/${s}`, lastModified: latest, changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: `${base}/minii-tukhai`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/uilchilgee`, changeFrequency: "monthly", priority: 0.7 },
    ...SERVICE_SLUGS.map((s) => ({ url: `${base}/uilchilgee/${s}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    { url: `${base}/holboo-barikh`, changeFrequency: "yearly", priority: 0.5 },
    ...projects.map((p) => ({ url: `${base}/ajluud/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
