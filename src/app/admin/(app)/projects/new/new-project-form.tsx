"use client";

import { useActionState } from "react";
import { createProject, type FormState } from "../actions";
import { ROOMS } from "@/lib/catalog";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/admin/ui";
import { ChoiceGrid } from "@/components/admin/choice-grid";
import { IconArrowRight } from "@/components/icons";
import { admin, common, rooms } from "@/messages/mn";

const t = admin.projects;

/** Step one is deliberately tiny: a name and a room, then straight to photos. */
export function NewProjectForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createProject, {});
  return (
    <form action={action} className="container-page max-w-2xl space-y-8">
      <div>
        <label htmlFor="title" className={labelClass}>
          {t.nameLabel}
        </label>
        <input id="title" name="title" required maxLength={190} placeholder={t.namePlaceholder} className={fieldClass} />
        <p className="mt-2 text-base text-ink-2">{t.nameHint}</p>
      </div>

      <ChoiceGrid
        legend={t.roomLabel}
        name="rooms"
        type="checkbox"
        defaultValue={[]}
        options={ROOMS.map((r) => ({ value: r, label: rooms[r] }))}
      />

      <p role="alert" className="min-h-6 text-base font-medium text-danger">
        {state.error}
      </p>

      <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full`}>
        {pending ? common.saving : t.create}
        <IconArrowRight />
      </button>
    </form>
  );
}
