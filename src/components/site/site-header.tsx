import Link from "next/link";
import { ContactTrigger } from "@/components/site/contact-dialog";
import { nav, site } from "@/messages/mn";

/** Two things only, on every screen size: his works, and a way to reach him. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-1 md:h-20 md:gap-3">
        <Link href="/" className="mr-auto font-display text-xl font-bold tracking-tight md:text-2xl">
          {site.name}
        </Link>
        <nav aria-label={nav.main}>
          <Link href="/ajluud" className="inline-flex min-h-11 items-center rounded-full px-3 text-base font-semibold text-ink-2 transition-colors duration-150 hover:text-ink md:px-4">
            {nav.projects}
          </Link>
        </nav>
        <ContactTrigger className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-base font-semibold whitespace-nowrap text-bg transition-transform duration-150 active:scale-[0.97]">
          {nav.contact}
        </ContactTrigger>
      </div>
    </header>
  );
}
