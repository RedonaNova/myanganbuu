"use client";

import { useEffect, useRef } from "react";

const DIALOG_ID = "contact-dialog";

/**
 * One contact modal for the whole site. On phones it rises from the bottom as
 * a sheet; on wide screens it is a centred card. A tap outside closes it.
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
        // The dialog box itself has no padding, so a click whose target is the
        // dialog landed on the backdrop.
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      className="contact-sheet m-auto w-[min(28rem,calc(100%-2rem))] rounded-card bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/55 backdrop:backdrop-blur-sm max-sm:mb-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none"
    >
      <div className="p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id="contact-dialog-title" className="text-3xl font-bold">
            {title}
          </h2>
          <form method="dialog">
            <button type="submit" aria-label={closeLabel} className="-mt-1 -mr-2 grid size-11 place-items-center rounded-full text-ink-2 hover:bg-surface-2 hover:text-ink">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </form>
        </div>
        <p className="mt-2 text-lg text-ink-2">{body}</p>
        <div className="mt-7">{children}</div>
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
