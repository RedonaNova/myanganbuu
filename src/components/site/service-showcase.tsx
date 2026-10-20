"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MediaImage } from "@/components/media-image";
import type { ClientPhoto } from "@/lib/photos";

export type ShowcaseItem = {
  slug: string;
  name: string;
  short: string;
  count: number;
  cover: ClientPhoto | null;
};

/**
 * "Юу хийдэг вэ": a list of work types where each has a photo of real work.
 * Desktop: the photo frame stays put while you scroll the list; whichever row
 * crosses the middle of the screen becomes active and its photo fades in.
 * Phones: a swipeable row of photo cards. No animation library: one
 * IntersectionObserver plus CSS opacity transitions.
 */
export function ServiceShowcase({ items, countLabel, emptyLabel }: { items: ShowcaseItem[]; countLabel: string; emptyLabel: string }) {
  const [active, setActive] = useState(0);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      // A thin band across the middle of the viewport.
      { rootMargin: "-48% 0px -48% 0px" },
    );
    rowRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* Phones and tablets */}
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:hidden">
        {items.map((item) => (
          <li key={item.slug} className="w-[80%] shrink-0 snap-start sm:w-auto">
            <Link href={`/uilchilgee/${item.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface-2">
                {item.cover ? (
                  <MediaImage photo={item.cover} sizes="(min-width: 640px) 45vw, 80vw" fill className="object-cover" />
                ) : (
                  <span className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-ink-2">{emptyLabel}</span>
                )}
              </div>
              <h3 className="mt-4 font-display text-2xl leading-tight font-bold">{item.name}</h3>
              <p className="mt-1 text-base text-ink-2">{item.short}</p>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-16">
        <ol className="border-b border-line lg:col-span-6">
          {items.map((item, i) => {
            const on = i === active;
            const count = item.count ? `${item.count} ${countLabel}` : "";
            return (
              <li key={item.slug} ref={(el) => void (rowRefs.current[i] = el)} data-index={i} className="border-t border-line">
                <Link
                  href={`/uilchilgee/${item.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  aria-current={on ? "true" : undefined}
                  className="group block py-9"
                >
                  <span className="flex items-baseline justify-between gap-6">
                    <span
                      className={
                        "font-display text-[2.75rem] leading-[1.05] font-bold tracking-[-0.02em] transition-colors duration-300 " +
                        (on ? "text-ink" : "text-ink/30 group-hover:text-ink/60")
                      }
                    >
                      {item.name}
                    </span>
                    <span className={"shrink-0 text-base tabular transition-colors duration-300 " + (on ? "text-accent" : "text-transparent")}>{count}</span>
                  </span>
                  <span
                    className={
                      "mt-3 block max-w-md text-lg transition-colors duration-300 " + (on ? "text-ink-2" : "text-ink-2/45")
                    }
                  >
                    {item.short}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="lg:col-span-6">
          <div className="sticky top-28 h-[min(calc(100vh-10rem),44rem)] overflow-hidden rounded-card bg-surface-2">
            {items.map((item, i) =>
              item.cover ? (
                <MediaImage
                  key={item.slug}
                  photo={item.cover}
                  alt={i === active ? item.cover.alt : ""}
                  sizes="36rem"
                  fill
                  className={
                    "object-cover transition-[opacity,scale] duration-500 ease-out motion-reduce:transition-none " +
                    (i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0")
                  }
                />
              ) : (
                <span
                  key={item.slug}
                  className={"absolute inset-0 grid place-items-center p-10 text-center text-base text-ink-2 transition-opacity duration-500 " + (i === active ? "opacity-100" : "opacity-0")}
                >
                  {emptyLabel}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </>
  );
}
