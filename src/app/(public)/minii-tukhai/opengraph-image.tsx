import { getAbout, getFeaturedCards } from "@/lib/queries";
import { OG_SIZE, ogImage, photoDataUrl } from "@/lib/og";
import { about, site } from "@/messages/mn";

export const alt = site.name;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage() {
  const [data, featured] = await Promise.all([getAbout(), getFeaturedCards(2)]);
  const srcs = [data.photos[0]?.src, ...featured.map((f) => f.cover?.src)].filter(Boolean).slice(0, 3);
  const photos = await Promise.all(srcs.map((s) => photoDataUrl(s)));
  return ogImage({ title: site.name, subtitle: data.headline || about.defaultHeadline, photos });
}
