import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { logout } from "../../login/actions";
import { PageHeader } from "@/components/admin/page-header";
import { cardClass, secondaryButtonClass } from "@/components/admin/ui";
import { IconLogout } from "@/components/icons";
import { DeleteSamplesButton, SettingsForm } from "./settings-form";
import { PushToggle } from "./push-toggle";
import { admin, adminSettings as t } from "@/messages/mn";

export default async function SettingsPage() {
  const user = await requireAdmin();
  const [settings, heroOptions, samples] = await Promise.all([
    getSettings(),
    db.project.findMany({
      where: { published: true, heroPairId: { not: null } },
      select: { id: true, title: true },
      orderBy: { completedAt: "desc" },
    }),
    db.project.count({ where: { isSample: true } }),
  ]);

  return (
    <>
      <PageHeader title={admin.settings.title} />
      <div className="container-page grid max-w-2xl gap-4">
        <section className={`${cardClass} space-y-4 p-5`}>
          <h2 className="text-xl font-bold">{t.pushTitle}</h2>
          <p className="text-base text-ink-2">{t.pushBody}</p>
          <PushToggle />
        </section>

        <SettingsForm settings={settings} heroOptions={heroOptions} />

        <section className={`${cardClass} space-y-4 p-5`}>
          <h2 className="text-xl font-bold">{t.samplesTitle}</h2>
          {samples > 0 ? (
            <>
              <p className="text-base text-ink-2">{t.samplesBody}</p>
              <DeleteSamplesButton />
            </>
          ) : (
            <p className="text-base text-ink-2">{t.samplesNone}</p>
          )}
        </section>

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
