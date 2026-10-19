"use client";

import { useState, useTransition } from "react";
import { deleteInquiry, saveInquiryNote, setInquiryStatus } from "../actions";
import { cardClass, fieldClass, secondaryButtonClass } from "@/components/admin/ui";
import { IconCheck } from "@/components/icons";
import { adminInquiries as t, common, inquiryStatuses } from "@/messages/mn";

const STATUSES = ["NEW", "CONTACTED", "QUOTED", "STARTED", "DONE"] as const;
type Status = (typeof STATUSES)[number];

/** Status as a vertical stepper (one tap), plus a private note. */
export function InquiryControls({ id, status: initial, note: initialNote }: { id: number; status: Status; note: string }) {
  const [status, setStatus] = useState(initial);
  const [note, setNote] = useState(initialNote);
  const [savedNote, setSavedNote] = useState(initialNote);
  const [pending, start] = useTransition();
  const currentIndex = STATUSES.indexOf(status);

  return (
    <>
      <section className={`${cardClass} p-5`}>
        <h2 className="text-lg font-bold">{t.status}</h2>
        <ol className="mt-4 grid gap-2">
          {STATUSES.map((s, i) => {
            const active = s === status;
            const done = i < currentIndex;
            return (
              <li key={s}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setStatus(s);
                    start(() => setInquiryStatus(id, s));
                  }}
                  className={
                    "flex min-h-14 w-full items-center gap-3 rounded-control border px-4 text-left text-lg font-semibold transition-colors duration-150 " +
                    (active ? "border-accent bg-accent text-accent-ink" : done ? "border-line bg-surface-2 text-ink-2" : "border-line bg-surface")
                  }
                >
                  <span
                    aria-hidden="true"
                    className={
                      "grid size-7 shrink-0 place-items-center rounded-full border-2 text-sm " +
                      (active ? "border-accent-ink" : done ? "border-ink-2" : "border-line")
                    }
                  >
                    {done || active ? <IconCheck size={16} /> : null}
                  </span>
                  {inquiryStatuses[s]}
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={`${cardClass} p-5`}>
        <label htmlFor="note" className="text-lg font-bold">
          {t.note}
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder={t.notePlaceholder}
          className={`${fieldClass} mt-3 py-3`}
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            disabled={pending || note === savedNote}
            onClick={() =>
              start(async () => {
                await saveInquiryNote(id, note);
                setSavedNote(note);
              })
            }
            className={secondaryButtonClass}
          >
            {pending ? common.saving : common.save}
          </button>
          {note === savedNote && savedNote && (
            <span className="inline-flex items-center gap-1 text-base font-semibold text-success">
              <IconCheck size={18} />
              {common.saved}
            </span>
          )}
        </div>
      </section>

      <button
        type="button"
        className="mx-auto min-h-12 px-4 text-base font-semibold text-danger"
        onClick={() => {
          if (confirm(t.confirmDelete)) start(() => deleteInquiry(id));
        }}
      >
        {t.deleteInquiry}
      </button>
    </>
  );
}
