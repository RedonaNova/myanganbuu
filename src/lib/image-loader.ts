"use client";

// next/image loader for pre-generated variants: src is "/media/<key>" and the
// widths come from next.config deviceSizes, which match WIDTHS in images.ts.
export default function mediaLoader({ src, width }: { src: string; width: number }) {
  if (!src.startsWith("/media/")) return src;
  return `${src}/${width}`;
}
