"use client";

import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { useEffect, useRef } from "react";

type Type = { slug: string; name: string; short: string; count: number };
type Props = { types: Type[]; labels: { title: string; intro: string; all: string; filter: string } };

/**
 * Heading and type chips for /ajluud and /ajluud/torol/<type>. It lives in the
 * shared layout, so switching type keeps the chip row (and how far it is
 * scrolled sideways) in place; only the list below changes.
 */
export function WorksTabs(props: Props) {
  const segments = useSelectedLayoutSegments();
  const active = segments[0] === "torol" ? props.types.find((x) => x.slug === segments[1]) : undefined;
  return <TabsView {...props} active={active} />;
}

/**
 * The same markup with nothing selected. The layout uses it as the Suspense
 * fallback, since reading the route is URL data that can't be in the shared
 * shell; every prerendered page still ships with the right chip selected.
 */
export function WorksTabsFallback(props: Props) {
  return <TabsView {...props} />;
}

function TabsView({ types, labels: t, active }: Props & { active?: Type }) {
  const listRef = useRef<HTMLUListElement>(null);

  // Opened straight on a type further along the row: bring its chip into view once.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>("[aria-current=page]")?.scrollIntoView({ block: "nearest", inline: "center" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {active && (
        <Link href="/ajluud" className="text-base font-semibold text-ink-2 underline-offset-4 hover:text-ink hover:underline">
          {t.title}
        </Link>
      )}
      <h1 className="mt-2 max-w-4xl text-[2.5rem] leading-[1.05] font-bold md:text-7xl">{active ? active.name : t.title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-2 md:text-xl">{active ? active.short : t.intro}</p>

      <nav aria-label={t.filter} className="mt-10">
        <ul ref={listRef} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip href="/ajluud" active={!active} label={t.all} />
          {types.map((x) => (
            <Chip key={x.slug} href={`/ajluud/torol/${x.slug}`} active={active?.slug === x.slug} label={x.name} count={x.count} />
          ))}
        </ul>
      </nav>
    </>
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
