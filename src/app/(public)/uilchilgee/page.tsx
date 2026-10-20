import type { Metadata } from "next";
import { getServiceShowcase } from "@/lib/queries";
import { ServiceCard } from "@/components/site/service-card";
import { servicesPage as t } from "@/messages/mn";

export const metadata: Metadata = {
  title: t.title,
  description: t.intro,
  alternates: { canonical: "/uilchilgee" },
};

export default async function ServicesPage() {
  const items = await getServiceShowcase();
  return (
    <div className="container-page pt-10 md:pt-16">
      <h1 className="text-[2.5rem] leading-[1.05] font-bold md:text-7xl">{t.title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-2 md:text-xl">{t.intro}</p>
      <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <li key={s.slug}>
            <ServiceCard slug={s.slug} cover={s.cover} count={s.count} />
          </li>
        ))}
      </ul>
    </div>
  );
}
