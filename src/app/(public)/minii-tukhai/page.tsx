import type { Metadata } from "next";
import { getAbout, getFeaturedCards } from "@/lib/queries";
import { galleryLabels, shareLabels } from "@/lib/labels";
import { MediaImage } from "@/components/media-image";
import { Gallery } from "@/components/gallery";
import { ProjectCard } from "@/components/site/project-card";
import { CtaBand } from "@/components/site/cta-band";
import { FacebookShare } from "@/components/facebook-share";
import { ShareButton } from "@/components/share-button";
import { about as t, projectPage, site } from "@/messages/mn";

export const metadata: Metadata = {
  title: t.title,
  description: t.defaultHeadline,
  alternates: { canonical: "/minii-tukhai" },
};

const shareClass =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-base font-semibold transition-colors duration-150 hover:border-ink-2";

export default async function AboutPage() {
  const [data, featured] = await Promise.all([getAbout(), getFeaturedCards(4)]);
  const [portrait, ...photos] = data.photos;
  const headline = data.headline || t.defaultHeadline;
  const paragraphs = (data.bio || t.defaultBio).split(/\n{2,}/).filter(Boolean);
  const facts = [
    data.years ? { value: data.years, label: t.years } : null,
    data.works ? { value: data.works, label: t.works } : null,
    data.trades ? { value: data.trades, label: t.trades } : null,
  ].filter((f): f is { value: number; label: string } => !!f);
  const url = `${process.env.SITE_URL ?? ""}/minii-tukhai`;

  return (
    <>
      <article className="container-page pt-10 md:pt-16">
        <div className={`grid gap-10 md:gap-16 ${portrait ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""}`}>
          {portrait && (
            <figure>
              <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-surface-2">
                <MediaImage photo={portrait} sizes="(min-width: 1024px) 32rem, 100vw" fill priority className="object-cover" />
              </div>
              {portrait.caption && <figcaption className="mt-3 text-sm text-ink-2">{portrait.caption}</figcaption>}
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

            {facts.length > 0 && (
              <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6 border-t border-line pt-8">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="sr-only">{f.label}</dt>
                    <dd>
                      <span className="block font-display text-5xl leading-none font-extrabold tabular">{f.value}</span>
                      <span className="mt-2 block text-base text-ink-2">{f.label}</span>
                    </dd>
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

      {photos.length > 0 && (
        <section className="container-page mt-20 md:mt-28" aria-labelledby="photos">
          <h2 id="photos" className="text-3xl font-bold md:text-5xl">
            {t.photos}
          </h2>
          <div className="mt-8">
            <Gallery photos={photos.map((p) => ({ ...p, role: "GALLERY" as const, milestoneDate: "", pairedAfterId: null }))} labels={galleryLabels} />
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

      <CtaBand title={t.ctaTitle} body={t.ctaBody} />
    </>
  );
}
