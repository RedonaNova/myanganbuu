// Shared by the builder (live totals) and the server (saved quote, PDF), so
// the client always sees exactly the number the PDF will print.

/** Quantity rounded to 2 decimals (12.345 → 12.35). */
export function normalizeQty(q: number): number {
  return Number.isFinite(q) && q > 0 ? Math.round(q * 100) / 100 : 0;
}

/** Whole tögrög for one line. */
export function lineTotal(unitPrice: number, quantity: number): number {
  return Math.round((Math.round(unitPrice) * Math.round(normalizeQty(quantity) * 100)) / 100);
}

export function quoteTotal(lines: { unitPrice: number; quantity: number }[]): number {
  return lines.reduce((sum, l) => sum + lineTotal(l.unitPrice, l.quantity), 0);
}

/** Parses "12,5" or "12.5" from a phone keypad. */
export function parseQty(input: string): number {
  return normalizeQty(Number(input.replace(",", ".").replace(/\s/g, "")));
}

/** Parses "45 000" or "45000" into whole tögrög. */
export function parseMoney(input: string): number {
  const n = Number(input.replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
