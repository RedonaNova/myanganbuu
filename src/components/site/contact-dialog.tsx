"use client";

import { useEffect, useRef } from "react";

const DIALOG_ID = "contact-dialog";

/**
 * One contact modal for the whole site. The <dialog> itself is a transparent
 * full-screen layer that draws its own dimmed backdrop, so it looks the same in
 * every browser. On phones the panel is a bottom sheet; on wide screens a card.
 * A tap anywhere outside the panel closes it.
 */
export function ContactDialog({ title, body, closeLabel, children }: { title: string; body: string; closeLabel: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  // Close when the browser's back button is used on a phone.
  useEffect(() => {
    const close = () => ref.current?.close();
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, []);

  return (
    <dialog
      ref={ref}
      id={DIALOG_ID}
      aria-labelledby="contact-dialog-title"
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("[data-sheet-panel]")) e.currentTarget.close();
      }}
      className="contact-sheet fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-ink backdrop:bg-transparent"
    >
      <div className="sheet-scrim flex h-full items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6">
        <div
          data-sheet-panel
          // Focus lands here on open, not on the close button, so no ring flashes.
          tabIndex={-1}
          autoFocus
          className="sheet-panel w-full rounded-t-4xl border border-line max-sm:border-x-0 max-sm:border-b-0 bg-surface px-6 pt-3 pb-[max(1.75rem,env(safe-area-inset-bottom))] shadow-2xl outline-none sm:max-w-md sm:rounded-card sm:p-8"
        >
          <div aria-hidden="true" className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-line sm:hidden" />
          <div className="flex items-center justify-between gap-4">
            <h2 id="contact-dialog-title" className="text-3xl font-bold">
              {title}
            </h2>
            <form method="dialog">
              <button
                type="submit"
                aria-label={closeLabel}
                className="grid size-11 place-items-center rounded-full bg-surface-2 text-ink-2 transition-colors duration-150 hover:text-ink"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </form>
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
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => (document.getElementById(DIALOG_ID) as HTMLDialogElement | null)?.showModal()}
      className={className}
    >
      {children}
    </button>
  );
}
