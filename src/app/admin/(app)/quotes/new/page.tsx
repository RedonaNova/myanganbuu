import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/admin/page-header";
import { QuoteBuilder } from "../quote-builder";
import { quotes } from "@/messages/mn";

function inTwoWeeks() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 14);
  return d.toISOString().slice(0, 10);
}

export default async function NewQuotePage({ searchParams }: PageProps<"/admin/quotes/new">) {
  await requireAdmin();
  const inquiryId = Number((await searchParams).inquiry) || null;
  const [rates, inquiry] = await Promise.all([
    db.rateItem.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    inquiryId ? db.inquiry.findUnique({ where: { id: inquiryId } }) : null,
  ]);

  return (
    <>
      <PageHeader title={quotes.newQuote} backHref={inquiry ? `/admin/inquiries/${inquiry.id}` : "/admin/quotes"} />
      <QuoteBuilder
        siteUrl={process.env.SITE_URL ?? ""}
        rates={rates.map((r) => ({ id: r.id, label: r.label, unit: r.unit, unitPrice: r.unitPrice, category: r.category }))}
        initial={{
          id: null,
          token: null,
          inquiryId: inquiry?.id ?? null,
          clientName: inquiry?.name ?? "",
          address: inquiry?.district ?? "",
          note: "",
          includesMaterials: false,
          validUntil: inTwoWeeks(),
          lines: [],
        }}
      />
    </>
  );
}
