import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { getServiceShowcase } from "@/lib/queries";
import { logout } from "../../login/actions";
import { PageHeader } from "@/components/admin/page-header";
import { cardClass, secondaryButtonClass } from "@/components/admin/ui";
import { FacebookShare } from "@/components/facebook-share";
import { ShareButton } from "@/components/share-button";
import { IconArrowRight, IconLogout } from "@/components/icons";
import { SettingsForm } from "./settings-form";
import { PushToggle } from "./push-toggle";
import { shareLabels } from "@/lib/labels";
import { admin, adminSettings as t, projectPage, serviceNames } from "@/messages/mn";

const shareButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line px-3 text-sm font-semibold transition-colors duration-150 hover:border-ink-2";

export default async function SettingsPage() {
  const user = await requireAdmin();
  const [settings, types] = await Promise.all([getSettings(), getServiceShowcase()]);
  const base = process.env.SITE_URL ?? "";
  const shareRows = [
    { key: "all", label: t.shareAll, url: `${base}/ajluud`, count: null as number | null },
    ...types.filter((s) => s.count > 0).map((s) => ({ key: s.slug, label: serviceNames[s.slug], url: `${base}/ajluud/torol/${s.slug}`, count: s.count })),
  ];

  return (
    <>
      <PageHeader title={admin.settings.title} />
      <div className="container-page grid max-w-2xl gap-4">
        <section className={`${cardClass} p-2`} aria-labelledby="pages">
          <h2 id="pages" className="sr-only">
            {t.pagesTitle}
          </h2>
          <PageLink href="/admin/home" title={t.homePage} hint={t.homePageHint} />
          <PageLink href="/admin/about" title={t.aboutPage} hint={t.aboutPageHint} />
        </section>

        <section className={`${cardClass} p-5`} aria-labelledby="share">
          <h2 id="share" className="text-xl font-bold">
            {t.shareTitle}
          </h2>
          <p className="mt-1 text-base text-ink-2">{t.shareHint}</p>
          <ul className="mt-4 divide-y divide-line">
            {shareRows.map((row) => (
              <li key={row.key} className="py-4">
                <p className="text-lg font-semibold">
                  {row.label}
                  {row.count ? <span className="ml-2 text-base font-normal text-ink-2 tabular">{row.count}</span> : null}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <FacebookShare url={row.url} label={projectPage.shareFacebook} className={shareButton} />
                  <ShareButton title={row.label} url={row.url} labels={shareLabels} className={shareButton} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${cardClass} space-y-4 p-5`}>
          <h2 className="text-xl font-bold">{t.pushTitle}</h2>
          <p className="text-base text-ink-2">{t.pushBody}</p>
          <PushToggle />
        </section>

        <SettingsForm settings={settings} />

        <section className={`${cardClass} space-y-4 p-5`}>
          <h2 className="text-xl font-bold">{t.accountTitle}</h2>
          <p className="text-lg font-semibold">{user.username}</p>
          <form action={logout}>
            <button type="submit" className={`${secondaryButtonClass} w-full`}>
              <IconLogout />
              {admin.logout}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}

function PageLink({ href, title, hint }: { href: string; title: string; hint: string }) {
  return (
    <Link href={href} className="flex min-h-18 items-center gap-4 rounded-2xl px-3 py-3 transition-colors duration-150 hover:bg-surface-2">
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-bold">{title}</span>
        <span className="block text-base text-ink-2">{hint}</span>
      </span>
      <IconArrowRight className="shrink-0 text-ink-2" />
    </Link>
  );
}
