import Link from "next/link";
import { getProjectCards, getServiceShowcase } from "@/lib/queries";
import type { ServiceSlug } from "@/lib/catalog";
import { shareLabels } from "@/lib/labels";
import { ProjectCard } from "@/components/site/project-card";
import { FacebookShare } from "@/components/facebook-share";
import { ShareButton } from "@/components/share-button";
import { services } from "@/content/services";
import { projectPage, projectsPage as t, serviceNames } from "@/messages/mn";

const shareClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-line text-base font-semibold transition-colors duration-150 hover:border-ink-2 sm:px-4";
// Icon-only on phones so both buttons sit beside the count on one row.
const shareLabel = "sr-only sm:not-sr-only";

/**
 * The works list, for all work or one type. Each type is its own page with
 * its own URL and Facebook preview, so he can share "my facade work" directly.
 */
export async function WorksView({ service }: { service?: ServiceSlug }) {
  const [projects, types] = await Promise.all([getProjectCards({ service }), getServiceShowcase()]);
  const title = service ? serviceNames[service] : t.title;
  const url = `${process.env.SITE_URL ?? ""}${service ? `/ajluud/torol/${service}` : "/ajluud"}`;
  const countLabel = `${projects.length} ${t.count}`;

  return (
    <div className="container-page pt-10 md:pt-16">
      {service && (
        <Link href="/ajluud" className="text-base font-semibold text-ink-2 underline-offset-4 hover:text-ink hover:underline">
          {t.title}
        </Link>
      )}
      <h1 className="mt-2 max-w-4xl text-[2.5rem] leading-[1.05] font-bold md:text-7xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-2 md:text-xl">{service ? services[service].short : t.intro}</p>

      <nav aria-label={t.filter} className="mt-10">
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip href="/ajluud" active={!service} label={t.all} />
          {types
            .filter((s) => s.count > 0)
            .map((s) => (
              <Chip key={s.slug} href={`/ajluud/torol/${s.slug}`} active={service === s.slug} label={serviceNames[s.slug]} count={s.count} />
            ))}
        </ul>
      </nav>

      <div className="mt-8 flex items-center justify-between gap-3">
        <p className="text-base text-ink-2 tabular">{countLabel}</p>
        <div className="flex flex-wrap gap-2">
          <FacebookShare url={url} label={projectPage.shareFacebook} className={shareClass} labelClassName={shareLabel} />
          <ShareButton title={title} url={url} labels={shareLabels} className={shareClass} labelClassName={shareLabel} />
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-line p-10 text-center">
          <p className="text-lg text-ink-2">{t.empty}</p>
          <Link href="/ajluud" className="mt-4 inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4">
            {t.clear}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <ProjectCard project={p} priority={i < 3} sizes="(min-width: 1280px) 26rem, (min-width: 640px) 50vw, 100vw" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({ href, active, label, count }: { href: string; active: boolean; label: string; count?: number }) {
  return (
    <li className="shrink-0">
      <Link
        href={href}
        scroll={false}
        aria-current={active ? "page" : undefined}
        className={
          "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-base font-semibold whitespace-nowrap transition-colors duration-150 " +
          (active ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink hover:border-ink-2")
        }
      >
        {label}
        {count ? <span className={`tabular ${active ? "text-bg/70" : "text-ink-2"}`}>{count}</span> : null}
      </Link>
    </li>
  );
}
