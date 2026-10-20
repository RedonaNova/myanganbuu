import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SERVICE_SLUGS, isServiceSlug } from "@/lib/catalog";
import { getProjectsByService } from "@/lib/queries";
import { services } from "@/content/services";
import { ProjectCard } from "@/components/site/project-card";
import { MediaImage } from "@/components/media-image";
import Link from "next/link";
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

// params is URL data: read it inside Suspense so the shared page shell stays instant.
export default function ServicePage({ params }: PageProps<"/uilchilgee/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ServiceContent params={params} />
    </Suspense>
  );
}

async function ServiceContent({ params }: Pick<PageProps<"/uilchilgee/[slug]">, "params">) {
  const { slug } = await params;
  if (!isServiceSlug(slug)) notFound();
  const s = services[slug];
  const related = await getProjectsByService(slug);
  const hero = related[0]?.cover ?? null;

  return (
    <>
      <article className="container-page pt-10 md:pt-16">
        <Link href="/uilchilgee" className="text-base font-semibold text-ink-2 underline-offset-4 hover:text-ink hover:underline">
          {t.title}
        </Link>
        <h1 className="mt-2 text-[2.5rem] leading-[1.05] font-bold md:text-7xl">{serviceNames[slug]}</h1>
        <div className={`mt-8 grid gap-8 md:mt-12 md:gap-12 ${hero ? "lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-start" : ""}`}>
          <p className="max-w-3xl text-xl leading-relaxed md:text-2xl">{s.intro}</p>
          {hero && (
            <Link href={`/ajluud/${related[0].slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-card bg-surface-2">
              <MediaImage photo={hero} sizes="(min-width: 1024px) 34rem, 100vw" fill priority className="object-cover" />
            </Link>
          )}
        </div>

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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="related" className="text-3xl font-bold md:text-4xl">
              {t.related}
            </h2>
            <Link href={`/ajluud/torol/${slug}`} className="inline-flex min-h-11 items-center text-lg font-semibold text-accent underline decoration-2 underline-offset-[6px]">
              {t.allOfType}
            </Link>
          </div>
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
