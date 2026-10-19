import localFont from "next/font/local";

// Subset variable fonts built by scripts/build-fonts.mjs. Both are verified to
// contain Ө ө Ү ү ₮ « » № (npm run check:glyphs).
export const geologica = localFont({
  src: [{ path: "../fonts/Geologica.woff2", weight: "400 800", style: "normal" }],
  variable: "--font-geologica",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export const manrope = localFont({
  src: [{ path: "../fonts/Manrope.woff2", weight: "400 800", style: "normal" }],
  variable: "--font-manrope",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});
