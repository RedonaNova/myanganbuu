import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
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

// params is URL data: read it inside Suspense so the shared page shell stays instant.
export default function WorksByTypePage({ params }: PageProps<"/ajluud/torol/[service]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WorksByType params={params} />
    </Suspense>
  );
}

async function WorksByType({ params }: Pick<PageProps<"/ajluud/torol/[service]">, "params">) {
  const { service } = await params;
  if (!isServiceSlug(service)) notFound();
  return <WorksView service={service} />;
}

function PageSkeleton() {
  return (
    <div className="container-page animate-pulse pt-10 md:pt-16" aria-hidden="true">
      <div className="h-4 w-28 rounded bg-surface-2" />
      <div className="mt-5 h-14 w-2/3 rounded-xl bg-surface-2" />
      <div className="mt-6 h-6 w-1/2 rounded bg-surface-2" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="aspect-[4/5] rounded-card bg-surface-2 sm:aspect-[5/4]" />
        <div className="hidden aspect-[5/4] rounded-card bg-surface-2 sm:block" />
      </div>
    </div>
  );
}
