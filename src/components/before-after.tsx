"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { ClientPhoto } from "@/lib/photos";
import { projectPage as t } from "@/messages/mn";

/**
 * Before/after comparison. The AFTER photo is the base layer; the BEFORE photo
 * sits on top, clipped to the left of the divider.
 *
 * - Position lives in the CSS custom property --pos and is written straight to
 *   the DOM inside rAF: dragging never re-renders React.
 * - Drag starts anywhere on the image. `touch-action: pan-y` hands vertical
 *   swipes to the browser, so the page still scrolls on phones.
 * - The handle is a real slider: arrows, PageUp/PageDown, Home/End.
 * - Fixed aspect ratio from the photo dimensions: zero layout shift.
 * - Without JS it renders a static 50/50 split.
 */
export function BeforeAfter({
  before,
  after,
  sizes = "(min-width: 82rem) 78rem, 100vw",
  priority = false,
  rounded = true,
  fill = false,
}: {
  before: ClientPhoto;
  after: ClientPhoto;
  sizes?: string;
  priority?: boolean;
  rounded?: boolean;
  /** Fill the parent instead of using the photo's aspect ratio. */
  fill?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const pos = useRef(50);
  const frame = useRef(0);

  function render(next: number) {
    pos.current = Math.min(100, Math.max(0, next));
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const root = rootRef.current;
      const handle = handleRef.current;
      if (!root || !handle) return;
      const value = Math.round(pos.current);
      root.style.setProperty("--pos", `${pos.current}%`);
      root.dataset.edge = value < 12 ? "start" : value > 88 ? "end" : "";
      handle.setAttribute("aria-valuenow", String(value));
      handle.setAttribute("aria-valuetext", `${t.before} ${value}%, ${t.after} ${100 - value}%`);
    });
  }

  function fromPointer(clientX: number) {
    const rect = rootRef.current!.getBoundingClientRect();
    render(((clientX - rect.left) / rect.width) * 100);
  }

  // A one-time nudge shows that the image is interactive (skipped when the
  // user prefers reduced motion; the CSS animation is disabled there too).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        root.classList.add("ba-nudge");
        root.addEventListener("animationend", () => root.classList.remove("ba-nudge"), { once: true });
      },
      { threshold: 0.6 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <div
      ref={rootRef}
      className={
        "ba group relative isolate w-full touch-pan-y overflow-hidden bg-surface-2 select-none " +
        (rounded ? "rounded-card " : "") +
        (fill ? "h-full" : "")
      }
      style={fill ? undefined : { aspectRatio: `${after.width} / ${after.height}` }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        rootRef.current!.classList.remove("ba-nudge");
        rootRef.current!.setPointerCapture(e.pointerId);
        rootRef.current!.dataset.dragging = "true";
        fromPointer(e.clientX);
      }}
      onPointerMove={(e) => {
        if (rootRef.current!.hasPointerCapture(e.pointerId)) fromPointer(e.clientX);
      }}
      onPointerUp={(e) => {
        rootRef.current!.releasePointerCapture(e.pointerId);
        delete rootRef.current!.dataset.dragging;
      }}
      onPointerCancel={() => {
        delete rootRef.current!.dataset.dragging;
      }}
    >
      <Image
        src={after.src}
        alt={after.alt}
        fill
        sizes={sizes}
        placeholder="blur"
        blurDataURL={after.lqip}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        className="pointer-events-none object-cover"
        draggable={false}
      />
      <div className="ba-before absolute inset-0">
        <Image
          src={before.src}
          alt={before.alt}
          fill
          sizes={sizes}
          placeholder="blur"
          blurDataURL={before.lqip}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          className="pointer-events-none object-cover"
          draggable={false}
        />
      </div>

      <span aria-hidden="true" className="ba-label ba-label-before">
        {t.before}
      </span>
      <span aria-hidden="true" className="ba-label ba-label-after">
        {t.after}
      </span>

      <div className="ba-divider" aria-hidden="true" />
      <div
        ref={handleRef}
        role="slider"
        tabIndex={0}
        aria-label={t.compareLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={50}
        aria-valuetext={`${t.before} 50%, ${t.after} 50%`}
        aria-orientation="horizontal"
        className="ba-handle"
        onKeyDown={(e) => {
          const step = e.shiftKey ? 10 : 2;
          const next =
            e.key === "ArrowLeft" || e.key === "ArrowDown"
              ? pos.current - step
              : e.key === "ArrowRight" || e.key === "ArrowUp"
                ? pos.current + step
                : e.key === "PageDown"
                  ? pos.current - 10
                  : e.key === "PageUp"
                    ? pos.current + 10
                    : e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? 100
                        : null;
          if (next === null) return;
          e.preventDefault();
          rootRef.current!.classList.remove("ba-nudge");
          render(next);
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
        </svg>
      </div>
    </div>
  );
}
