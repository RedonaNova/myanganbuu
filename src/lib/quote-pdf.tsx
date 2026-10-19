import "server-only";
import path from "node:path";
import { Document, Font, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { PublicQuote } from "@/lib/quotes";
import { quoteNumber } from "@/lib/quotes";
import { longDate, money, quantity } from "@/lib/format";
import { quotes, site } from "@/messages/mn";

const t = quotes.public;
const fontDir = path.join(process.cwd(), "assets/fonts");

// Same faces as the site; static TTF instances with Mongolian Ө/Ү and ₮.
Font.register({
  family: "Manrope",
  fonts: [
    { src: path.join(fontDir, "Manrope-400.ttf"), fontWeight: 400 },
    { src: path.join(fontDir, "Manrope-600.ttf"), fontWeight: 600 },
    { src: path.join(fontDir, "Manrope-700.ttf"), fontWeight: 700 },
  ],
});
Font.register({ family: "Geologica", src: path.join(fontDir, "Geologica-700.ttf"), fontWeight: 700 });
// Never hyphenate Mongolian words.
Font.registerHyphenationCallback((word) => [word]);

const ink = "#1a1714";
const muted = "#5e574f";
const line = "#ddd6cb";
const accent = "#a8461f";

const s = StyleSheet.create({
  page: { fontFamily: "Manrope", fontSize: 10.5, color: ink, paddingTop: 48, paddingBottom: 56, paddingHorizontal: 48 },
  brand: { fontFamily: "Geologica", fontSize: 14 },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontFamily: "Geologica", fontSize: 28, marginTop: 28 },
  muted: { color: muted },
  client: { marginTop: 24, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: line },
  label: { fontSize: 9, color: muted, fontWeight: 600 },
  th: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderColor: ink, marginTop: 24 },
  tr: { flexDirection: "row", paddingVertical: 9, borderBottomWidth: 0.6, borderColor: line },
  cWork: { flex: 1, paddingRight: 8 },
  cQty: { width: 70, textAlign: "right" },
  cPrice: { width: 80, textAlign: "right" },
  cSum: { width: 90, textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14, padding: 14, backgroundColor: ink, color: "#f5f2ec", borderRadius: 6 },
  total: { fontFamily: "Geologica", fontSize: 18 },
  notes: { marginTop: 18, lineHeight: 1.5 },
  note: { marginTop: 10, padding: 10, backgroundColor: "#ece7df", borderRadius: 6 },
  footer: { position: "absolute", left: 48, right: 48, bottom: 28, flexDirection: "row", justifyContent: "space-between", fontSize: 8.5, color: muted },
});

function QuoteDocument({ quote, contact }: { quote: PublicQuote; contact: string }) {
  return (
    <Document title={`${t.heading} ${quoteNumber(quote.id)}`} author={site.name} language="mn">
      <Page size="A4" style={s.page}>
        <View style={s.headRow}>
          <Text style={s.brand}>{site.name}</Text>
          <View>
            <Text style={[s.muted, { textAlign: "right" }]}>{quoteNumber(quote.id)}</Text>
            <Text style={[s.muted, { textAlign: "right" }]}>{longDate(quote.createdAt)}</Text>
          </View>
        </View>
        <Text style={s.title}>{t.heading}</Text>

        {(quote.clientName || quote.address) && (
          <View style={s.client}>
            <Text style={s.label}>{t.for}</Text>
            {quote.clientName ? <Text style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{quote.clientName}</Text> : null}
            {quote.address ? <Text style={s.muted}>{quote.address}</Text> : null}
          </View>
        )}

        <View style={s.th} fixed>
          <Text style={[s.cWork, s.label]}>{t.work}</Text>
          <Text style={[s.cQty, s.label]}>{t.qty}</Text>
          <Text style={[s.cPrice, s.label]}>{t.price}</Text>
          <Text style={[s.cSum, s.label]}>{t.sum}</Text>
        </View>
        {quote.lines.map((l, i) => (
          <View key={i} style={s.tr} wrap={false}>
            <Text style={[s.cWork, { fontWeight: 600 }]}>{l.label}</Text>
            <Text style={s.cQty}>{`${quantity(l.quantity)} ${l.unit}`}</Text>
            <Text style={s.cPrice}>{money(l.unitPrice)}</Text>
            <Text style={[s.cSum, { fontWeight: 600 }]}>{money(l.total)}</Text>
          </View>
        ))}

        <View style={s.totalRow} wrap={false}>
          <Text style={{ fontWeight: 600, fontSize: 12 }}>{t.total}</Text>
          <Text style={s.total}>{money(quote.total)}</Text>
        </View>

        <View style={s.notes} wrap={false}>
          <Text style={{ fontWeight: 700 }}>{quote.includesMaterials ? t.materialsIncluded : t.materialsExcluded}</Text>
          <Text>
            {`${t.validUntil}: `}
            <Text style={{ fontWeight: 700, color: accent }}>{longDate(quote.validUntil)}</Text>
          </Text>
          {quote.note ? (
            <View style={s.note}>
              <Text style={s.label}>{t.note}</Text>
              <Text>{quote.note}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.footer} fixed>
          <Text>{`${site.name} · ${site.city} · ${contact}`}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export function renderQuotePdf(quote: PublicQuote, contact: string) {
  return renderToBuffer(<QuoteDocument quote={quote} contact={contact} />);
}
