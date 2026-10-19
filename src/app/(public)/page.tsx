import Link from "next/link";
import { SERVICE_SLUGS } from "@/lib/catalog";
import { getFeaturedCards, getHeroPair } from "@/lib/queries";
import { getSettings, messengerLink, viberLink } from "@/lib/settings";
import { BeforeAfter } from "@/components/before-after";
import { sliderLabels } from "@/lib/labels";
import { ProjectCard } from "@/components/site/project-card";
import { ServiceCard } from "@/components/site/service-card";
import { IconArrowRight } from "@/components/icons";
import { footer, home as t, nav, projectPage, serviceNames, site } from "@/messages/mn";

export default async function Home() {
  const settings = await getSettings();
  const [hero, featured] = await Promise.all([getHeroPair(settings.heroProjectId), getFeaturedCards(4)]);
  const viber = viberLink(settings);
  const siteUrl = process.env.SITE_URL ?? "";

  return (
    <>
      {/* Hero: name, one line, CTA, and one real before/after. */}
      <section className="container-page grid items-center gap-8 pt-8 md:pt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div>
          <p className="text-sm font-bold tracking-[0.14em] text-accent uppercase">{t.eyebrow}</p>
          <h1 className="mt-4 text-[3.25rem] leading-[0.95] font-extrabold tracking-[-0.035em] sm:text-7xl xl:text-8xl">
            {site.name}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2 md:text-xl">{t.lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/holboo-barikh"
              className="inline-flex min-h-14 items-center justify-center rounded-full bg-accent px-8 text-lg font-semibold text-accent-ink transition-colors duration-150 hover:bg-accent-hover"
            >
              {nav.cta}
            </Link>
            <Link
              href="/tusul"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-line px-7 text-lg font-semibold transition-colors duration-150 hover:border-ink-2"
            >
              {t.secondaryCta}
              <IconArrowRight size={20} />
            </Link>
          </div>
        </div>

        {hero && (
          <figure>
            <div className="max-h-[78dvh] overflow-hidden rounded-card">
              <BeforeAfter before={hero.pair.before} after={hero.pair.after} labels={sliderLabels} priority sizes="(min-width: 1024px) 46rem, 100vw" />
            </div>
            <figcaption className="mt-3 flex items-center justify-between gap-4 text-sm text-ink-2">
              <span className="hidden sm:inline">{projectPage.compareHint}</span>
              <Link href={`/tusul/${hero.slug}`} className="inline-flex min-h-10 min-w-0 items-center gap-1 font-semibold text-ink hover:text-accent">
                <span className="line-clamp-1">{hero.title}</span>
                <IconArrowRight size={16} className="shrink-0" />
              </Link>
            </figcaption>
          </figure>
        )}
      </section>

      {/* Services */}
      <section className="container-page mt-24 md:mt-32" aria-labelledby="services">
        <SectionHead id="services" title={t.servicesTitle} href="/uilchilgee" linkLabel={t.servicesAll} />
        {/* Phones: a swipeable row of large cards. Wider screens: a grid. */}
        <ul className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {SERVICE_SLUGS.map((s, i) => (
            <li key={s} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <ServiceCard slug={s} index={i} />
            </li>
          ))}
        </ul>
      </section>

      {/* Featured projects, bento: the first one tall. */}
      {featured.length > 0 && (
        <section className="container-page mt-24 md:mt-32" aria-labelledby="featured">
          <SectionHead id="featured" title={t.featuredTitle} href="/tusul" linkLabel={t.featuredAll} />
          <ul className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
            {featured.map((p, i) => (
              <li key={p.slug} className={i === 0 && featured.length > 2 ? "md:row-span-2" : ""}>
                <ProjectCard project={p} tall={i === 0 && featured.length > 2} sizes="(min-width: 768px) 40rem, 100vw" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* How it works */}
      <section className="container-page mt-24 md:mt-32" aria-labelledby="how">
        <h2 id="how" className="text-3xl font-bold md:text-5xl">
          {t.howTitle}
        </h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {t.steps.map((step, i) => (
            <li key={step.title} className="rounded-card bg-surface-2 p-6 md:p-8">
              <span className="font-display text-6xl leading-none font-extrabold text-accent tabular">{i + 1}</span>
              <h3 className="mt-8 text-2xl font-bold">{step.title}</h3>
              <p className="mt-3 text-lg text-ink-2">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Contact: text first, never a phone call. */}
      <section className="container-page mt-24 md:mt-32" aria-labelledby="contact">
        <div className="grid gap-8 rounded-card bg-ink p-6 text-bg md:grid-cols-2 md:items-end md:p-14">
          <div>
            <h2 id="contact" className="text-3xl leading-tight font-bold md:text-5xl">
              {t.contactTitle}
            </h2>
            <p className="mt-4 max-w-md text-lg text-bg/75">{t.contactBody}</p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={messengerLink(settings)}
              rel="noopener"
              className="inline-flex min-h-16 items-center justify-center rounded-full bg-accent px-8 text-xl font-semibold text-accent-ink transition-colors duration-150 hover:bg-accent-hover"
            >
              {footer.messenger}
            </a>
            {viber && (
              <a href={viber} className="inline-flex min-h-16 items-center justify-center rounded-full border border-bg/25 px-8 text-xl font-semibold hover:border-bg/60">
                {footer.viber}
              </a>
            )}
            <Link href="/holboo-barikh" className="inline-flex min-h-14 items-center justify-center rounded-full px-8 text-lg font-semibold text-bg/80 underline-offset-4 hover:underline">
              {footer.form}
            </Link>
          </div>
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

function SectionHead({ id, title, href, linkLabel }: { id: string; title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 id={id} className="text-3xl font-bold md:text-5xl">
        {title}
      </h2>
      <Link href={href} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 font-semibold text-accent">
        {linkLabel}
        <IconArrowRight size={20} />
      </Link>
    </div>
  );
}
