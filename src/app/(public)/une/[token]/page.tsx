import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { getQuoteByToken, quoteNumber, type PublicQuote } from "@/lib/quotes";
import { getSettings } from "@/lib/settings";
import { ContactButtons } from "@/components/site/contact";
import { longDate, money, quantity } from "@/lib/format";
import { quotes, site } from "@/messages/mn";

const t = quotes.public;

export const metadata: Metadata = {
  title: t.heading,
  robots: { index: false, follow: false },
};

export default function QuotePage({ params }: PageProps<"/une/[token]">) {
  return (
    <div className="container-page max-w-3xl pt-8 md:pt-14">
      <Suspense fallback={<div className="h-[40rem] animate-pulse rounded-card bg-surface-2" />}>
        <QuoteContent params={params} />
      </Suspense>
    </div>
  );
}

async function QuoteContent({ params }: Pick<PageProps<"/une/[token]">, "params">) {
  const { token } = await params;
  const quote = await getQuoteByToken(token);
  if (!quote) notFound();
  const settings = await getSettings();
  const expired = await isExpired(quote);
  const created = `${t.date}: ${longDate(quote.createdAt)}`;

  return (
    <>
      {expired && (
        <p role="status" className="mb-4 rounded-2xl bg-danger/10 p-4 text-base font-semibold text-danger">
          {t.expired}
        </p>
      )}
      <article className="overflow-hidden rounded-card border border-line bg-surface">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-6 md:p-10">
          <div>
            <p className="font-display text-xl font-bold">{site.name}</p>
            <h1 className="mt-6 text-4xl font-bold md:text-5xl">{t.heading}</h1>
            <p className="mt-2 text-base text-ink-2 tabular">{quoteNumber(quote.id)}</p>
          </div>
          <p className="text-base text-ink-2 tabular">{created}</p>
        </header>

        {(quote.clientName || quote.address) && (
          <section className="border-b border-line px-6 py-5 md:px-10">
            <p className="text-sm font-semibold text-ink-2">{t.for}</p>
            {quote.clientName && <p className="mt-1 text-xl font-bold">{quote.clientName}</p>}
            {quote.address && <p className="text-base text-ink-2">{quote.address}</p>}
          </section>
        )}

        <table className="w-full text-left">
          <thead className="text-sm text-ink-2">
            <tr className="border-b border-line">
              <th scope="col" className="py-3 pl-6 font-semibold md:pl-10">
                {t.work}
              </th>
              <th scope="col" className="hidden py-3 text-right font-semibold md:table-cell">
                {t.qty}
              </th>
              <th scope="col" className="hidden py-3 pl-6 text-right font-semibold md:table-cell">
                {t.price}
              </th>
              <th scope="col" className="py-3 pr-6 pl-4 text-right font-semibold md:pr-10">
                {t.sum}
              </th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((l, i) => {
              const qty = `${quantity(l.quantity)} ${l.unit}`;
              const mobileDetail = `${qty} × ${money(l.unitPrice)}`;
              return (
                <tr key={i} className="border-b border-line align-top last:border-0">
                  <td className="py-4 pl-6 md:pl-10">
                    <span className="block text-lg leading-snug font-semibold">{l.label}</span>
                    <span className="mt-1 block text-base text-ink-2 tabular md:hidden">{mobileDetail}</span>
                  </td>
                  <td className="hidden py-4 text-right text-base whitespace-nowrap tabular md:table-cell">{qty}</td>
                  <td className="hidden py-4 pl-6 text-right text-base whitespace-nowrap tabular md:table-cell">{money(l.unitPrice)}</td>
                  <td className="py-4 pr-6 pl-4 text-right text-lg font-semibold whitespace-nowrap tabular md:pr-10">{money(l.total)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-ink text-bg">
              <th scope="row" colSpan={1} className="py-6 pl-6 text-lg font-semibold md:pl-10">
                {t.total}
              </th>
              <td className="hidden md:table-cell" />
              <td className="hidden md:table-cell" />
              <td className="py-6 pr-6 pl-4 text-right font-display text-2xl font-bold whitespace-nowrap tabular md:pr-10 md:text-3xl">
                {money(quote.total)}
              </td>
            </tr>
          </tfoot>
        </table>

        <section className="space-y-3 p-6 text-base md:p-10">
          <p className="font-semibold">{quote.includesMaterials ? t.materialsIncluded : t.materialsExcluded}</p>
          <p className={expired ? "text-danger" : "text-ink-2"}>
            {t.validUntil}
            {": "}
            <span className="font-semibold tabular">{longDate(quote.validUntil)}</span>
          </p>
          {quote.note && (
            <div className="rounded-2xl bg-surface-2 p-4">
              <p className="text-sm font-semibold text-ink-2">{t.note}</p>
              <p className="mt-1 whitespace-pre-line">{quote.note}</p>
            </div>
          )}
        </section>
      </article>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={`/une/${quote.token}/pdf`}
          className="inline-flex min-h-14 items-center justify-center rounded-full bg-ink px-7 text-lg font-semibold text-bg"
        >
          {t.download}
        </a>
      </div>
      <p className="mt-8 text-base text-ink-2">{t.questions}</p>
      <ContactButtons settings={settings} className="mt-4" />
    </>
  );
}

async function isExpired(quote: PublicQuote) {
  await connection();
  return quote.validUntil.toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10);
}
