import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/admin/page-header";
import { admin as t } from "@/messages/mn";

export default async function QuotesPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title={t.quotes.title} />
      <p className="container-page text-lg text-ink-2">{t.quotes.empty}</p>
    </>
  );
}
