import type { Metadata } from "next";
import { MediaImage } from "@/components/media-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getMoreProjects, getProject, type ProjectDetail } from "@/lib/queries";
import { area, days, longDate, monthYear } from "@/lib/format";
import { BeforeAfter } from "@/components/before-after";
import { galleryLabels, shareLabels, sliderLabels } from "@/lib/labels";
import { Gallery } from "@/components/gallery";
import { ShareButton } from "@/components/share-button";
import { FacebookShare } from "@/components/facebook-share";
import { ProjectCard } from "@/components/site/project-card";
import { CtaBand } from "@/components/site/cta-band";
import { IconArrowRight } from "@/components/icons";
import { projectPage as t, projectsPage, rooms, serviceNames, site } from "@/messages/mn";

export async function generateMetadata({ params }: PageProps<"/ajluud/[slug]">): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  const description =
    project.description.slice(0, 160) ||
    [rooms[project.room], project.district, project.areaM2 ? area(project.areaM2) : ""].filter(Boolean).join(", ");
  return {
    title: project.title,
    description,
    alternates: { canonical: `/ajluud/${project.slug}` },
    openGraph: { type: "article", title: project.title, description, locale: site.locale, siteName: site.name },
  };
}

export default function ProjectPage({ params }: PageProps<"/ajluud/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ProjectContent params={params} />
    </Suspense>
  );
}

