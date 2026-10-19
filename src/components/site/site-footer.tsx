import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { getSettings, messengerLink, viberLink } from "@/lib/settings";
import { SERVICE_SLUGS } from "@/lib/catalog";
import { footer as t, nav, serviceNames, site } from "@/messages/mn";

export async function SiteFooter() {
  "use cache";
  cacheLife("days");
  cacheTag("settings");
  const settings = await getSettings();
  const viber = viberLink(settings);
  const copyright = `© ${new Date().getFullYear()} ${site.name}. `;

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-page grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div>
          <p className="font-display text-3xl font-bold tracking-tight">{site.name}</p>
          <p className="mt-3 max-w-sm text-lg text-ink-2">{site.tagline}</p>
          <p className="mt-6 text-base text-ink-2">{t.area}</p>
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-[0.14em] text-ink-2 uppercase">{t.contactTitle}</h2>
          <p className="mt-4 max-w-xs text-base text-ink-2">{t.textFirst}</p>
          <ul className="mt-5 space-y-1 text-lg font-semibold">
            <li>
              <a href={messengerLink(settings)} className="inline-flex min-h-11 items-center hover:text-accent" rel="noopener">
                {t.messenger}
              </a>
            </li>
            {viber && (
              <li>
                <a href={viber} className="inline-flex min-h-11 items-center hover:text-accent">
                  {t.viber}
                </a>
              </li>
            )}
            <li>
              <Link href="/holboo-barikh" className="inline-flex min-h-11 items-center hover:text-accent">
                {t.form}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-[0.14em] text-ink-2 uppercase">{nav.services}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-base md:grid-cols-1">
            {SERVICE_SLUGS.map((s) => (
              <li key={s}>
                <Link href={`/uilchilgee/${s}`} className="inline-flex min-h-10 items-center text-ink-2 hover:text-ink">
                  {serviceNames[s]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-page flex flex-wrap items-center justify-between gap-2 border-t border-line py-6 text-sm text-ink-2">
        <p>
          {copyright}
          {t.rights}
        </p>
        <a href={settings.facebookUrl} rel="noopener" className="inline-flex min-h-10 items-center hover:text-ink">
          {t.facebook}
        </a>
      </div>
    </footer>
  );
}
