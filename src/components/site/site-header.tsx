import Link from "next/link";
import { IconMessage } from "@/components/icons";
import { nav, site } from "@/messages/mn";

const links = [
  { href: "/ajluud", label: nav.projects },
  { href: "/uilchilgee", label: nav.services },
  { href: "/minii-tukhai", label: nav.about },
];

/**
 * Wide screens: three links and the CTA. Phones: the CTA stays visible and the
 * links fold into a menu built on <details>, so it works without JS.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-2 md:h-20 md:gap-4">
        <Link href="/" className="mr-auto font-display text-xl font-bold tracking-tight md:text-2xl">
          {site.name}
        </Link>

        <nav aria-label={nav.main} className="hidden md:block">
          <ul className="flex items-center gap-1 text-base font-semibold">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center rounded-full px-3 text-ink-2 transition-colors duration-150 hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/holboo-barikh"
          className="ml-1 inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 text-base font-semibold whitespace-nowrap text-accent-ink transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.97] md:px-5"
        >
          <IconMessage size={18} />
          <span className="lg:hidden">{nav.ctaShort}</span>
          <span className="max-lg:hidden">{nav.cta}</span>
        </Link>

        <details className="group relative md:hidden">
          <summary
            aria-label={nav.menu}
            className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-line [&::-webkit-details-marker]:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="group-open:hidden">
              <path d="M4 8h16M4 16h16" />
            </svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="hidden group-open:block">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </summary>
          <nav aria-label={nav.main} className="absolute top-[calc(100%+0.5rem)] right-0 w-64 rounded-3xl border border-line bg-surface p-2 shadow-xl">
            <ul>
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="flex min-h-13 items-center rounded-2xl px-4 text-lg font-semibold hover:bg-surface-2">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
