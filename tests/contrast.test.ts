import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Parses the token blocks in globals.css and checks WCAG AA (4.5:1) for every
// text/background pair the UI uses, in light and dark mode.
const css = readFileSync("src/app/globals.css", "utf8");

function block(selector: string) {
  const start = css.indexOf(selector);
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const pairs: [string, string][] = [
  ["ink", "bg"], ["ink", "surface"], ["ink", "surface-2"],
  ["ink-2", "bg"], ["ink-2", "surface"], ["ink-2", "surface-2"],
  ["accent", "bg"], ["accent", "surface"], ["accent", "accent-soft"],
  ["accent-ink", "accent"], ["accent-ink", "accent-hover"],
  ["danger", "bg"], ["danger", "surface"], ["success", "surface"],
];

for (const [name, selector] of [["light", ":root {"], ["dark", ':root[data-theme="dark"]']] as const) {
  describe(`${name} palette`, () => {
    const t = block(selector);
    for (const [fg, bg] of pairs) {
      it(`${fg} on ${bg} ≥ 4.5`, () => {
        expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
      });
    }
  });
}
