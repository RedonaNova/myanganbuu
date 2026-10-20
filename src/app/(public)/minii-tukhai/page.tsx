import type { Metadata } from "next";
import { getAbout, getFeaturedCards } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { galleryLabels, shareLabels } from "@/lib/labels";
import { MediaImage } from "@/components/media-image";
import { Gallery } from "@/components/gallery";
import { ProjectCard } from "@/components/site/project-card";
import { CtaBand } from "@/components/site/cta-band";
import { ContactDetails } from "@/components/site/contact";
import { FacebookShare } from "@/components/facebook-share";
import { ShareButton } from "@/components/share-button";
import { about as t, contact, projectPage, site } from "@/messages/mn";

export const metadata: Metadata = {
  title: t.title,
  description: t.defaultHeadline,
  alternates: { canonical: "/minii-tukhai" },
};

const shareClass =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-base font-semibold transition-colors duration-150 hover:border-ink-2";

export default async function AboutPage() {
  const [data, featured, settings] = await Promise.all([getAbout(), getFeaturedCards(4), getSettings()]);
  const headline = data.headline || t.defaultHeadline;
  const paragraphs = (data.bio || t.defaultBio).split(/\n{2,}/).filter(Boolean);
  // His own numbers first, then the live count of published work.
  const stats = [...data.stats, ...(data.works ? [{ value: String(data.works), label: t.works }] : [])];
  const url = `${process.env.SITE_URL ?? ""}/minii-tukhai`;

  return (
    <>
      <article className="container-page pt-10 md:pt-16">
        <div className={`grid gap-10 md:gap-16 ${data.portrait ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""}`}>
          {data.portrait && (
            <figure>
              <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-surface-2">
                <MediaImage photo={data.portrait} sizes="(min-width: 1024px) 32rem, 100vw" fill priority className="object-cover" />
              </div>
              {data.portrait.caption && <figcaption className="mt-3 text-sm text-ink-2">{data.portrait.caption}</figcaption>}
            </figure>
          )}
          <div className="lg:pt-6">
            <p className="font-display text-2xl font-bold text-accent">{site.name}</p>
            <h1 className="mt-3 text-[2.5rem] leading-[1.02] font-bold tracking-[-0.025em] md:text-7xl">{headline}</h1>
            <div className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed md:text-xl">
              {paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>

            {stats.length > 0 && (
              <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6 border-t border-line pt-8">
                {stats.map((s, i) => (
                  <div key={`${s.label}-${i}`} className="flex flex-col-reverse">
                    <dt className="mt-2 text-base text-ink-2">{s.label}</dt>
                    <dd className="font-display text-5xl leading-none font-extrabold tabular">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-10 flex flex-wrap gap-2">
              <FacebookShare url={url} label={projectPage.shareFacebook} className={shareClass} />
              <ShareButton title={`${site.name}: ${t.title}`} url={url} labels={shareLabels} className={shareClass} />
            </div>
          </div>
        </div>
      </article>

      {data.album.length > 0 && (
        <section className="container-page mt-20 md:mt-28" aria-labelledby="album">
          <h2 id="album" className="text-3xl font-bold md:text-5xl">
            {t.photos}
          </h2>
          <div className="mt-8">
            <Gallery
              photos={data.album.map((p) => ({ ...p, role: "GALLERY" as const, milestoneDate: "", pairedAfterId: null }))}
              labels={galleryLabels}
            />
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="container-page mt-20 md:mt-28" aria-labelledby="featured">
          <h2 id="featured" className="text-3xl font-bold md:text-5xl">
            {t.featured}
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:gap-6">
            {featured.map((p) => (
              <li key={p.slug}>
                <ProjectCard project={p} sizes="(min-width: 640px) 40rem, 100vw" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="container-page mt-20 md:mt-28" aria-labelledby="contact">
        <h2 id="contact" className="text-3xl font-bold md:text-5xl">
          {contact.title}
        </h2>
        <div className="mt-8 max-w-3xl">
          <ContactDetails settings={settings} />
        </div>
      </section>

      <CtaBand title={t.ctaTitle} body={t.ctaBody} />
    </>
  );
}
