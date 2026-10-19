import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/admin/page-header";
import { admin as t } from "@/messages/mn";

export default async function ProjectsPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title={t.projects.title} />
      <p className="container-page text-lg text-ink-2">{t.projects.empty}</p>
    </>
  );
}
