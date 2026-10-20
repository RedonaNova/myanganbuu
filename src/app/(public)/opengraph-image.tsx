import { getFeaturedCards, getHeroPair } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { OG_SIZE, ogImage, photoDataUrl } from "@/lib/og";
import { site } from "@/messages/mn";

// Facebook preview for the home page: his name, what he does, his best work.
export const alt = site.name;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage() {
  const settings = await getSettings();
  const [hero, featured] = await Promise.all([getHeroPair(settings.heroProjectId), getFeaturedCards(3)]);
  const srcs = [hero?.pair.after.src, ...featured.map((f) => f.cover?.src)].filter((s, i, a) => s && a.indexOf(s) === i).slice(0, 3);
  const photos = await Promise.all(srcs.map((s) => photoDataUrl(s)));
  return ogImage({ title: site.name, subtitle: site.tagline, photos });
}
