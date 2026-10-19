// Subsets the source fonts in assets/fonts-src to exactly the characters the
// site needs (Basic Latin + Mongolian Cyrillic + typographic punctuation + ₮),
// producing:
//   src/fonts/*.woff2      variable web fonts, loaded by next/font/local
//   assets/fonts/*.ttf     static instances for OG images (satori) and PDFs
//                          (react-pdf); neither supports variable fonts.
// Run: npm run fonts
import { readFile, writeFile, mkdir } from "node:fs/promises";
import subsetFont from "subset-font";

const ranges = [
  [0x20, 0x7e], // Basic Latin
  [0xa0, 0xa0], // no-break space
  [0xab, 0xab], // «
  [0xb2, 0xb2], // ²
  [0xb7, 0xb7], // ·
  [0xbb, 0xbb], // »
  [0xd7, 0xd7], // ×
  [0x400, 0x45f], // Cyrillic (Russian set)
  [0x4ae, 0x4af], // Ү ү
  [0x4e8, 0x4e9], // Ө ө
  [0x2009, 0x2009], // thin space
  [0x2010, 0x2014], // hyphens, – —
  [0x2018, 0x201e], // quotes
  [0x2022, 0x2022], // •
  [0x2026, 0x2026], // …
  [0x202f, 0x202f], // narrow no-break space
  [0x20ae, 0x20ae], // ₮
  [0x2116, 0x2116], // №
  [0x2190, 0x2193], // ← ↑ → ↓
];
const text = ranges
  .flatMap(([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)))
  .join("");

const jobs = [
  // Web: variable weight, other axes pinned.
  {
    src: "Geologica-VF.ttf",
    out: "src/fonts/Geologica.woff2",
    format: "woff2",
    axes: { wght: { min: 400, max: 800 }, CRSV: 0, SHRP: 0, slnt: 0 },
  },
  {
    src: "Manrope-VF.ttf",
    out: "src/fonts/Manrope.woff2",
    format: "woff2",
    axes: { wght: { min: 400, max: 800 } },
  },
  // Static instances for satori / react-pdf.
  ...[600, 700].map((w) => ({
    src: "Geologica-VF.ttf",
    out: `assets/fonts/Geologica-${w}.ttf`,
    format: "truetype",
    axes: { wght: w, CRSV: 0, SHRP: 0, slnt: 0 },
  })),
  ...[400, 600, 700].map((w) => ({
    src: "Manrope-VF.ttf",
    out: `assets/fonts/Manrope-${w}.ttf`,
    format: "truetype",
    axes: { wght: w },
  })),
];

await mkdir("src/fonts", { recursive: true });
await mkdir("assets/fonts", { recursive: true });
for (const job of jobs) {
  const input = await readFile(`assets/fonts-src/${job.src}`);
  const output = await subsetFont(input, text, {
    targetFormat: job.format,
    variationAxes: job.axes,
  });
  await writeFile(job.out, output);
  console.log(`${job.out}  ${(output.length / 1024).toFixed(1)} KB`);
}
