"use client";

import { useActionState, useState } from "react";
import { saveAbout, type SettingsState } from "../settings/actions";
import { cardClass, fieldClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import { IconCheck, IconPlus, IconX } from "@/components/icons";
import { adminAbout as t, common } from "@/messages/mn";

type Stat = { value: string; label: string };
const MAX_STATS = 4;

export function AboutForm({ headline, bio, stats }: { headline: string; bio: string; stats: Stat[] }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveAbout, {});
  // Start with one empty row so it is obvious what to fill in.
  const [rows, setRows] = useState<(Stat & { key: number })[]>(() =>
    (stats.length ? stats : [{ value: "", label: "" }]).map((s, i) => ({ ...s, key: i })),
  );

  return (
    // key: remount with the saved values after the server re-renders.
    <form action={action} key={JSON.stringify({ headline, bio, stats })} className={`${cardClass} space-y-6 p-5`}>
      <div>
        <label htmlFor="aboutHeadline" className={labelClass}>
          {t.headline}
        </label>
        <input id="aboutHeadline" name="aboutHeadline" defaultValue={headline} maxLength={120} className={fieldClass} />
        <p className="mt-2 text-base text-ink-2">{t.headlineHint}</p>
      </div>
      <div>
        <label htmlFor="aboutBio" className={labelClass}>
          {t.bio}
        </label>
        <textarea id="aboutBio" name="aboutBio" defaultValue={bio} rows={9} maxLength={4000} className={`${fieldClass} py-3 leading-relaxed`} />
        <p className="mt-2 text-base text-ink-2">{t.bioHint}</p>
      </div>

      <fieldset>
        <legend className={labelClass}>{t.statsTitle}</legend>
        <p className="-mt-1 mb-3 text-base text-ink-2">{t.statsHint}</p>
        <ul className="space-y-2">
          {rows.map((row, i) => (
            <li key={row.key} className="grid grid-cols-[6rem_1fr_auto] items-center gap-2">
              <input
                name="statValue"
                aria-label={`${t.statValue} ${i + 1}`}
                placeholder={t.statValue}
                defaultValue={row.value}
                maxLength={12}
                className={`${fieldClass} tabular`}
              />
              <input name="statLabel" aria-label={`${t.statLabel} ${i + 1}`} placeholder={t.statLabel} defaultValue={row.label} maxLength={40} className={fieldClass} />
              <button
                type="button"
                aria-label={t.removeStat}
                onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))}
                className="grid size-12 place-items-center rounded-full text-ink-2 hover:bg-surface-2 hover:text-danger"
              >
                <IconX size={20} />
              </button>
            </li>
          ))}
        </ul>
        {rows.length < MAX_STATS && (
          <button
            type="button"
            onClick={() => setRows((r) => [...r, { value: "", label: "", key: Date.now() }])}
            className={`${secondaryButtonClass} mt-3 min-h-12 px-5 text-base`}
          >
            <IconPlus size={20} />
            {t.addStat}
          </button>
        )}
      </fieldset>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? common.saving : common.save}
        </button>
        <p role="status" className="text-base font-semibold">
          {state.ok && !pending && (
            <span className="inline-flex items-center gap-1 text-success">
              <IconCheck size={18} />
              {common.saved}
            </span>
          )}
          {state.error && <span className="text-danger">{common.errorGeneric}</span>}
        </p>
      </div>
    </form>
  );
}
