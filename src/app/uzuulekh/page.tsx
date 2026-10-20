import type { Metadata, Viewport } from "next";
import { getPresentation } from "@/lib/queries";
import { Presenter } from "./presenter";
import { present } from "@/messages/mn";
import { presenterLabels, sliderLabels } from "@/lib/labels";

export const metadata: Metadata = {
  title: present.title,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#000000" };

/** Face-to-face showing on his phone: full-bleed, minimal chrome, offline. */
export default async function PresentPage() {
  const projects = await getPresentation();
  return (
    <Presenter
      labels={presenterLabels}
      slider={sliderLabels}
      projects={projects.map((p) => ({
        slug: p.slug,
        title: p.title,
        rooms: p.rooms,
        district: p.district,
        areaM2: p.areaM2,
        durationDays: p.durationDays,
        cover: p.cover,
        slides: [
          ...(p.heroPair ? [{ kind: "pair" as const, ...p.heroPair }] : []),
          ...p.pairs.map((pair) => ({ kind: "pair" as const, ...pair })),
          ...p.gallery.map((photo) => ({ kind: "photo" as const, photo })),
          ...p.progress.map((photo) => ({ kind: "photo" as const, photo })),
        ],
      }))}
    />
  );
}
