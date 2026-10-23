"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { saveHome } from "../settings/actions";
import { MediaImage } from "@/components/media-image";
import { cardClass, fieldClass, labelClass, primaryButtonClass } from "@/components/admin/ui";
import { IconCheck, IconChevronDown, IconChevronUp, IconPlus, IconX } from "@/components/icons";
import { admin, adminHome as t, adminSettings, common } from "@/messages/mn";

type Project = {
  id: number;
  title: string;
  hasPair: boolean;
  services: string[];
  cover: { src: string; width: number; height: number; lqip: string } | null;
};

const MAX = 4;

type ShowcaseItem = { slug: string; photoId: number | null };
type Photo = { id: number; projectId: number; src: string; width: number; height: number; lqip: string };

/** One screen for everything on the home page he controls. */
export function HomeEditor(props: {
  heroProjectId: string;
  featured: number[];
  showcase: ShowcaseItem[];
  typeNames: Record<string, string>;
  projects: Project[];
  photos: Photo[];
}) {
  const [hero, setHero] = useState(props.heroProjectId);
  const [showcase, setShowcase] = useState(props.showcase);
  // The type whose picture is being chosen in the picker, if any.
  const [picking, setPicking] = useState<string | null>(null);
  const photoById = new Map(props.photos.map((p) => [p.id, p]));
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
  const setShowcaseDirty = change(setShowcase);

  function moveType(i: number, dir: -1 | 1) {
    const next = [...showcase];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setShowcaseDirty(next);
  }

  function move(i: number, dir: -1 | 1) {
    const next = [...featured];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setFeaturedDirty(next);
  }

  return (
    <div className="container-page max-w-2xl space-y-4 pb-40">
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
        <h2 className="text-xl font-bold">{t.showcaseTitle}</h2>
        <p className="mt-1 text-base text-ink-2">{t.showcaseHint}</p>
        <ol className="mt-4 space-y-2">
          {showcase.map((item, i) => {
            const works = props.projects.filter((p) => p.services.includes(item.slug));
            // What the site shows: his picked photo, else the newest work's cover.
            const picked = item.photoId ? photoById.get(item.photoId) : undefined;
            const shown = picked ?? works[0]?.cover;
            return (
              <li key={item.slug} className={`rounded-2xl border border-line bg-bg p-3 ${works.length ? "" : "opacity-60"}`}>
                <div className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-center font-display text-lg font-bold text-accent tabular">{i + 1}</span>
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                    {shown && <MediaImage photo={shown} sizes="56px" fill className="object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1 text-base leading-snug font-semibold">{props.typeNames[item.slug]}</span>
                  <IconButton label={admin.photos.moveUp} disabled={i === 0} onClick={() => moveType(i, -1)}>
                    <IconChevronUp />
                  </IconButton>
                  <IconButton label={admin.photos.moveDown} disabled={i === showcase.length - 1} onClick={() => moveType(i, 1)}>
                    <IconChevronDown />
                  </IconButton>
                </div>
                {works.length ? (
                  <div className="mt-2 flex items-center justify-between gap-3 border-t border-line pt-2">
                    <span className="min-w-0 text-sm text-ink-2">{picked ? null : t.showcaseAuto}</span>
                    <span className="flex shrink-0 gap-1">
                      {picked && (
                        <button
                          type="button"
                          onClick={() => setShowcaseDirty(showcase.map((x) => (x.slug === item.slug ? { ...x, photoId: null } : x)))}
                          className="min-h-11 px-3 text-base font-semibold text-ink-2"
                        >
                          {t.remove}
                        </button>
                      )}
                      <button type="button" onClick={() => setPicking(item.slug)} className="min-h-11 rounded-full border border-line px-4 text-base font-semibold">
                        {picked ? t.showcaseChange : t.showcasePick}
                      </button>
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 border-t border-line pt-2 text-sm text-ink-2">{t.showcaseNone}</p>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {picking && (
        <PhotoPicker
          title={`${props.typeNames[picking]}: ${t.showcasePickTitle}`}
          projects={props.projects}
          photos={props.photos}
          selected={showcase.find((x) => x.slug === picking)?.photoId ?? null}
          onPick={(photoId) => {
            setShowcaseDirty(showcase.map((x) => (x.slug === picking ? { ...x, photoId } : x)));
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      )}

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
                await saveHome({ heroProjectId: hero, featured, showcase });
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

/** Full-screen grid of every photo, grouped by work, to pick one picture. */
function PhotoPicker(props: {
  title: string;
  projects: Project[];
  photos: Photo[];
  selected: number | null;
  onPick: (photoId: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const groups = props.projects
    .map((p) => ({ project: p, photos: props.photos.filter((x) => x.projectId === p.id) }))
    .filter((g) => g.photos.length);

  return (
    <dialog
      ref={ref}
      aria-labelledby="picker-title"
      onClose={props.onClose}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-bg p-0 text-ink backdrop:bg-black/60"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur">
        <h2 id="picker-title" className="min-w-0 text-lg font-bold">
          {props.title}
        </h2>
        <button type="button" onClick={() => ref.current?.close()} aria-label={common.close} className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-surface-2">
          <IconX />
        </button>
      </div>
      <div className="mx-auto max-w-3xl space-y-8 px-4 pt-4 pb-16">
        {groups.map(({ project, photos }) => (
          <section key={project.id}>
            <h3 className="text-base font-semibold text-ink-2">{project.title}</h3>
            <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photos.map((photo) => {
                const on = photo.id === props.selected;
                return (
                  <li key={photo.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => props.onPick(photo.id)}
                      className={`relative block aspect-square w-full overflow-hidden rounded-xl bg-surface-2 ${on ? "ring-3 ring-accent ring-offset-2 ring-offset-bg" : ""}`}
                    >
                      <MediaImage photo={photo} sizes="(min-width: 640px) 180px, 33vw" fill className="object-cover" />
                      {on && (
                        <span className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-accent text-accent-ink">
                          <IconCheck size={16} />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </dialog>
  );
}
