"use client";

import { useState } from "react";

/** Native share sheet on phones (Messenger, Viber, Facebook), copy elsewhere. */
export function ShareButton({
  title,
  labels: t,
  className = "",
}: {
  title: string;
  labels: { share: string; copied: string };
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Cancelled by the user.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={share} className={className}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12.5v6A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-6" />
      </svg>
      <span aria-live="polite">{copied ? t.copied : t.share}</span>
    </button>
  );
}
