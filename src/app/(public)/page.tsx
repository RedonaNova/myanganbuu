import Link from "next/link";
import { SERVICE_SLUGS } from "@/lib/catalog";
import { getAbout, getFeaturedCards, getHeroPair, getServiceShowcase } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { sliderLabels } from "@/lib/labels";
import { BeforeAfter } from "@/components/before-after";
import { MediaImage } from "@/components/media-image";
import { ProjectCard } from "@/components/site/project-card";
import { ServiceShowcase } from "@/components/site/service-showcase";
import { ContactButtons } from "@/components/site/contact";
import { ContactTrigger } from "@/components/site/contact-dialog";
import { IconArrowRight } from "@/components/icons";
import { services } from "@/content/services";
import { about, footer, home as t, nav, projectPage, serviceNames, site } from "@/messages/mn";

export default async function Home() {
  const settings = await getSettings();
  const [hero, featured, showcase, aboutData] = await Promise.all([
    getHeroPair(settings.heroProjectId),
    getFeaturedCards(4),
    getServiceShowcase(),
    getAbout(),
  ]);
  const siteUrl = process.env.SITE_URL ?? "";
  const portrait = aboutData.portrait;
  const aboutLead = (aboutData.bio || about.defaultBio).split(/\n{2,}/)[0];

  return (
    <>
      {/* Hero: name, one line, CTA, and one real before/after. */}
      <section className="container-page pt-8 md:pt-14">
        <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p className="text-sm font-bold tracking-[0.14em] text-accent uppercase">{t.eyebrow}</p>
            <h1 className="mt-4 text-[3.25rem] leading-[0.95] font-extrabold tracking-[-0.035em] sm:text-7xl lg:text-[5.75rem] lg:leading-[0.9] xl:text-[7.25rem]">
              {site.name}
            </h1>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2 md:text-xl lg:mt-0">{t.lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ContactTrigger className="inline-flex min-h-14 items-center justify-center rounded-full bg-accent px-8 text-lg font-semibold text-accent-ink transition-colors duration-150 hover:bg-accent-hover">
                {nav.contact}
              </ContactTrigger>
              <Link
                href="/ajluud"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-line px-7 text-lg font-semibold transition-colors duration-150 hover:border-ink-2"
              >
                {t.secondaryCta}
                <IconArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>

        {hero && (
          <figure className="mt-8 lg:mt-14">
            <BeforeAfter
              before={hero.pair.before}
              after={hero.pair.after}
              labels={sliderLabels}
              priority
              className="max-h-[78dvh] lg:aspect-[16/10]!"
              sizes="(min-width: 82rem) 78rem, 100vw"
            />
            <figcaption className="mt-3 flex items-center justify-between gap-4 text-sm text-ink-2">
              <span className="hidden sm:inline">{projectPage.compareHint}</span>
              <Link href={`/ajluud/${hero.slug}`} className="min-w-0 truncate font-semibold text-ink underline-offset-4 hover:underline">
                {hero.title}
              </Link>
            </figcaption>
          </figure>
        )}
      </section>

      {/* What he does: each work type with a photo of real work. */}
      <section className="container-page mt-24 md:mt-36" aria-labelledby="services">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 lg:mb-14">
          <div className="max-w-2xl">
            <h2 id="services" className="text-4xl font-bold md:text-6xl">
              {t.servicesTitle}
            </h2>
            <p className="mt-4 text-lg text-ink-2">{t.servicesIntro}</p>
          </div>
          <SectionLink href="/uilchilgee">{t.servicesAll}</SectionLink>
        </div>
        <ServiceShowcase
          countLabel={t.workCount}
          emptyLabel={t.noWorkYet}
          // Only types with a photo of real work; the services page lists them all.
          items={showcase
            .filter((s) => s.cover)
            .map((s) => ({ slug: s.slug, name: serviceNames[s.slug], short: services[s.slug].short, count: s.count, cover: s.cover }))}
        />
      </section>

      {/* His highlighted works, in his order. Desktop bento: large, wide, two small. */}
      {featured.length > 0 && (
        <section className="container-page mt-24 md:mt-36" aria-labelledby="featured">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 id="featured" className="text-4xl font-bold md:text-6xl">
              {t.featuredTitle}
            </h2>
            <SectionLink href="/ajluud">{t.featuredAll}</SectionLink>
          </div>
          <ul className={`grid gap-4 md:grid-cols-2 md:gap-6 ${featured.length === 4 ? "lg:auto-rows-[17rem] lg:grid-cols-4" : ""}`}>
            {featured.map((p, i) => {
              const bento = featured.length === 4;
              const cell = !bento ? "" : i === 0 ? "lg:col-span-2 lg:row-span-2" : i === 1 ? "lg:col-span-2" : "";
              const sizes = !bento || i < 2 ? "(min-width: 768px) 40rem, 100vw" : "(min-width: 1024px) 20rem, (min-width: 768px) 40rem, 100vw";
              return (
                <li key={p.slug} className={cell}>
                  <ProjectCard project={p} fillCell={bento} sizes={sizes} />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* The person behind the work. */}
      <section className="container-page mt-24 md:mt-36" aria-labelledby="about">
        <div className={`grid items-center gap-8 md:gap-14 ${portrait ? "md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""}`}>
          {portrait && (
            <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-surface-2">
              <MediaImage photo={portrait} sizes="(min-width: 768px) 32rem, 100vw" fill className="object-cover" />
            </div>
          )}
          <div className="max-w-2xl">
            <h2 id="about" className="text-4xl leading-[1.05] font-bold md:text-6xl">
              {aboutData.headline || about.defaultHeadline}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-2 md:text-xl">{aboutLead}</p>
            <Link
              href="/minii-tukhai"
              className="mt-8 inline-flex min-h-14 items-center rounded-full border border-line px-7 text-lg font-semibold transition-colors duration-150 hover:border-ink-2"
            >
              {nav.about}
            </Link>
          </div>
        </div>
      </section>

      {/* How it works: a real sequence, so it is numbered. */}
      <section className="container-page mt-24 md:mt-36" aria-labelledby="how">
        <h2 id="how" className="text-4xl font-bold md:text-6xl">
          {t.howTitle}
        </h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {t.steps.map((step, i) => (
            <li key={step.title} className="border-t-2 border-ink pt-6">
              <span className="font-display text-5xl leading-none font-extrabold text-accent tabular">{i + 1}</span>
              <h3 className="mt-6 text-2xl font-bold">{step.title}</h3>
              <p className="mt-3 max-w-sm text-lg text-ink-2">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Contact: text first, never a phone call. */}
      <section className="container-page mt-24 md:mt-36" aria-labelledby="contact">
        <div className="grid gap-8 rounded-card bg-ink p-6 text-bg md:grid-cols-[1fr_auto] md:items-end md:gap-14 md:p-14">
          <div>
            <h2 id="contact" className="text-3xl leading-tight font-bold md:text-5xl">
              {t.contactTitle}
            </h2>
            <p className="mt-4 max-w-md text-lg text-bg/75">{t.contactBody}</p>
          </div>
          <ContactButtons settings={settings} />
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HomeAndConstructionBusiness",
            name: site.name,
            description: site.description,
            url: siteUrl || undefined,
            image: hero ? `${siteUrl}${hero.pair.after.src}/1200.jpg` : undefined,
            areaServed: { "@type": "City", name: site.city },
            address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: "MN" },
            sameAs: [settings.facebookUrl],
            knowsLanguage: "mn",
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: nav.services,
              itemListElement: SERVICE_SLUGS.map((s) => ({
                "@type": "Offer",
                itemOffered: { "@type": "Service", name: serviceNames[s], url: `${siteUrl}/uilchilgee/${s}` },
              })),
            },
          }).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}

function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-11 shrink-0 items-center text-lg font-semibold text-accent underline decoration-2 underline-offset-[6px] hover:decoration-accent/40">
      {children}
    </Link>
  );
}
