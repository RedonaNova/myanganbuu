import type { Metadata } from "next";
import { SERVICE_SLUGS } from "@/lib/catalog";
import { ServiceCard } from "@/components/site/service-card";
import { servicesPage as t } from "@/messages/mn";

export const metadata: Metadata = {
  title: t.title,
  description: t.intro,
  alternates: { canonical: "/uilchilgee" },
};

export default function ServicesPage() {
  return (
    <div className="container-page pt-10 md:pt-16">
      <h1 className="text-[2.5rem] leading-[1.05] font-bold md:text-7xl">{t.title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-2 md:text-xl">{t.intro}</p>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICE_SLUGS.map((s, i) => (
          <li key={s}>
            <ServiceCard slug={s} index={i} />
          </li>
        ))}
      </ul>
    </div>
  );
}
