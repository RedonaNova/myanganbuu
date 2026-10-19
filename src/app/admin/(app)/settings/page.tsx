import { requireAdmin } from "@/lib/session";
import { logout } from "../../login/actions";
import { PageHeader } from "@/components/admin/page-header";
import { secondaryButtonClass } from "@/components/admin/ui";
import { IconLogout } from "@/components/icons";
import { admin as t } from "@/messages/mn";

export default async function SettingsPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title={t.settings.title} />
      <div className="container-page">
        <form action={logout}>
          <button type="submit" className={`${secondaryButtonClass} w-full md:w-auto`}>
            <IconLogout />
            {t.logout}
          </button>
        </form>
      </div>
    </>
  );
}
