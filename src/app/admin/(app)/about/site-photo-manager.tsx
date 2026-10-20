"use client";

import { useRef, useState, useTransition } from "react";
import { deleteSitePhoto, reorderSitePhotos, updateSitePhoto } from "../settings/actions";
import { prepareImage, uploadWithProgress, UploadError } from "@/lib/client-image";
import { MediaImage } from "@/components/media-image";
import { cardClass, fieldClass, primaryButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import { IconCamera, IconCheck, IconChevronDown, IconChevronUp, IconStar } from "@/components/icons";
import { admin, adminAbout as t, common } from "@/messages/mn";

type Photo = { id: number; src: string; width: number; height: number; lqip: string; alt: string; caption: string };

export function SitePhotoManager({ initial }: { initial: Photo[] }) {
  const [photos, setPhotos] = useState(initial);
  const [uploading, setUploading] = useState<{ name: string; progress: number }[]>([]);
  const [error, setError] = useState("");
  const [, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    for (const file of Array.from(files)) {
      setUploading((u) => [...u, { name: file.name, progress: 0 }]);
      try {
        const blob = await prepareImage(file);
        const photo = await uploadWithProgress<Photo>("/api/admin/site-photos", blob, file.name, (p) =>
          setUploading((u) => u.map((x) => (x.name === file.name ? { ...x, progress: p } : x))),
        );
        setPhotos((list) => [...list, photo]);
      } catch (err) {
        setError(err instanceof UploadError && err.code === "unsupported" ? admin.photos.unsupported : common.errorGeneric);
      } finally {
        setUploading((u) => u.filter((x) => x.name !== file.name));
      }
    }
  }

  function reorder(next: Photo[]) {
    setPhotos(next);
    start(() => reorderSitePhotos(next.map((p) => p.id)));
  }

  function move(i: number, to: number) {
    const next = [...photos];
    const [p] = next.splice(i, 1);
    next.splice(to, 0, p);
    reorder(next);
  }

  return (
    <section className={`${cardClass} p-5`}>
      <h2 className="text-xl font-bold">{t.photosTitle}</h2>
      <p className="mt-1 text-base text-ink-2">{t.photosHint}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          upload(e.target.files);
          e.target.value = "";
        }}
      />
      <button type="button" onClick={() => inputRef.current?.click()} className={`${primaryButtonClass} mt-4 w-full`}>
        <IconCamera />
        {admin.photos.upload}
      </button>
      {uploading.map((u) => (
        <div key={u.name} className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.round(u.progress * 100)} aria-label={u.name}>
          <div className="h-full rounded-full bg-accent transition-[width] duration-200" style={{ width: `${Math.max(4, u.progress * 100)}%` }} />
        </div>
      ))}
      {error && (
        <p role="alert" className="mt-2 text-base text-danger">
          {error}
        </p>
      )}

      <ul className="mt-5 space-y-3">
        {photos.map((p, i) => (
          <PhotoRow
            key={p.id}
            photo={p}
            first={i === 0}
            last={i === photos.length - 1}
            onUp={() => move(i, i - 1)}
            onDown={() => move(i, i + 1)}
            onPortrait={() => move(i, 0)}
            onDelete={() => {
              if (!confirm(admin.photos.confirmDeletePhoto)) return;
              setPhotos((list) => list.filter((x) => x.id !== p.id));
              start(() => deleteSitePhoto(p.id));
            }}
          />
        ))}
      </ul>
    </section>
  );
}

function PhotoRow({
  photo,
  first,
  last,
  onUp,
  onDown,
  onPortrait,
  onDelete,
}: {
  photo: Photo;
  first: boolean;
  last: boolean;
  onUp: () => void;
  onDown: () => void;
  onPortrait: () => void;
  onDelete: () => void;
}) {
  const [caption, setCaption] = useState(photo.caption);
  const [alt, setAlt] = useState(photo.alt);
  const [saved, setSaved] = useState(true);
  const [pending, start] = useTransition();

  return (
    <li className="rounded-2xl border border-line bg-bg p-3">
      <div className="flex gap-3">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
          <MediaImage photo={photo} alt="" sizes="96px" fill className="object-cover" />
          {first && (
            <span className="absolute inset-x-1 bottom-1 inline-flex items-center justify-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-ink">
              <IconStar size={12} />
              {t.portrait}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <label className="block">
            <span className="text-sm font-semibold">{admin.photos.caption}</span>
            <input value={caption} onChange={(e) => (setCaption(e.target.value), setSaved(false))} maxLength={250} className={`${fieldClass} mt-1 min-h-12 text-base`} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">{admin.photos.alt}</span>
            <input value={alt} onChange={(e) => (setAlt(e.target.value), setSaved(false))} maxLength={250} className={`${fieldClass} mt-1 min-h-12 text-base`} />
          </label>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!saved && (
          <button
            type="button"
            disabled={pending}
            onClick={() => start(async () => { await updateSitePhoto(photo.id, { caption, alt }); setSaved(true); })}
            className={`${primaryButtonClass} min-h-11 px-5 text-base`}
          >
            {pending ? common.saving : common.save}
          </button>
        )}
        {saved && caption && <IconCheck size={18} className="text-success" />}
        {!first && (
          <button type="button" onClick={onPortrait} className={`${secondaryButtonClass} min-h-11 px-4 text-base`}>
            <IconStar size={18} />
            {t.makePortrait}
          </button>
        )}
        <span className="ml-auto flex">
          <button type="button" aria-label={admin.photos.moveUp} disabled={first} onClick={onUp} className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-surface-2 disabled:opacity-30">
            <IconChevronUp />
          </button>
          <button type="button" aria-label={admin.photos.moveDown} disabled={last} onClick={onDown} className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-surface-2 disabled:opacity-30">
            <IconChevronDown />
          </button>
        </span>
        <button type="button" onClick={onDelete} className="min-h-11 px-2 text-base font-semibold text-danger">
          {common.delete}
        </button>
      </div>
    </li>
  );
}
