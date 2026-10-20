import { getServiceShowcase } from "@/lib/queries";
import { services } from "@/content/services";
import { Suspense } from "react";
import { WorksTabs, WorksTabsFallback } from "@/components/site/works-tabs";
import { projectsPage as t, serviceNames } from "@/messages/mn";

/** Shared by all works and each type, so the chip row survives a type switch. */
export default async function WorksLayout({ children }: LayoutProps<"/ajluud">) {
  const all = await getServiceShowcase();
  const tabs = {
    types: all.filter((s) => s.count > 0).map((s) => ({ slug: s.slug, name: serviceNames[s.slug], short: services[s.slug].short, count: s.count })),
    labels: { title: t.title, intro: t.intro, all: t.all, filter: t.filter },
  };
  return (
    <div className="container-page pt-10 md:pt-16">
      <Suspense fallback={<WorksTabsFallback {...tabs} />}>
        <WorksTabs {...tabs} />
      </Suspense>
      {children}
    </div>
  );
}
