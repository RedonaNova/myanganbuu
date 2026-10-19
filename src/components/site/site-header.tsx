import Link from "next/link";
import { nav, site } from "@/messages/mn";

// No JS: two links and a CTA fit on a phone, so there is no menu to open.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-4 md:h-20">
        <Link href="/" className="mr-auto font-display text-xl font-bold tracking-tight md:text-2xl">
          {site.name}
        </Link>
        <nav aria-label={nav.main}>
          <ul className="flex items-center gap-1 text-base font-semibold">
            <li>
              <Link href="/tusul" className="inline-flex min-h-11 items-center rounded-full px-3 text-ink-2 transition-colors duration-150 hover:text-ink">
                {nav.projects}
              </Link>
            </li>
            <li className="hidden sm:block">
              <Link href="/uilchilgee" className="inline-flex min-h-11 items-center rounded-full px-3 text-ink-2 transition-colors duration-150 hover:text-ink">
                {nav.services}
              </Link>
            </li>
          </ul>
        </nav>
        <Link
          href="/holboo-barikh"
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-base font-semibold whitespace-nowrap text-bg transition-transform duration-150 active:scale-[0.97] md:px-5"
        >
          <span className="sm:hidden">{nav.ctaShort}</span>
          <span className="hidden sm:inline">{nav.cta}</span>
        </Link>
      </div>
    </header>
  );
}
