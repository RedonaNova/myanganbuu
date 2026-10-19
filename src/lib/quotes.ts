import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { lineTotal } from "@/lib/quote-math";

export type PublicQuote = {
  id: number;
  token: string;
  clientName: string;
  address: string;
  note: string;
  includesMaterials: boolean;
  validUntil: Date;
  createdAt: Date;
  lines: { label: string; unit: string; unitPrice: number; quantity: number; total: number }[];
  total: number;
};

export async function getQuoteByToken(token: string): Promise<PublicQuote | null> {
  "use cache";
  cacheLife("days");
  cacheTag(`quote:${token}`);
  if (!/^[\w-]{16,32}$/.test(token)) return null;
  const q = await db.quote.findUnique({
    where: { publicToken: token },
    include: { lines: { orderBy: { sortOrder: "asc" } } },
  });
  if (!q) return null;
  const lines = q.lines.map((l) => {
    const quantity = Number(l.quantity);
    return { label: l.label, unit: l.unit, unitPrice: l.unitPrice, quantity, total: lineTotal(l.unitPrice, quantity) };
  });
  return {
    id: q.id,
    token: q.publicToken,
    clientName: q.clientName,
    address: q.address,
    note: q.note,
    includesMaterials: q.includesMaterials,
    validUntil: q.validUntil,
    createdAt: q.createdAt,
    lines,
    total: lines.reduce((s, l) => s + l.total, 0),
  };
}

/** Human-friendly quote number, e.g. "№ 0042". */
export function quoteNumber(id: number) {
  return `№ ${String(id).padStart(4, "0")}`;
}
