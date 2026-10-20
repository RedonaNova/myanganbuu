import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICE_SLUGS, isServiceSlug } from "@/lib/catalog";
import { services } from "@/content/services";
import { WorksView } from "@/components/site/works-view";
import { projectsPage as t, serviceNames, site } from "@/messages/mn";

export function generateStaticParams() {
  return SERVICE_SLUGS.map((service) => ({ service }));
}

export async function generateMetadata({ params }: PageProps<"/ajluud/torol/[service]">): Promise<Metadata> {
  const { service } = await params;
  if (!isServiceSlug(service)) return {};
  const title = `${serviceNames[service]}: ${t.title.toLowerCase()}`;
  return {
    title,
    description: services[service].short,
    alternates: { canonical: `/ajluud/torol/${service}` },
    openGraph: { title, description: services[service].short, locale: site.locale, siteName: site.name },
  };
}

export default async function WorksByTypePage({ params }: PageProps<"/ajluud/torol/[service]">) {
  const { service } = await params;
  if (!isServiceSlug(service)) notFound();
  return <WorksView service={service} />;
}
