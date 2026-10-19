// Fails if any character used in UI copy or seed data is missing from the
// fonts. Many display fonts lack Mongolian Ө/Ү or the ₮ sign; this keeps a
// font swap from silently breaking text.
import { existsSync, readFileSync } from "node:fs";
import * as fontkit from "fontkit";

const fonts = ["src/fonts/Geologica.woff2", "src/fonts/Manrope.woff2", "assets/fonts/Manrope-400.ttf"];
const sources = ["src/messages/mn.ts", "src/content/services.ts", "prisma/seed.ts"].filter(existsSync);

// Characters inside "…", '…' and `…` string literals; comments are stripped.
const LITERAL = /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g;
const COMMENT = /\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm;

const chars = new Set<string>([" "]); // NBSP, used by src/lib/format.ts
for (const file of sources) {
  const code = readFileSync(file, "utf8").replace(COMMENT, "");
  for (const m of code.matchAll(LITERAL)) {
    for (const ch of m[1] ?? m[2] ?? m[3] ?? "") {
      if (!/[\s\\]/.test(ch) || ch === " ") chars.add(ch);
    }
  }
}

// House style: no em dashes anywhere in the copy.
let failed = chars.has("—");
if (failed) console.error("✗ Em dash (U+2014) found in copy. Use a colon, comma or period instead.");

for (const path of fonts) {
  const font = fontkit.openSync(path) as fontkit.Font;
  const missing = [...chars].filter((ch) => !font.hasGlyphForCodePoint(ch.codePointAt(0)!));
  if (missing.length) {
    failed = true;
    const list = missing.map((c) => `${c} (U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")})`);
    console.error(`✗ ${path} is missing: ${list.join(", ")}`);
  } else {
    console.log(`✓ ${path} covers all ${chars.size} characters`);
  }
}
process.exit(failed ? 1 : 0);
