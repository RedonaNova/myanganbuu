import Link from "next/link";
import { getProjectCards } from "@/lib/queries";
import type { ServiceSlug } from "@/lib/catalog";
import { shareLabels } from "@/lib/labels";
import { ProjectCard } from "@/components/site/project-card";
import { FacebookShare } from "@/components/facebook-share";
import { ShareButton } from "@/components/share-button";
import { projectPage, projectsPage as t, serviceNames } from "@/messages/mn";

const shareClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-line text-base font-semibold transition-colors duration-150 hover:border-ink-2 sm:px-4";
// Icon-only on phones so both buttons sit beside the count on one row.
const shareLabel = "sr-only sm:not-sr-only";

/**
 * The works list, for all work or one type. Each type is its own page with
 * its own URL and Facebook preview, so he can share "my facade work" directly.
 * The heading and type chips above it live in the shared (list) layout.
 */
export async function WorksView({ service }: { service?: ServiceSlug }) {
  const projects = await getProjectCards({ service });
  const title = service ? serviceNames[service] : t.title;
  // The selected type has its own page, so the share carries the type.
  const url = service ? `/ajluud/torol/${service}` : "/ajluud";
  const countLabel = `${projects.length} ${t.count}`;

  return (
    <>
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
    </>
  );
}
