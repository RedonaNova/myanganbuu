import { describe, expect, it } from "vitest";
import { area, days, groupDigits, longDate, money, quantity, shortDate } from "@/lib/format";
import { slugify } from "@/lib/slug";

const NB = " ";

describe("format", () => {
  it("groups thousands with no-break spaces", () => {
    expect(groupDigits(1250000)).toBe(`1${NB}250${NB}000`);
    expect(groupDigits(999)).toBe("999");
  });
  it("formats money in tögrög", () => {
    expect(money(45000)).toBe(`45${NB}000${NB}₮`);
    expect(money(12.6)).toBe(`13${NB}₮`);
  });
  it("formats decimal quantities with a comma", () => {
    expect(quantity(12.5)).toBe("12,5");
    expect(quantity("3.00")).toBe("3");
    expect(quantity(1.005)).toBe("1");
  });
  it("keeps units attached", () => {
    expect(area(52)).toBe(`52${NB}м²`);
    expect(days(12)).toBe(`12${NB}хоног`);
  });
  it("formats Mongolian dates", () => {
    const d = new Date(Date.UTC(2026, 9, 19));
    expect(longDate(d)).toBe("2026 оны 10-р сарын 19");
    expect(shortDate(d)).toBe("2026.10.19");
  });
});

describe("slugify", () => {
  it("transliterates Mongolian Cyrillic", () => {
    expect(slugify("Угаалгын өрөө — Баянзүрх")).toBe("ugaalgyn-oroo-bayanzurkh");
    expect(slugify("Хан-Уул, 3 өрөө байр")).toBe("khan-uul-3-oroo-bair");
    expect(slugify("  Шинэ  гал тогоо!! ")).toBe("shine-gal-togoo");
  });
});
