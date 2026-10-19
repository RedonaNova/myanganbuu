// Plain, serialisable photo shape passed from server to client components.
export type PhotoRole = "BEFORE" | "AFTER" | "GALLERY" | "PROGRESS";

export type ClientPhoto = {
  id: number;
  role: PhotoRole;
  alt: string;
  caption: string;
  milestoneDate: string; // YYYY-MM-DD or ""
  src: string; // /media/<key>, resolved by the image loader
  width: number;
  height: number;
  lqip: string;
  pairedAfterId: number | null;
};

export function toClientPhoto(p: {
  id: number;
  role: string;
  alt: string;
  caption: string;
  milestoneDate: Date | null;
  storageKey: string;
  width: number;
  height: number;
  lqip: string;
  pairedAfterId: number | null;
}): ClientPhoto {
  return {
    id: p.id,
    role: p.role as PhotoRole,
    alt: p.alt,
    caption: p.caption,
    milestoneDate: p.milestoneDate ? p.milestoneDate.toISOString().slice(0, 10) : "",
    src: `/media/${p.storageKey}`,
    width: p.width,
    height: p.height,
    lqip: p.lqip,
    pairedAfterId: p.pairedAfterId,
  };
}
