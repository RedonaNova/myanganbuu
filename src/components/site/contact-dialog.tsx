"use client";

import { useCallback, useEffect, useRef } from "react";

const OPEN_EVENT = "contact:open";
// Matches the longest closing transition in globals.css (.contact-sheet).
const CLOSE_MS = 240;

/**
 * One contact modal for the whole site. The <dialog> itself is a transparent
 * full-screen layer that draws its own dimmed backdrop, so it looks the same in
 * every browser. On phones the panel is a bottom sheet; on wide screens a card.
 * A tap anywhere outside the panel closes it.
 *
 * Opening and closing are driven by a data-open attribute rather than the
 * dialog's own [open], so the panel animates out before the dialog closes.
 */
export function ContactDialog({ title, body, closeLabel, children }: { title: string; body: string; closeLabel: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closing = useRef<number | undefined>(undefined);

  const close = useCallback(() => {
    const d = ref.current;
    if (!d?.open || !("open" in d.dataset)) return;
    delete d.dataset.open;
    closing.current = window.setTimeout(() => d.close(), CLOSE_MS);
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const open = () => {
      window.clearTimeout(closing.current);
      if (!d.open) d.showModal();
      // Commit the closed state first so the opening transition runs.
      void d.offsetHeight;
      d.dataset.open = "";
    };
    window.addEventListener(OPEN_EVENT, open);
    // The phone's back button closes it too.
    window.addEventListener("popstate", close);
    return () => {
      window.removeEventListener(OPEN_EVENT, open);
      window.removeEventListener("popstate", close);
    };
  }, [close]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="contact-dialog-title"
      onCancel={(e) => {
        // Escape: animate out instead of vanishing.
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("[data-sheet-panel]")) close();
      }}
      className="contact-sheet fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-ink backdrop:bg-transparent"
    >
      <div className="sheet-scrim flex h-full items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6">
        <div
          data-sheet-panel
          // Focus lands here on open, not on the close button, so no ring flashes.
          tabIndex={-1}
          autoFocus
          className="sheet-panel w-full rounded-t-4xl border border-line bg-surface px-6 pt-3 pb-[max(1.75rem,env(safe-area-inset-bottom))] shadow-2xl outline-none max-sm:border-x-0 max-sm:border-b-0 sm:max-w-md sm:rounded-card sm:p-8"
        >
          <div aria-hidden="true" className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-line sm:hidden" />
          <div className="flex items-center justify-between gap-4">
            <h2 id="contact-dialog-title" className="text-3xl font-bold">
              {title}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label={closeLabel}
              className="grid size-11 place-items-center rounded-full bg-surface-2 text-ink-2 transition-colors duration-150 hover:text-ink"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <p className="mt-3 max-w-sm text-lg leading-relaxed text-ink-2">{body}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </dialog>
  );
}

/** A button anywhere on the page that opens the contact modal. */
export function ContactTrigger({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" aria-haspopup="dialog" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className={className}>
      {children}
    </button>
  );
}
