"use client";

import { absoluteUrl } from "@/lib/origin";

export function facebookShareUrl(url: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/**
 * Opens Facebook's share dialog. `url` may be a path; it is made absolute from
 * the address the visitor is on, so the shared link is always the live site.
 */
export function FacebookShare({
  url,
  label,
  className = "",
  labelClassName = "",
}: {
  url: string;
  label: string;
  className?: string;
  /** e.g. "sr-only sm:not-sr-only" for an icon-only button on phones. */
  labelClassName?: string;
}) {
  return (
    <a
      href={facebookShareUrl(url)}
      onClick={(e) => {
        e.preventDefault();
        window.open(facebookShareUrl(absoluteUrl(url)), "_blank", "noopener,noreferrer");
      }}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z" />
      </svg>
      <span className={labelClassName}>{label}</span>
    </a>
  );
}
