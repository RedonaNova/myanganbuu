import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { money, shortDate } from "@/lib/format";
import { lineTotal } from "@/lib/quote-math";
import { quoteNumber } from "@/lib/quotes";
import { PageHeader } from "@/components/admin/page-header";
import { cardClass, primaryButtonClass } from "@/components/admin/ui";
import { IconArrowRight, IconPlus, IconReceipt } from "@/components/icons";
import { quotes as t } from "@/messages/mn";

export default async function QuotesPage() {
  await requireAdmin();
  const [list, rateCount] = await Promise.all([
    db.quote.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { lines: true } }),
    db.rateItem.count(),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title={t.title}
        action={
          <Link href="/admin/quotes/new" className={`${primaryButtonClass} min-h-12 px-5 text-base`}>
            <IconPlus size={22} />
            {t.newQuote}
          </Link>
        }
      />
      <div className="container-page max-w-3xl space-y-6">
        <Link href="/admin/quotes/rates" className={`${cardClass} flex items-center gap-4 p-5 transition-colors duration-150 hover:border-accent`}>
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
            <IconReceipt size={28} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-bold">{t.rateCard}</span>
            <span className="block text-base text-ink-2">{t.rateCardHint}</span>
          </span>
          <span className="font-display text-lg font-bold text-ink-2 tabular">{rateCount}</span>
          <IconArrowRight className="shrink-0 text-ink-2" />
        </Link>

        {list.length === 0 ? (
          <p className="text-lg text-ink-2">{t.empty}</p>
        ) : (
          <ul className="space-y-3">
            {list.map((q) => {
              const total = q.lines.reduce((s, l) => s + lineTotal(l.unitPrice, Number(l.quantity)), 0);
              const expired = q.validUntil.toISOString().slice(0, 10) < today;
              const meta = `${quoteNumber(q.id)} · ${shortDate(q.createdAt)} · ${q.lines.length} ${t.lines}`;
              return (
                <li key={q.id}>
                  <Link href={`/admin/quotes/${q.id}`} className={`${cardClass} flex items-center gap-4 p-5 transition-colors duration-150 hover:border-ink-2`}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg font-bold">{q.clientName || t.noClient}</span>
                      <span className="block text-sm text-ink-2 tabular">{meta}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-display text-xl font-bold tabular">{money(total)}</span>
                      {expired && <span className="text-sm font-semibold text-danger">{t.expired}</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