async function ProjectContent({ params }: Pick<PageProps<"/ajluud/[slug]">, "params">) {
  const project = await getProject((await params).slug);
  if (!project) notFound();

  return (
    <article>
      <ProjectHeader project={project} />

      {project.heroPair ? (
        <div className="container-page mt-8 md:mt-12">
          <figure>
            <BeforeAfter before={project.heroPair.before} after={project.heroPair.after} labels={sliderLabels} priority />
            <figcaption className="mt-3 text-center text-sm text-ink-2">{t.compareHint}</figcaption>
          </figure>
        </div>
      ) : (
        project.cover && (
          <div className="container-page mt-8 md:mt-12">
            <div className="relative overflow-hidden rounded-card bg-surface-2" style={{ aspectRatio: `${project.cover.width} / ${project.cover.height}` }}>
              <MediaImage photo={project.cover} alt={project.cover.alt} sizes="(min-width: 82rem) 78rem, 100vw" fill priority className="object-cover" />
            </div>
          </div>
        )
      )}

      {project.description && (
        <div className="container-page mt-12 md:mt-16">
          <div className="max-w-2xl space-y-4 text-lg leading-relaxed md:text-xl">
            {project.description.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>
        </div>
      )}

      {project.pairs.length > 0 && (
        <section className="container-page mt-16 md:mt-24" aria-labelledby="pairs">
          <h2 id="pairs" className="text-3xl font-bold md:text-4xl">
            {t.comparisons}
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {project.pairs.map((pair) => (
              <li key={pair.before.id}>
                <BeforeAfter before={pair.before} after={pair.after} labels={sliderLabels} sizes="(min-width: 768px) 39rem, 100vw" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {project.gallery.length > 0 && (
        <section className="container-page mt-16 md:mt-24" aria-labelledby="gallery">
          <h2 id="gallery" className="text-3xl font-bold md:text-4xl">
            {t.gallery}
            <span className="ml-3 align-middle text-lg font-semibold text-ink-2 tabular">{project.gallery.length}</span>
          </h2>
          <div className="mt-8">
            <Gallery photos={project.gallery} labels={galleryLabels} />
          </div>
        </section>
      )}

      {project.progress.length > 0 && <Progress project={project} />}

      <CtaBand title={t.ctaTitle} body={t.ctaBody} />

      <Suspense>
        <MoreProjects slug={project.slug} />
      </Suspense>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: project.title,
            description: project.description || undefined,
            dateCreated: project.completedAt?.toISOString().slice(0, 10),
            locationCreated: project.district ? { "@type": "Place", name: `${project.district}, ${site.city}` } : undefined,
            creator: { "@type": "Person", name: site.name },
            inLanguage: "mn",
          }).replace(/</g, "\\u003c"),
        }}
      />
    </article>
  );
}

function ProjectHeader({ project }: { project: ProjectDetail }) {
  const facts = [
    project.areaM2 ? { label: t.area, value: area(project.areaM2) } : null,
    project.durationDays ? { label: t.duration, value: days(project.durationDays) } : null,
    project.completedAt ? { label: t.completed, value: monthYear(project.completedAt) } : null,
    project.district ? { label: t.district, value: project.district } : null,
  ].filter((f): f is { label: string; value: string } => !!f);

  return (
    <header className="container-page pt-10 md:pt-16">
      <nav aria-label={projectsPage.title} className="flex flex-wrap gap-x-2 text-base font-semibold text-ink-2">
        <Link href="/ajluud" className="underline-offset-4 hover:text-ink hover:underline">
          {projectsPage.title}
        </Link>
        {project.services[0] && (
          <>
            <span aria-hidden="true">{"/"}</span>
            <Link href={`/ajluud/torol/${project.services[0]}`} className="underline-offset-4 hover:text-ink hover:underline">
              {serviceNames[project.services[0]]}
            </Link>
          </>
        )}
      </nav>
      <h1 className="mt-3 max-w-4xl text-[2.25rem] leading-[1.08] font-bold md:text-6xl">{project.title}</h1>

      {facts.length > 0 && (
        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="bg-bg p-4 md:p-5">
              <dt className="text-sm font-semibold text-ink-2">{f.label}</dt>
              <dd className="mt-1 font-display text-lg font-bold break-words tabular sm:text-xl md:text-2xl">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {project.services.map((s) => (
          <Link
            key={s}
            href={`/ajluud/torol/${s}`}
            className="inline-flex min-h-10 items-center rounded-full border border-line px-4 text-base font-semibold transition-colors duration-150 hover:border-ink-2"
          >
            {serviceNames[s]}
          </Link>
        ))}
        <span className="ml-auto flex flex-wrap gap-1">
          <FacebookShare
            url={`/ajluud/${project.slug}`}
            label={t.shareFacebook}
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-base font-semibold text-ink-2 transition-colors duration-150 hover:text-ink"
          />
          <ShareButton
            title={project.title}
            labels={shareLabels}
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-base font-semibold text-ink-2 transition-colors duration-150 hover:text-ink"
          />
        </span>
      </div>
    </header>
  );
}

function Progress({ project }: { project: ProjectDetail }) {
  return (
    <section className="container-page mt-16 md:mt-24" aria-labelledby="progress">
      <h2 id="progress" className="text-3xl font-bold md:text-4xl">
        {t.progress}
      </h2>
      <ol className="mt-8 space-y-10 border-l-2 border-line pl-6 md:pl-10">
        {project.progress.map((p) => (
          <li key={p.id} className="relative">
            <span aria-hidden="true" className="absolute top-1.5 -left-[calc(1.5rem+7px)] size-3 rounded-full bg-accent ring-4 ring-bg md:-left-[calc(2.5rem+7px)]" />
            {p.milestoneDate && (
              <p className="text-base font-bold text-accent tabular">{longDate(new Date(`${p.milestoneDate}T00:00:00Z`))}</p>
            )}
            {p.caption && <p className="mt-1 text-lg">{p.caption}</p>}
            <div className="relative mt-4 max-w-2xl overflow-hidden rounded-2xl bg-surface-2" style={{ aspectRatio: `${p.width} / ${p.height}` }}>
              <MediaImage photo={p} alt={p.alt} sizes="(min-width: 768px) 42rem, 100vw" fill className="object-cover" />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

async function MoreProjects({ slug }: { slug: string }) {
  const more = await getMoreProjects(slug);
  if (!more.length) return null;
  return (
    <section className="container-page mt-24" aria-labelledby="more">
      <div className="flex items-end justify-between gap-4">
        <h2 id="more" className="text-3xl font-bold md:text-4xl">
          {t.more}
        </h2>
        <Link href="/ajluud" className="inline-flex min-h-11 items-center gap-2 font-semibold text-accent">
          {t.allProjects}
          <IconArrowRight size={20} />
        </Link>
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {more.map((p) => (
          <li key={p.slug}>
            <ProjectCard project={p} sizes="(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-page animate-pulse pt-10 md:pt-16" aria-hidden="true">
      <div className="h-4 w-28 rounded bg-surface-2" />
      <div className="mt-5 h-12 w-3/4 rounded-xl bg-surface-2" />
      <div className="mt-8 h-24 rounded-2xl bg-surface-2" />
      <div className="mt-8 aspect-[4/3] rounded-card bg-surface-2" />
    </div>
  );
}
