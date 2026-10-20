import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { variantDir } from "@/lib/images";
import { site } from "@/messages/mn";

// Facebook link previews: a dark text panel and his real photos. Shared by
// the home, works-by-type, project and about images.

export const OG_SIZE = { width: 1200, height: 630 };

const fonts = Promise.all([
  readFile(path.join(process.cwd(), "assets/fonts/Geologica-700.ttf")),
  readFile(path.join(process.cwd(), "assets/fonts/Manrope-600.ttf")),
]);

/** JPEG data URL for a /media/<key> photo, or null. */
export async function photoDataUrl(src: string | undefined | null) {
  if (!src) return null;
  const key = src.split("/").pop()!;
  const jpg = await readFile(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ variantDir("public", key), "1200.jpg")).catch(() => null);
  return jpg ? `data:image/jpeg;base64,${jpg.toString("base64")}` : null;
}

export async function ogImage({ title, subtitle, photos }: { title: string; subtitle: string; photos: (string | null)[] }) {
  const [display, text] = await fonts;
  const pics = photos.filter((p): p is string => !!p).slice(0, 3);
  const signature = `${site.name}, ${site.city}`;
  const img = (src: string, w: number, h: number) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={w} height={h} style={{ width: w, height: h, objectFit: "cover" }} />
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#191a17" }}>
        <div
          style={{
            width: pics.length ? 560 : 1200,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 48px 52px 60px",
            color: "#f3f2ee",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", fontFamily: "Manrope", fontSize: 26 }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: "#8cc5a5", marginRight: 14 }} />
            {signature}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Geologica", fontSize: title.length > 60 ? 44 : 54, lineHeight: 1.08, letterSpacing: -1 }}>{title}</div>
            <div style={{ fontFamily: "Manrope", fontSize: 24, marginTop: 22, color: "rgba(243,242,238,0.72)", lineHeight: 1.4 }}>{subtitle}</div>
          </div>
        </div>
        {pics.length === 1 && img(pics[0], 640, 630)}
        {pics.length === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {img(pics[0], 640, 312)}
            {img(pics[1], 640, 312)}
          </div>
        )}
        {pics.length === 3 && (
          <div style={{ display: "flex", gap: 6 }}>
            {img(pics[0], 380, 630)}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {img(pics[1], 254, 312)}
              {img(pics[2], 254, 312)}
            </div>
          </div>
        )}
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Geologica", data: display, weight: 700, style: "normal" },
        { name: "Manrope", data: text, weight: 600, style: "normal" },
      ],
    },
  );
}
