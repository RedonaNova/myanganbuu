// Gzipped first-load JavaScript for public pages of a running server.
//   node scripts/check-js-budget.mjs http://localhost:4000
// Fails when any page ships more than BUDGET_KB of script files. Inline
// scripts (mostly the page's serialized data) are reported separately.
import { gzipSync } from "node:zlib";

const base = process.argv[2] ?? "http://localhost:4000";
const pages = ["/", "/ajluud", "/ajluud/khausny-fasad-tagt", "/uilchilgee/siding", "/ajluud/torol/siding", "/minii-tukhai", "/holboo-barikh", "/uzuulekh"];
const BUDGET_KB = 150;
const kb = (bytes) => (bytes / 1024).toFixed(1);
let failed = false;

for (const page of pages) {
  const html = await (await fetch(base + page)).text();
  const tags = [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]);
  // noModule scripts are legacy polyfills that modern browsers never download.
  const srcs = [...new Set(tags.filter((t) => !/nomodule/i.test(t)).map((t) => /src="([^"]+)"/.exec(t)?.[1]).filter(Boolean))];

  let code = 0;
  for (const src of srcs) code += gzipSync(Buffer.from(await (await fetch(new URL(src, base))).arrayBuffer())).length;
  const inlineText = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join("");
  const inline = gzipSync(Buffer.from(inlineText)).length;

  const over = code / 1024 > BUDGET_KB;
  failed ||= over;
  console.log(`${over ? "✗" : "✓"} ${page.padEnd(34)} JS ${kb(code).padStart(6)} KB gz (${srcs.length} files)   inline data ${kb(inline)} KB`);
}
process.exit(failed ? 1 : 0);
