import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getProjectCards } from "@/lib/queries";
import { ROOMS, SERVICE_SLUGS, isRoom, isServiceSlug } from "@/lib/catalog";
import { ProjectCard } from "@/components/site/project-card";
import { projectsPage as t, rooms, serviceNames } from "@/messages/mn";

export const metadata: Metadata = {
  title: t.title,
  description: t.intro,
  alternates: { canonical: "/tusul" },
};

export default function ProjectsPage({ searchParams }: PageProps<"/tusul">) {
  return (
    <div className="container-page pt-10 md:pt-16">
      <h1 className="max-w-3xl text-[2.5rem] leading-[1.05] font-bold md:text-7xl">{t.title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-2 md:text-xl">{t.intro}</p>
      <Suspense fallback={<GridSkeleton />}>
        <FilteredGrid searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function FilteredGrid({ searchParams }: Pick<PageProps<"/tusul">, "searchParams">) {
  const sp = await searchParams;
  const room = typeof sp.room === "string" && isRoom(sp.room) ? sp.room : undefined;
  const service = typeof sp.service === "string" && isServiceSlug(sp.service) ? sp.service : undefined;
  const projects = await getProjectCards({ room, service });

  const href = (next: { room?: string; service?: string }) => {
    const q = new URLSearchParams();
    if (next.room) q.set("room", next.room);
    if (next.service) q.set("service", next.service);
    const s = q.toString();
    return s ? `/tusul?${s}` : "/tusul";
  };

  const countLabel = `${projects.length} ${t.count}`;

  return (
    <>
      <div className="mt-10 space-y-3">
        <FilterRow
          label={t.room}
          items={[
            { label: t.all, href: href({ service }), active: !room },
            ...ROOMS.filter((r) => r !== "OTHER").map((r) => ({
              label: rooms[r],
              href: href({ room: r, service }),
              active: room === r,
            })),
          ]}
        />
        <FilterRow
          label={t.service}
          items={[
            { label: t.all, href: href({ room }), active: !service },
            ...SERVICE_SLUGS.map((s) => ({ label: serviceNames[s], href: href({ room, service: s }), active: service === s })),
          ]}
        />
      </div>

      <p className="mt-8 text-base text-ink-2 tabular" aria-live="polite">
        {countLabel}
      </p>

      {projects.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-line p-10 text-center">
          <p className="text-lg text-ink-2">{t.empty}</p>
          <Link href="/tusul" className="mt-4 inline-flex min-h-11 items-center font-semibold text-accent">
            {t.clear}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 md:gap-6">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <ProjectCard project={p} priority={i < 2} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FilterRow({ label, items }: { label: string; items: { label: string; href: string; active: boolean }[] }) {
  return (
    <nav aria-label={label}>
      {/* Bleeds to the screen edge on phones and scrolls sideways. */}
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {items.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              scroll={false}
              aria-current={item.active ? "page" : undefined}
              className={
                "inline-flex min-h-11 items-center rounded-full border px-4 text-base font-semibold whitespace-nowrap transition-colors duration-150 " +
                (item.active ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink hover:border-ink-2")
              }
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-10 animate-pulse" aria-hidden="true">
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-11 w-24 rounded-full bg-surface-2" />
        ))}
      </div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 md:gap-6">
        <div className="aspect-[4/5] rounded-card bg-surface-2 sm:aspect-[5/4]" />
        <div className="aspect-[4/5] rounded-card bg-surface-2 sm:aspect-[5/4]" />
      </div>
    </div>
  );
}
