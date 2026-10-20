import Link from "next/link";
import type { ServiceSlug } from "@/lib/catalog";
import type { ClientPhoto } from "@/lib/photos";
import { MediaImage } from "@/components/media-image";
import { services } from "@/content/services";
import { home, serviceNames } from "@/messages/mn";

/** A work type with a photo of his newest job of that type. */
export function ServiceCard({ slug, cover, count }: { slug: ServiceSlug; cover: ClientPhoto | null; count: number }) {
  const countLabel = count ? `${count} ${home.workCount}` : "";
  return (
    <Link href={`/uilchilgee/${slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface-2">
        {cover ? (
          <MediaImage
            photo={cover}
            sizes="(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw"
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center p-6 text-center text-base text-ink-2">{home.noWorkYet}</span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl leading-tight font-bold">{serviceNames[slug]}</h2>
        {countLabel && <span className="shrink-0 text-base text-ink-2 tabular">{countLabel}</span>}
      </div>
      <p className="mt-1 text-base text-ink-2">{services[slug].short}</p>
    </Link>
  );
}
