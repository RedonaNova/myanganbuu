"use client";

import { useState, useTransition } from "react";
import { saveHome } from "../settings/actions";
import { MediaImage } from "@/components/media-image";
import { cardClass, fieldClass, labelClass, primaryButtonClass } from "@/components/admin/ui";
import { IconCheck, IconChevronDown, IconChevronUp, IconPlus, IconX } from "@/components/icons";
import { admin, adminHome as t, adminSettings, common } from "@/messages/mn";

type Project = {
  id: number;
  title: string;
  hasPair: boolean;
  cover: { src: string; width: number; height: number; lqip: string } | null;
};

const MAX = 4;

/** One screen for everything on the home page he controls. */
export function HomeEditor(props: { availability: string; heroProjectId: string; featured: number[]; projects: Project[] }) {
  const [availability, setAvailability] = useState(props.availability);
  const [hero, setHero] = useState(props.heroProjectId);
  const [featured, setFeatured] = useState(props.featured.filter((id) => props.projects.some((p) => p.id === id)));
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const byId = new Map(props.projects.map((p) => [p.id, p]));
  const others = props.projects.filter((p) => !featured.includes(p.id));

  function change<T>(set: (v: T) => void) {
    return (v: T) => {
      set(v);
      setDirty(true);
      setSaved(false);
    };
  }
  const setFeaturedDirty = change(setFeatured);

  function move(i: number, dir: -1 | 1) {
    const next = [...featured];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setFeaturedDirty(next);
  }

  return (
    <div className="container-page max-w-2xl space-y-4 pb-40">
      <section className={`${cardClass} p-5`}>
        <label htmlFor="availability" className={labelClass}>
          {t.statusTitle}
        </label>
        <input
          id="availability"
          value={availability}
          onChange={(e) => change(setAvailability)(e.target.value)}
          maxLength={80}
          placeholder={t.statusPlaceholder}
          className={fieldClass}
        />
        <p className="mt-2 text-base text-ink-2">{t.statusHint}</p>
      </section>

      <section className={`${cardClass} p-5`}>
        <label htmlFor="hero" className={labelClass}>
          {adminSettings.heroTitle}
        </label>
        <select id="hero" value={hero} onChange={(e) => change(setHero)(e.target.value)} className={fieldClass}>
          <option value="">{adminSettings.heroAuto}</option>
          {props.projects
            .filter((p) => p.hasPair)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
        </select>
        <p className="mt-2 text-base text-ink-2">{adminSettings.heroHint}</p>
      </section>

      <section className={`${cardClass} p-5`}>
        <h2 className="text-xl font-bold">{t.featuredTitle}</h2>
        <p className="mt-1 text-base text-ink-2">{t.featuredHint}</p>

        {featured.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-surface-2 p-4 text-base text-ink-2">{t.featuredEmpty}</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {featured.map((id, i) => {
              const p = byId.get(id)!;
              return (
                <li key={id} className="rounded-2xl border border-line bg-bg p-3">
                  <div className="flex items-center gap-3">
                    <span className="w-5 shrink-0 text-center font-display text-lg font-bold text-accent tabular">{i + 1}</span>
                    <Thumb project={p} />
                    <span className="min-w-0 flex-1 text-base leading-snug font-semibold">{p.title}</span>
                  </div>
                  <div className="mt-2 flex justify-end border-t border-line pt-2">
                    <IconButton label={admin.photos.moveUp} disabled={i === 0} onClick={() => move(i, -1)}>
                      <IconChevronUp />
                    </IconButton>
                    <IconButton label={admin.photos.moveDown} disabled={i === featured.length - 1} onClick={() => move(i, 1)}>
                      <IconChevronDown />
                    </IconButton>
                    <IconButton label={t.remove} onClick={() => setFeaturedDirty(featured.filter((f) => f !== id))}>
                      <IconX />
                    </IconButton>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {others.length > 0 && (
          <>
            <h3 className="mt-6 text-base font-semibold text-ink-2">{t.addFeatured}</h3>
            {featured.length >= MAX && <p className="mt-1 text-sm text-ink-2">{t.full}</p>}
            <ul className="mt-2 space-y-2">
              {others.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={featured.length >= MAX}
                    onClick={() => setFeaturedDirty([...featured, p.id])}
                    className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-line p-2 text-left transition-colors duration-150 hover:border-ink-2 disabled:opacity-40"
                  >
                    <Thumb project={p} />
                    <span className="min-w-0 flex-1 text-base leading-snug">{p.title}</span>
                    <IconPlus className="mr-2 shrink-0 text-ink-2" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur md:bottom-0 md:left-[17rem]">
        <div className="mx-auto flex max-w-2xl items-center justify-end gap-3">
          {saved && !dirty && (
            <span role="status" className="inline-flex items-center gap-1 text-base font-semibold text-success">
              <IconCheck size={18} />
              {common.saved}
            </span>
          )}
          <button
            type="button"
            disabled={pending || !dirty}
            onClick={() =>
              start(async () => {
                await saveHome({ availability, heroProjectId: hero, featured });
                setDirty(false);
                setSaved(true);
              })
            }
            className={`${primaryButtonClass} min-w-40`}
          >
            {pending ? common.saving : common.save}
          </button>
        </div>
      </div>
    </div>
  );
}

function Thumb({ project }: { project: Project }) {
  return (
    <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
      {project.cover && <MediaImage photo={project.cover} sizes="56px" fill className="object-cover" />}
    </span>
  );
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-surface-2 hover:text-ink disabled:opacity-30">
      {children}
    </button>
  );
}
