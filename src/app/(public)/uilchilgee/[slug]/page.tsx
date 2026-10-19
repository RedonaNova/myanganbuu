import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICE_SLUGS, isServiceSlug } from "@/lib/catalog";
import { getProjectsByService } from "@/lib/queries";
import { services } from "@/content/services";
import { ProjectCard } from "@/components/site/project-card";
import { CtaBand } from "@/components/site/cta-band";
import { serviceNames, servicesPage as t } from "@/messages/mn";

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/uilchilgee/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!isServiceSlug(slug)) return {};
  return {
    title: serviceNames[slug],
    description: services[slug].intro.slice(0, 160),
    alternates: { canonical: `/uilchilgee/${slug}` },
  };
}

export default async function ServicePage({ params }: PageProps<"/uilchilgee/[slug]">) {
  const { slug } = await params;
  if (!isServiceSlug(slug)) notFound();
  const s = services[slug];
  const related = await getProjectsByService(slug);

  return (
    <>
      <article className="container-page pt-10 md:pt-16">
        <p className="text-sm font-bold tracking-[0.14em] text-accent uppercase">{t.title}</p>
        <h1 className="mt-4 text-[2.5rem] leading-[1.05] font-bold md:text-7xl">{serviceNames[slug]}</h1>
        <p className="mt-6 max-w-3xl text-xl leading-relaxed md:text-2xl">{s.intro}</p>

        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-2">
          <section className="rounded-card border border-line bg-surface p-6 md:p-8" aria-labelledby="includes">
            <h2 id="includes" className="text-2xl font-bold">
              {t.includes}
            </h2>
            <ul className="mt-6 space-y-4">
              {s.includes.map((item) => (
                <li key={item} className="flex gap-3 text-lg">
                  <svg className="mt-1 shrink-0 text-accent" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-card bg-ink p-6 text-bg md:p-8" aria-labelledby="decide">
            <h2 id="decide" className="text-2xl font-bold">
              {t.decide}
            </h2>
            <p className="mt-2 text-base text-bg/70">{t.decideHint}</p>
            <ol className="mt-6 space-y-4">
              {s.decide.map((item, i) => (
                <li key={item} className="flex gap-4 text-lg">
                  <span className="font-display font-bold text-accent tabular">{String(i + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="mt-4 flex flex-col gap-2 rounded-card bg-accent-soft p-6 md:flex-row md:items-center md:gap-8 md:p-8" aria-labelledby="duration">
          <h2 id="duration" className="shrink-0 text-xl font-bold text-accent">
            {t.duration}
          </h2>
          <p className="text-lg">{s.duration}</p>
        </section>
      </article>

      {related.length > 0 && (
        <section className="container-page mt-20" aria-labelledby="related">
          <h2 id="related" className="text-3xl font-bold md:text-4xl">
            {t.related}
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {related.map((p) => (
              <li key={p.slug}>
                <ProjectCard project={p} sizes="(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <CtaBand title={t.ctaTitle} body={t.ctaBody} />
    </>
  );
}
