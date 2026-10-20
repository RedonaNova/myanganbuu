"use client";

import Link from "next/link";
import { useActionState, useTransition } from "react";
import { deleteProject, updateProject, type FormState } from "../../actions";
import { ROOMS, SERVICE_SLUGS } from "@/lib/catalog";
import { ChoiceGrid } from "@/components/admin/choice-grid";
import { Toggle } from "@/components/admin/toggle";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/admin/ui";
import { IconCheck, IconExternal } from "@/components/icons";
import { FacebookShare } from "@/components/facebook-share";
import { admin, common, districts, projectPage, rooms, serviceNames } from "@/messages/mn";

const t = admin.info;

type Project = {
  id: number;
  slug: string;
  title: string;
  description: string;
  room: string;
  district: string;
  areaM2: string;
  durationDays: string;
  completedAt: string;
  services: string[];
  published: boolean;
  featured: boolean;
};

export function ProjectInfoForm({ project }: { project: Project }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProject.bind(null, project.id), {});
  const [deleting, startDelete] = useTransition();

  return (
    // key: remount with fresh defaults after the server re-renders.
    <form action={action} className="container-page max-w-2xl space-y-8 pb-28" key={JSON.stringify(project)}>
      <div>
        <label htmlFor="title" className={labelClass}>
          {t.title}
        </label>
        <input id="title" name="title" required maxLength={190} defaultValue={project.title} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          {t.description}
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          maxLength={5000}
          defaultValue={project.description}
          className={`${fieldClass} py-3 leading-relaxed`}
        />
        <p className="mt-2 text-base text-ink-2">{t.descriptionHint}</p>
      </div>

      <ChoiceGrid
        legend={t.room}
        name="room"
        type="radio"
        defaultValue={[project.room]}
        options={ROOMS.map((r) => ({ value: r, label: rooms[r] }))}
      />

      <ChoiceGrid
        legend={t.services}
        name="services"
        type="checkbox"
        defaultValue={project.services}
        options={SERVICE_SLUGS.map((s) => ({ value: s, label: serviceNames[s] }))}
      />

      <div>
        <label htmlFor="district" className={labelClass}>
          {t.district}
        </label>
        <select id="district" name="district" defaultValue={project.district} className={fieldClass}>
          <option value="">{t.chooseDistrict}</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="areaM2" className={labelClass}>
            {t.area}
          </label>
          <input id="areaM2" name="areaM2" inputMode="decimal" defaultValue={project.areaM2} className={`${fieldClass} tabular`} />
        </div>
        <div>
          <label htmlFor="durationDays" className={labelClass}>
            {t.duration}
          </label>
          <input
            id="durationDays"
            name="durationDays"
            inputMode="numeric"
            pattern="[0-9]*"
            defaultValue={project.durationDays}
            className={`${fieldClass} tabular`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="completedAt" className={labelClass}>
          {t.completedAt}
        </label>
        <input id="completedAt" name="completedAt" type="date" defaultValue={project.completedAt} className={fieldClass} />
      </div>

      <div className="space-y-3">
        <Toggle name="published" label={t.publish} hint={t.publishHint} defaultChecked={project.published} />
        <Toggle name="featured" label={t.feature} hint={t.featureHint} defaultChecked={project.featured} />
      </div>

      {project.published && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/ajluud/${project.slug}`}
            target="_blank"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line px-5 text-lg font-semibold"
          >
            <IconExternal size={22} />
            {admin.projects.viewPublic}
          </Link>
          <FacebookShare
            url={`/ajluud/${project.slug}`}
            label={projectPage.shareFacebook}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line px-5 text-lg font-semibold"
          />
        </div>
      )}

      <div className="border-t border-line pt-6">
        <button
          type="button"
          disabled={deleting}
          className="min-h-12 text-base font-semibold text-danger"
          onClick={() => {
            if (confirm(t.confirmDeleteProject)) startDelete(() => deleteProject(project.id));
          }}
        >
          {t.deleteProject}
        </button>
      </div>

      {/* Sticky save bar above the phone tab bar. */}
      <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur md:sticky md:bottom-0 md:-mx-8 md:px-8">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <p role="status" className="min-w-0 flex-1 text-base font-semibold">
            {state.error ? (
              <span className="text-danger">{state.error}</span>
            ) : state.ok && !pending ? (
              <span className="inline-flex items-center gap-1.5 text-success">
                <IconCheck size={20} />
                {common.saved}
              </span>
            ) : null}
          </p>
          <button type="submit" disabled={pending} className={`${primaryButtonClass} min-w-40`}>
            {pending ? common.saving : common.save}
          </button>
        </div>
      </div>
    </form>
  );
}
