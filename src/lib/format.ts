// Mongolian typographic formatting. Everything user-visible that contains a
// number goes through here so spacing and symbols are consistent.

export const NBSP = " ";

/** 1250000 → "1 250 000₮" with no-break spaces (the only space both fonts contain). */
export function money(value: number): string {
  return `${groupDigits(Math.round(value))}${NBSP}₮`;
}

export function groupDigits(value: number): string {
  const sign = value < 0 ? "−" : "";
  return sign + Math.abs(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

/** Decimal-ish quantity: 12.5 → "12,5"; 3 → "3". */
export function quantity(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  const rounded = Math.round(n * 100) / 100;
  const [int, frac] = rounded.toString().split(".");
  return groupDigits(Number(int)) + (frac ? `,${frac}` : "");
}

export function area(m2: number | string): string {
  return `${quantity(m2)}${NBSP}м²`;
}

export function days(n: number): string {
  return `${n}${NBSP}хоног`;
}

const MONTHS = [
  "1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар",
  "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар",
];

/** 2026-10-19 → "2026 оны 10-р сарын 19". Uses UTC (dates are stored as DATE). */
export function longDate(d: Date): string {
  return `${d.getUTCFullYear()} оны ${d.getUTCMonth() + 1}-р сарын ${d.getUTCDate()}`;
}

/** 2026-10-19 → "2026.10.19" */
export function shortDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}.${p(d.getUTCMonth() + 1)}.${p(d.getUTCDate())}`;
}

/** "10-р сар 2026" */
export function monthYear(d: Date): string {
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Wrap in Mongolian guillemets. */
export function quote(text: string): string {
  return `«${text}»`;
}
