"use client";

import { useActionState } from "react";
import { saveAbout, type SettingsState } from "../settings/actions";
import { cardClass, fieldClass, labelClass, primaryButtonClass } from "@/components/admin/ui";
import { IconCheck } from "@/components/icons";
import { adminAbout as t, common } from "@/messages/mn";

export function AboutForm({ headline, bio, years }: { headline: string; bio: string; years: string }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveAbout, {});
  return (
    <form action={action} className={`${cardClass} space-y-6 p-5`}>
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
      <div className="max-w-40">
        <label htmlFor="aboutYears" className={labelClass}>
          {t.years}
        </label>
        <input id="aboutYears" name="aboutYears" defaultValue={years} inputMode="numeric" pattern="[0-9]*" maxLength={2} className={`${fieldClass} tabular`} />
      </div>
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
