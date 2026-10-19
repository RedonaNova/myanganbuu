import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { quoteNumber } from "@/lib/quotes";
import { PageHeader } from "@/components/admin/page-header";
import { QuoteBuilder } from "../quote-builder";
import { quotes } from "@/messages/mn";

export default async function EditQuotePage({ params }: PageProps<"/admin/quotes/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  const [quote, rates] = await Promise.all([
    Number.isInteger(id) ? db.quote.findUnique({ where: { id }, include: { lines: { orderBy: { sortOrder: "asc" } } } }) : null,
    db.rateItem.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  if (!quote) notFound();

  return (
    <>
      <PageHeader title={`${quotes.title} ${quoteNumber(quote.id)}`} backHref="/admin/quotes" />
      <QuoteBuilder
        siteUrl={process.env.SITE_URL ?? ""}
        rates={rates.map((r) => ({ id: r.id, label: r.label, unit: r.unit, unitPrice: r.unitPrice, category: r.category }))}
        initial={{
          id: quote.id,
          token: quote.publicToken,
          inquiryId: quote.inquiryId,
          clientName: quote.clientName,
          address: quote.address,
          note: quote.note,
          includesMaterials: quote.includesMaterials,
          validUntil: quote.validUntil.toISOString().slice(0, 10),
          lines: quote.lines.map((l) => ({ label: l.label, unit: l.unit, unitPrice: l.unitPrice, quantity: Number(l.quantity) })),
        }}
      />
    </>
  );
}
