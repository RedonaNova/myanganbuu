"use client";

import { useActionState } from "react";
import { saveSettings, type SettingsState } from "./actions";
import { cardClass, fieldClass, labelClass, primaryButtonClass } from "@/components/admin/ui";
import { IconCheck } from "@/components/icons";
import { adminSettings as t, common } from "@/messages/mn";

type Props = {
  settings: { facebookUrl: string; messengerUrl: string; viberNumber: string };
};

export function SettingsForm({ settings }: Props) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettings, {});
  return (
    <form action={action} key={JSON.stringify(settings)} className={`${cardClass} space-y-6 p-5`}>
      <h2 className="text-xl font-bold">{t.contactTitle}</h2>
      <div>
        <label htmlFor="facebookUrl" className={labelClass}>
          {t.facebookUrl}
        </label>
        <input id="facebookUrl" name="facebookUrl" type="url" inputMode="url" defaultValue={settings.facebookUrl} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="messengerUrl" className={labelClass}>
          {t.messengerUrl}
        </label>
        <input id="messengerUrl" name="messengerUrl" type="url" inputMode="url" defaultValue={settings.messengerUrl} className={fieldClass} />
        <p className="mt-2 text-base text-ink-2">{t.messengerHint}</p>
      </div>
      <div>
        <label htmlFor="viberNumber" className={labelClass}>
          {t.viberNumber}
        </label>
        <input id="viberNumber" name="viberNumber" type="tel" inputMode="tel" defaultValue={settings.viberNumber} className={`${fieldClass} tabular`} />
        <p className="mt-2 text-base text-ink-2">{t.viberHint}</p>
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
