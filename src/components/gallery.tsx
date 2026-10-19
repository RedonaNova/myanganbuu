"use client";

import { MediaImage } from "@/components/media-image";
import { useRef, useState } from "react";
import type { ClientPhoto } from "@/lib/photos";
import { IconArrowLeft, IconArrowRight, IconX } from "@/components/icons";

/**
 * Masonry-style photo grid (CSS columns, no JS layout). Tapping a photo opens
 * a full-screen viewer: native <dialog> + horizontal scroll-snap, so swiping
 * uses the browser's own momentum scrolling.
 */
export type GalleryLabels = { gallery: string; openPhoto: string; prev: string; next: string; close: string };

export function Gallery({ photos, labels: t }: { photos: ClientPhoto[]; labels: GalleryLabels }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function open(i: number) {
    setIndex(i);
    dialogRef.current?.showModal();
    // Jump without animation to the tapped photo.
    requestAnimationFrame(() => {
      const track = trackRef.current;
      if (track) track.scrollTo({ left: i * track.clientWidth, behavior: "instant" });
    });
  }

  function go(dir: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.min(photos.length - 1, Math.max(0, index + dir));
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  }

  const counter = `${index + 1} / ${photos.length}`;

  return (
    <>
      <ul className={photos.length === 1 ? "max-w-3xl" : photos.length === 2 ? "columns-2 gap-3 md:gap-4" : "columns-2 gap-3 md:columns-3 md:gap-4"}>
        {photos.map((p, i) => (
          <li key={p.id} className="mb-3 break-inside-avoid md:mb-4">
            <figure>
              <button
                type="button"
                onClick={() => open(i)}
                aria-label={`${t.openPhoto}: ${p.alt}`}
                className="group relative block w-full overflow-hidden rounded-2xl bg-surface-2"
                style={{ aspectRatio: `${p.width} / ${p.height}` }}
              >
                <MediaImage photo={p} alt={p.alt} sizes="(min-width: 768px) 26rem, 50vw" fill className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none" />
              </button>
              {p.caption && <figcaption className="mt-2 text-sm text-ink-2">{p.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={t.gallery}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-white backdrop:bg-black"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
      >
        <div
          ref={trackRef}
          className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-contain scrollbar-none"
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {photos.map((p, i) => (
            <figure key={p.id} className="relative flex h-full w-full shrink-0 snap-center flex-col justify-center">
              <div className="relative h-full w-full">
                <MediaImage photo={p} alt={p.alt} sizes="100vw" fill priority={Math.abs(i - index) <= 1} className="object-contain" />
              </div>
              {p.caption && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-5 pb-8 text-center text-base">{p.caption}</figcaption>}
            </figure>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <span className="rounded-full bg-black/50 px-3 py-1.5 text-base font-semibold tabular">{counter}</span>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label={t.close}
            className="pointer-events-auto grid size-12 place-items-center rounded-full bg-black/50 hover:bg-black/70"
          >
            <IconX />
          </button>
        </div>
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label={t.prev}
              className="absolute top-1/2 left-3 hidden size-14 -translate-y-1/2 place-items-center rounded-full bg-black/50 hover:bg-black/70 disabled:opacity-0 md:grid"
            >
              <IconArrowLeft />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={index === photos.length - 1}
              aria-label={t.next}
              className="absolute top-1/2 right-3 hidden size-14 -translate-y-1/2 place-items-center rounded-full bg-black/50 hover:bg-black/70 disabled:opacity-0 md:grid"
            >
              <IconArrowRight />
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
