"use client";

import { useEffect } from "react";
import { pageError as t } from "@/messages/errors";

const RELOADED = "mb-reloaded";

/**
 * Shown instead of a blank page when something fails in the browser. A new
 * deploy can remove the old script files a phone still has open; one automatic
 * reload fixes that, so it is tried once before asking.
 */
export default function PublicError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    const stale = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|importing a module script failed/i.test(
      `${error.name} ${error.message}`,
    );
    try {
      if (stale && !sessionStorage.getItem(RELOADED)) {
        sessionStorage.setItem(RELOADED, "1");
        location.reload();
        return;
      }
      sessionStorage.removeItem(RELOADED);
    } catch {
      // Storage blocked: just show the message.
    }
  }, [error]);

  return (
    <div className="container-page flex min-h-[60dvh] flex-col items-start justify-center py-20">
      <h1 className="text-4xl font-bold md:text-5xl">{t.title}</h1>
      <p className="mt-4 max-w-md text-lg text-ink-2">{t.body}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => location.reload()}
          className="inline-flex min-h-14 items-center justify-center rounded-full bg-ink px-7 text-lg font-semibold text-bg"
        >
          {t.retry}
        </button>
        {/* A full page load on purpose: the in-app router may be what failed. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="inline-flex min-h-14 items-center justify-center rounded-full border border-line px-7 text-lg font-semibold hover:border-ink-2">
          {t.home}
        </a>
      </div>
    </div>
  );
}
