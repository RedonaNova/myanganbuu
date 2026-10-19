import { getQuoteByToken, quoteNumber } from "@/lib/quotes";
import { getSettings } from "@/lib/settings";
import { renderQuotePdf } from "@/lib/quote-pdf";

export async function GET(_request: Request, ctx: RouteContext<"/une/[token]/pdf">) {
  const quote = await getQuoteByToken((await ctx.params).token);
  if (!quote) return new Response(null, { status: 404 });
  const settings = await getSettings();
  const pdf = await renderQuotePdf(quote, settings.facebookUrl.replace(/^https?:\/\/(www\.)?/, ""));
  const name = `une-${quoteNumber(quote.id).replace(/\D/g, "")}.pdf`;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
