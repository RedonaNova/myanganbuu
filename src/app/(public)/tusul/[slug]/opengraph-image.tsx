import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getProject } from "@/lib/queries";
import { variantDir } from "@/lib/images";
import { area, days } from "@/lib/format";
import { rooms, site } from "@/messages/mn";

// Facebook link preview: the finished photo, the title, and the key facts.
export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fonts = Promise.all([
  readFile(path.join(process.cwd(), "assets/fonts/Geologica-700.ttf")),
  readFile(path.join(process.cwd(), "assets/fonts/Manrope-600.ttf")),
]);

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const project = await getProject((await params).slug);
  const [display, text] = await fonts;

  let photo: string | null = null;
  const cover = project?.heroPair?.after ?? project?.cover;
  if (cover) {
    const key = cover.src.split("/").pop()!;
    const jpg = await readFile(
      /*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ variantDir("public", key), "1200.jpg"),
    ).catch(() => null);
    if (jpg) photo = `data:image/jpeg;base64,${jpg.toString("base64")}`;
  }

  const facts = project
    ? [rooms[project.room], project.district, project.areaM2 ? area(project.areaM2) : "", project.durationDays ? days(project.durationDays) : ""]
        .filter(Boolean)
        .join("  ·  ")
    : site.tagline;

  const signature = `${site.name}  ·  ${site.city}`;
  const title = project?.title ?? site.name;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#1a1714" }}>
        <div
          style={{
            width: 560,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 48px 52px 60px",
            color: "#f5f2ec",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", fontFamily: "Manrope", fontSize: 26 }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: "#e0784a", marginRight: 14 }} />
            {signature}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Geologica", fontSize: title.length > 60 ? 44 : 52, lineHeight: 1.1, letterSpacing: -1 }}>
              {title}
            </div>
            <div style={{ fontFamily: "Manrope", fontSize: 24, marginTop: 22, color: "rgba(245,242,236,0.72)", lineHeight: 1.4 }}>
              {facts}
            </div>
          </div>
        </div>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" width={640} height={630} style={{ width: 640, height: 630, objectFit: "cover" }} />
        )}
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geologica", data: display, weight: 700, style: "normal" },
        { name: "Manrope", data: text, weight: 600, style: "normal" },
      ],
    },
  );
}
