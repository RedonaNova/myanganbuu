// App icons: a "М" monogram drawn from Geologica's own glyph outline, so no
// font needs to be installed where sharp renders the SVG.
//   npm run icons
import { writeFile } from "node:fs/promises";
import * as fontkit from "fontkit";
import sharp from "sharp";

const font = fontkit.openSync("assets/fonts/Geologica-700.ttf");
const glyph = font.glyphsForString("М")[0];
const { minX, minY, maxX, maxY } = glyph.bbox;
const ACCENT = "#2c5a46";
const PAPER = "#f3f2ee";

/** SVG of the letter centered in a square of `size`, letter height `scale` × size. */
function svg({ size, bg, fg, scale, radius = 0 }) {
  const h = maxY - minY;
  const k = (size * scale) / h;
  const w = (maxX - minX) * k;
  const tx = (size - w) / 2 - minX * k;
  const ty = (size + h * k) / 2 + minY * k;
  const rect = bg ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>` : "";
  // Font units are y-up; flip vertically.
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${rect}` +
      `<path transform="translate(${tx} ${ty}) scale(${k} ${-k})" fill="${fg}" d="${glyph.path.toSVG()}"/></svg>`,
  );
}

const out = [
  ["public/icon-192.png", { size: 192, bg: ACCENT, fg: PAPER, scale: 0.46, radius: 42 }],
  ["public/icon-512.png", { size: 512, bg: ACCENT, fg: PAPER, scale: 0.46, radius: 112 }],
  // Maskable: full bleed, letter inside the 80% safe zone.
  ["public/icon-maskable-512.png", { size: 512, bg: ACCENT, fg: PAPER, scale: 0.36 }],
  // Android status-bar badge: white silhouette on transparent.
  ["public/badge-72.png", { size: 72, bg: null, fg: "#ffffff", scale: 0.62 }],
  ["src/app/icon.png", { size: 64, bg: ACCENT, fg: PAPER, scale: 0.5, radius: 14 }],
  ["src/app/apple-icon.png", { size: 180, bg: ACCENT, fg: PAPER, scale: 0.46 }],
];
for (const [file, opts] of out) {
  await writeFile(file, await sharp(svg(opts)).png().toBuffer());
  console.log(file);
}
