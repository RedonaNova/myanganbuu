"use client";

import { MediaImage } from "@/components/media-image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ClientPhoto } from "@/lib/photos";
import type { RoomKey } from "@/lib/catalog";
import { area, days } from "@/lib/format";
import { BeforeAfter } from "@/components/before-after";
import { IconArrowLeft, IconArrowRight, IconCheck, IconX } from "@/components/icons";
import type { presenterLabels } from "@/lib/labels";
import type { SliderLabels } from "@/components/before-after";

type Labels = typeof presenterLabels;

type Slide = { kind: "pair"; before: ClientPhoto; after: ClientPhoto } | { kind: "photo"; photo: ClientPhoto };

type Item = {
  slug: string;
  title: string;
  room: RoomKey;
  district: string;
  areaM2: number | null;
  durationDays: number | null;
  cover: ClientPhoto | null;
  slides: Slide[];
};

const OFFLINE_WIDTH = 1200;

export function Presenter({ projects, labels: t, slider }: { projects: Item[]; labels: Labels; slider: SliderLabels }) {
  const [open, setOpen] = useState<number | null>(null);
  const [online, setOnline] = useState(true);
  const [offlineState, setOfflineState] = useState<"idle" | "saving" | "done">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    navigator.serviceWorker?.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // Pre-download every photo at phone size into the service worker's cache,
  // so the whole portfolio works in a basement with no signal.
  async function saveOffline() {
    if (!("caches" in window)) return;
    setOfflineState("saving");
    const urls = new Set<string>(["/uzuulekh"]);
    for (const p of projects) {
      if (p.cover) urls.add(`${p.cover.src}/${OFFLINE_WIDTH}`);
      for (const s of p.slides) {
        const photos = s.kind === "pair" ? [s.before, s.after] : [s.photo];
        for (const ph of photos) urls.add(`${ph.src}/${OFFLINE_WIDTH}`);
      }
    }
    const list = [...urls];
    let done = 0;
    const queue = [...list];
    await Promise.all(
      Array.from({ length: 4 }, async () => {
        while (queue.length) {
          const url = queue.shift()!;
          await fetch(url, { cache: "reload" }).catch(() => {}); // the SW stores it
          setProgress(++done / list.length);
        }
      }),
    );
    setOfflineState("done");
  }

  if (open !== null) {
    return <Viewer item={projects[open]} labels={t} slider={slider} onClose={() => setOpen(null)} />;
  }

  const progressLabel = `${t.saving} ${Math.round(progress * 100)}%`;

  return (
    <main className="min-h-dvh bg-black text-white">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-black/80 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold">{t.siteName}</p>
          <p className="truncate text-sm text-white/60">{online ? t.hint : t.offline}</p>
        </div>
        <button
          type="button"
          onClick={saveOffline}
          disabled={offlineState === "saving"}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-white/25 px-4 text-sm font-semibold"
        >
          {offlineState === "done" ? <IconCheck size={18} /> : null}
          {offlineState === "saving" ? progressLabel : offlineState === "done" ? t.savedOffline : t.saveOffline}
        </button>
        <Link href="/" aria-label={t.exit} className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10">
          <IconX />
        </Link>
      </header>

      <ul className="grid gap-2 p-2 sm:grid-cols-2">
        {projects.map((p, i) => {
          const facts = [t.rooms[p.room], p.district, p.areaM2 ? area(p.areaM2) : "", p.durationDays ? days(p.durationDays) : ""]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={p.slug}>
              <button type="button" onClick={() => setOpen(i)} className="relative block aspect-[4/5] w-full overflow-hidden rounded-3xl bg-white/5 text-left">
                {p.cover && (
                  <MediaImage photo={p.cover} alt={p.cover.alt} sizes="(min-width: 640px) 50vw, 100vw" fill priority={i < 2} className="object-cover" />
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-5">
                  <span className="block text-sm font-semibold text-white/70">{facts}</span>
                  <span className="mt-1 block font-display text-2xl leading-tight font-bold">{p.title}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

function Viewer({ item, labels: t, slider, onClose }: { item: Item; labels: Labels; slider: SliderLabels; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const count = item.slides.length;

  function go(i: number) {
    const track = trackRef.current;
    const next = Math.max(0, Math.min(count - 1, i));
    track?.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && !(e.target as HTMLElement).closest('[role="slider"]')) go(index + 1);
      if (e.key === "ArrowLeft" && !(e.target as HTMLElement).closest('[role="slider"]')) go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const counter = `${index + 1} / ${count}`;

  return (
    <div className="fixed inset-0 flex flex-col bg-black text-white">
      <div className="flex items-center gap-3 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
        <button type="button" onClick={onClose} aria-label={t.back} className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10">
          <IconArrowLeft />
        </button>
        <p className="min-w-0 flex-1 truncate text-base font-semibold">{item.title}</p>
        <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold tabular">{counter}</span>
      </div>

      {/* Photo slides swipe natively; on comparison slides the drag goes to the
          slider, so the big buttons below always move between slides. */}
      <div
        ref={trackRef}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-contain scrollbar-none"
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {item.slides.map((s, i) => (
          <div key={i} className="relative grid h-full w-full shrink-0 snap-center place-items-center">
            {s.kind === "pair" ? (
              <div className="h-full w-full">
                <BeforeAfter before={s.before} after={s.after} labels={slider} fill rounded={false} sizes="100vw" priority={i === 0} />
              </div>
            ) : (
              <div className="relative h-full w-full">
                <MediaImage photo={s.photo} alt={s.photo.alt} sizes="100vw" fill priority={Math.abs(i - index) <= 1} className="object-contain" />
                {s.photo.caption && (
                  <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-4 text-center text-base">{s.photo.caption}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-white/10 text-lg font-semibold disabled:opacity-30">
          <IconArrowLeft />
          {t.prev}
        </button>
        <button type="button" onClick={() => go(index + 1)} disabled={index === count - 1} className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-white/10 text-lg font-semibold disabled:opacity-30">
          {t.next}
          <IconArrowRight />
        </button>
      </div>
    </div>
  );
}
