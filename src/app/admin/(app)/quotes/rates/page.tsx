import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/admin/page-header";
import { RateCard } from "./rate-card";
import { quotes } from "@/messages/mn";

export default async function RatesPage() {
  await requireAdmin();
  const items = await db.rateItem.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <>
      <PageHeader title={quotes.rates.title} backHref="/admin/quotes" />
      <div className="container-page max-w-2xl">
        <p className="mb-6 text-base text-ink-2">{quotes.rates.intro}</p>
        <RateCard
          initial={items.map((i) => ({ id: i.id, label: i.label, unit: i.unit, unitPrice: i.unitPrice, category: i.category }))}
        />
      </div>
    </>
  );
}
