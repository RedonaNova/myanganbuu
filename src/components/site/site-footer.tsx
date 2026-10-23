import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { getSettings, instagramLink, showcaseOrder, viberLink } from "@/lib/settings";
import { FacebookIcon, INSTAGRAM, InstagramIcon, ViberIcon } from "@/components/site/contact";
import { contact, footer as t, nav, serviceNames, site } from "@/messages/mn";

export async function SiteFooter() {
  "use cache";
  cacheLife("days");
  cacheTag("settings");
  const settings = await getSettings();
  const viber = viberLink(settings);
  const instagram = instagramLink(settings);
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
          <h2 className="text-base font-bold">{t.contactTitle}</h2>
          <p className="mt-4 max-w-xs text-base text-ink-2">{t.textFirst}</p>
          <ul className="mt-5 space-y-1 text-lg font-semibold">
            <li>
              <a href={settings.facebookUrl} className="inline-flex min-h-11 items-center gap-2.5 hover:text-accent" rel="noopener">
                <span className="grid size-8 place-items-center rounded-full text-white" style={{ backgroundColor: "#0866ff" }}>
                  <FacebookIcon size={18} />
                </span>
                {contact.facebook}
              </a>
            </li>
            {viber && (
              <li>
                <a href={viber} className="inline-flex min-h-11 items-center gap-2.5 hover:text-accent">
                  <span className="grid size-8 place-items-center rounded-full text-white" style={{ backgroundColor: "#665cac" }}>
                    <ViberIcon size={18} />
                  </span>
                  {contact.viber}
                </a>
              </li>
            )}
            {instagram && (
              <li>
                <a href={instagram} rel="noopener" className="inline-flex min-h-11 items-center gap-2.5 hover:text-accent">
                  <span className="grid size-8 place-items-center rounded-full text-white" style={{ backgroundImage: INSTAGRAM }}>
                    <InstagramIcon size={18} />
                  </span>
                  {contact.instagram}
                </a>
              </li>
            )}
            <li>
              <Link href="/minii-tukhai" className="inline-flex min-h-11 items-center hover:text-accent">
                {nav.about}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold">{nav.services}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-base md:grid-cols-1">
            {showcaseOrder(settings).filter((o) => !o.hidden).map(({ slug: s }) => (
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
      </div>
    </footer>
  );
}
