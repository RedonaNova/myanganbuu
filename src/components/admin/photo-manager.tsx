"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  deletePhoto,
  pairPhotos,
  reorderPhotos,
  setCover,
  setHeroPair,
  unpairPhotos,
  updatePhoto,
} from "@/app/admin/(app)/projects/actions";
import { prepareImage, uploadWithProgress, UploadError } from "@/lib/client-image";
import type { ClientPhoto, PhotoRole } from "@/lib/photos";
import { IconCamera, IconCheck, IconChevronDown, IconChevronUp, IconStar, IconX } from "@/components/icons";
import { cardClass, fieldClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import { admin, common, photoRoles } from "@/messages/mn";

const t = admin.photos;
const CONCURRENCY = 2;

type Upload = {
  id: string;
  name: string;
  file: File;
  status: "queued" | "preparing" | "uploading" | "processing" | "failed";
  progress: number;
  error?: string;
};

type PickMode = null | { step: "before" } | { step: "after"; beforeId: number };

export function PhotoManager({
  projectId,
  photos: initialPhotos,
  coverPhotoId,
  heroPairId,
  roomLabel,
}: {
  projectId: number;
  photos: ClientPhoto[];
  coverPhotoId: number | null;
  heroPairId: number | null;
  roomLabel: string;
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [pick, setPick] = useState<PickMode>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Server is the source of truth after every refresh.
  const [synced, setSynced] = useState(initialPhotos);
  if (synced !== initialPhotos) {
    setSynced(initialPhotos);
    setPhotos(initialPhotos);
  }

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const byId = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos]);
  const pairs = useMemo(
    () => photos.filter((p) => p.role === "BEFORE" && p.pairedAfterId && byId.has(p.pairedAfterId)),
    [photos, byId],
  );
  const pairNumber = useMemo(() => {
    const map = new Map<number, number>();
    pairs.forEach((b, i) => {
      map.set(b.id, i + 1);
      map.set(b.pairedAfterId!, i + 1);
    });
    return map;
  }, [pairs]);

  function refresh() {
    startTransition(() => router.refresh());
  }

  // ─── Upload queue ────────────────────────────────────────────────────
  const running = useRef(0);
  const queue = useRef<Upload[]>([]);

  function patchUpload(id: string, patch: Partial<Upload>) {
    setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  function enqueue(files: FileList | null) {
    if (!files?.length) return;
    const items: Upload[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      file,
      status: "queued",
      progress: 0,
    }));
    setUploads((list) => [...list, ...items]);
    queue.current.push(...items);
    pump();
  }

  function pump() {
    while (running.current < CONCURRENCY && queue.current.length) {
      const item = queue.current.shift()!;
      running.current++;
      runUpload(item).finally(() => {
        running.current--;
        if (!queue.current.length && running.current === 0) refresh();
        pump();
      });
    }
  }

  async function runUpload(item: Upload) {
    try {
      patchUpload(item.id, { status: "preparing", error: undefined, progress: 0 });
      const blob = await prepareImage(item.file);
      if (blob.size > 40 * 1024 * 1024) throw new UploadError(413, "too_big");
      patchUpload(item.id, { status: "uploading" });
      const photo = await uploadWithProgress<ClientPhoto>(
        `/api/admin/projects/${projectId}/photos`,
        blob,
        item.name,
        (f) => patchUpload(item.id, { progress: f, status: f >= 1 ? "processing" : "uploading" }),
      );
      setPhotos((list) => [...list, photo]);
      setUploads((list) => list.filter((u) => u.id !== item.id));
    } catch (err) {
      const code = err instanceof UploadError ? err.code : undefined;
      if (err instanceof UploadError && err.status === 401) router.push("/admin/login");
      patchUpload(item.id, {
        status: "failed",
        error: code === "unsupported" ? t.unsupported : code === "too_big" ? t.tooBig : common.errorGeneric,
      });
    }
  }

  function retry(item: Upload) {
    queue.current.push(item);
    pump();
  }

  // ─── Pairing ─────────────────────────────────────────────────────────
  function onTilePress(photo: ClientPhoto) {
    if (!pick) return setEditingId(photo.id);
    if (pick.step === "before") return setPick({ step: "after", beforeId: photo.id });
    if (photo.id === pick.beforeId) return;
    const beforeId = pick.beforeId;
    setPick(null);
    setPhotos((list) =>
      list.map((p) =>
        p.id === beforeId
          ? { ...p, role: "BEFORE", pairedAfterId: photo.id }
          : p.id === photo.id
            ? { ...p, role: "AFTER" }
            : p.pairedAfterId === photo.id || p.pairedAfterId === beforeId
              ? { ...p, pairedAfterId: null }
              : p,
      ),
    );
    setToast(t.pairDone);
    startTransition(async () => {
      await pairPhotos(beforeId, photo.id);
      router.refresh();
    });
  }

  // ─── Reorder ─────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Long-press on phones so normal taps and scrolling still work.
    useSensor(TouchSensor, { activationConstraint: { delay: 280, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    const from = photos.findIndex((p) => p.id === e.active.id);
    const to = photos.findIndex((p) => p.id === e.over!.id);
    move(from, to);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= photos.length) return;
    const next = arrayMove(photos, from, to);
    setPhotos(next);
    startTransition(() => reorderPhotos(projectId, next.map((p) => p.id)));
  }

  const editing = editingId != null ? byId.get(editingId) : undefined;

  return (
    <div className="container-page space-y-8">
      {/* Upload */}
      <section>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            enqueue(e.target.files);
            e.target.value = "";
          }}
        />
        <button type="button" onClick={() => inputRef.current?.click()} className={`${primaryButtonClass} w-full`}>
          <IconCamera />
          {t.upload}
        </button>
        <p className="mt-2 text-center text-base text-ink-2">{t.uploadHint}</p>

        {uploads.length > 0 && (
          <ul className="mt-4 space-y-2" aria-live="polite">
            {uploads.map((u) => (
              <li key={u.id} className={`${cardClass} p-4`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-base">{u.name}</span>
                  {u.status === "failed" ? (
                    <button type="button" onClick={() => retry(u)} className="shrink-0 font-semibold text-accent">
                      {t.retry}
                    </button>
                  ) : (
                    <span className="shrink-0 text-sm font-semibold text-ink-2 tabular">
                      {u.status === "uploading" ? `${Math.round(u.progress * 100)}%` : statusLabel(u.status)}
                    </span>
                  )}
                </div>
                {u.status === "failed" ? (
                  <p className="mt-1 text-base text-danger">{u.error}</p>
                ) : (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={`h-full rounded-full bg-accent transition-[width] duration-200 ${u.status === "processing" ? "animate-pulse" : ""}`}
                      style={{ width: `${u.status === "queued" || u.status === "preparing" ? 4 : Math.max(4, u.progress * 100)}%` }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Before / after pairs */}
      <section aria-labelledby="pairs-heading">
        <div className="flex items-end justify-between gap-3">
          <h2 id="pairs-heading" className="text-2xl font-bold">
            {t.pairs}
          </h2>
          {photos.length >= 2 && !pick && (
            <button type="button" onClick={() => setPick({ step: "before" })} className={secondaryButtonClass}>
              {t.pairStart}
            </button>
          )}
        </div>
        <p className="mt-2 text-base text-ink-2">{t.pairsHint}</p>

        {pairs.length === 0 ? (
          <p className="mt-4 text-base text-ink-2">{t.noPairs}</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {pairs.map((before, i) => {
              const after = byId.get(before.pairedAfterId!)!;
              const isHero = heroPairId === before.id;
              return (
                <li key={before.id} className={`${cardClass} overflow-hidden`}>
                  <div className="grid grid-cols-2 gap-px bg-line">
                    {[before, after].map((p, j) => (
                      <div key={p.id} className="relative aspect-4/3 bg-surface-2">
                        <Image src={p.src} alt={p.alt} fill sizes="25vw" placeholder="blur" blurDataURL={p.lqip} className="object-cover" />
                        <span className={roleChip(j === 0 ? "BEFORE" : "AFTER")}>{photoRoles[j === 0 ? "BEFORE" : "AFTER"]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3">
                    <span className="font-display text-lg font-bold tabular">{i + 1}</span>
                    <div className="flex gap-2">
                      {isHero ? (
                        <span className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-accent-soft px-4 text-sm font-semibold text-accent">
                          <IconStar size={18} />
                          {t.mainPair}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold"
                          onClick={() => startTransition(async () => { await setHeroPair(before.id); router.refresh(); })}
                        >
                          {t.makeMainPair}
                        </button>
                      )}
                      <button
                        type="button"
                        className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold"
                        onClick={() => startTransition(async () => { await unpairPhotos(before.id); router.refresh(); })}
                      >
                        {t.unpair}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* All photos */}
      <section>
        {pick && (
          <div
            role="status"
            className="sticky top-2 z-30 mb-4 flex items-center justify-between gap-3 rounded-2xl bg-ink p-4 text-bg shadow-lg"
          >
            <span className="text-lg font-semibold">{pick.step === "before" ? t.pickBefore : t.pickAfter}</span>
            <button type="button" onClick={() => setPick(null)} aria-label={common.cancel} className="grid size-11 shrink-0 place-items-center rounded-full bg-bg/15">
              <IconX />
            </button>
          </div>
        )}

        {photos.length === 0 ? (
          <p className="text-lg text-ink-2">{t.empty}</p>
        ) : (
          <>
            <p className="mb-3 text-base text-ink-2">{t.reorderHint}</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {photos.map((p) => (
                    <SortableTile
                      key={p.id}
                      photo={p}
                      isCover={p.id === coverPhotoId}
                      pairNo={pairNumber.get(p.id)}
                      picking={pick?.step === "after" && pick.beforeId === p.id}
                      dimmed={!!pick}
                      onPress={() => onTilePress(p)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </>
        )}
      </section>

      {editing && (
        <PhotoSheet
          key={editing.id}
          photo={editing}
          index={photos.indexOf(editing)}
          total={photos.length}
          isCover={editing.id === coverPhotoId}
          roomLabel={roomLabel}
          onClose={() => setEditingId(null)}
          onMove={(dir) => move(photos.indexOf(editing), photos.indexOf(editing) + dir)}
          onStartPair={() => {
            setEditingId(null);
            setPick({ step: "after", beforeId: editing.id });
          }}
          onChanged={(msg) => {
            if (msg) setToast(msg);
            refresh();
          }}
          onDeleted={() => {
            setPhotos((list) => list.filter((p) => p.id !== editing.id));
            setEditingId(null);
            refresh();
          }}
        />
      )}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center md:bottom-8">
        {toast && (
          <p className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-base font-semibold text-bg shadow-lg">
            <IconCheck size={20} />
            {toast}
          </p>
        )}
      </div>
    </div>
  );
}

function statusLabel(s: Upload["status"]) {
  if (s === "processing") return t.processing;
  if (s === "uploading") return t.uploading;
  return t.preparing;
}

function roleChip(role: PhotoRole) {
  const base = "absolute left-2 top-2 rounded-full px-2.5 py-1 text-xs font-bold";
  if (role === "BEFORE") return `${base} bg-ink text-bg`;
  if (role === "AFTER") return `${base} bg-accent text-accent-ink`;
  return `${base} bg-surface text-ink`;
}

function SortableTile({
  photo,
  isCover,
  pairNo,
  picking,
  dimmed,
  onPress,
}: {
  photo: ClientPhoto;
  isCover: boolean;
  pairNo?: number;
  picking: boolean;
  dimmed: boolean;
  onPress: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
  const label = [photoRoles[photo.role], pairNo ? `${pairNo}` : "", photo.alt].filter(Boolean).join(", ");

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative ${isDragging ? "z-20 scale-[1.03] shadow-2xl" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={onPress}
        aria-label={`${admin.photos.edit}: ${label}`}
        className={
          "relative block aspect-square w-full touch-manipulation overflow-hidden rounded-2xl bg-surface-2 " +
          "transition-[opacity,box-shadow] duration-150 " +
          (picking ? "ring-4 ring-accent " : "") +
          (dimmed && !picking ? "hover:ring-4 hover:ring-accent/60 " : "")
        }
      >
        <Image
          src={photo.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 50vw"
          placeholder="blur"
          blurDataURL={photo.lqip}
          className="pointer-events-none object-cover select-none"
          draggable={false}
        />
        {photo.role !== "GALLERY" && (
          <span className={roleChip(photo.role)}>
            {photoRoles[photo.role]}
            {pairNo ? ` ${pairNo}` : ""}
          </span>
        )}
        {isCover && (
          <span className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-surface text-accent">
            <IconStar size={18} />
          </span>
        )}
      </button>
    </li>
  );
}

function PhotoSheet({
  photo,
  index,
  total,
  isCover,
  roomLabel,
  onClose,
  onMove,
  onStartPair,
  onChanged,
  onDeleted,
}: {
  photo: ClientPhoto;
  index: number;
  total: number;
  isCover: boolean;
  roomLabel: string;
  onClose: () => void;
  onMove: (dir: -1 | 1) => void;
  onStartPair: () => void;
  onChanged: (toast?: string) => void;
  onDeleted: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [role, setRole] = useState<PhotoRole>(photo.role);
  const [alt, setAlt] = useState(photo.alt);
  const [caption, setCaption] = useState(photo.caption);
  const [date, setDate] = useState(photo.milestoneDate);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  function chooseRole(next: PhotoRole) {
    setRole(next);
    // Suggest a matching description while it's still the automatic one.
    const suffix =
      next === "BEFORE" ? admin.photos.altBefore : next === "AFTER" ? admin.photos.altAfter : next === "PROGRESS" ? admin.photos.altProgress : "";
    if (suffix && (alt === photo.alt || alt.startsWith(roomLabel))) setAlt(`${roomLabel}, ${suffix}`);
  }

  function save() {
    startTransition(async () => {
      await updatePhoto(photo.id, { alt, caption, role, milestoneDate: date });
      onChanged(common.saved);
      onClose();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="photo-sheet-title"
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-card bg-bg p-0 text-ink backdrop:bg-black/50 md:m-auto md:max-w-xl md:rounded-card"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-bg/95 px-4 py-3 backdrop-blur">
        <h2 id="photo-sheet-title" className="text-xl font-bold">
          {t.edit}
        </h2>
        <button type="button" onClick={onClose} aria-label={common.close} className="grid size-12 place-items-center rounded-full hover:bg-surface-2">
          <IconX />
        </button>
      </div>

      <div className="space-y-6 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="relative overflow-hidden rounded-2xl bg-surface-2" style={{ aspectRatio: `${photo.width} / ${photo.height}`, maxHeight: "45dvh", marginInline: "auto" }}>
          <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 36rem, 100vw" placeholder="blur" blurDataURL={photo.lqip} className="object-contain" />
        </div>

        <fieldset>
          <legend className={labelClass}>{t.role}</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["GALLERY", "BEFORE", "AFTER", "PROGRESS"] as const).map((r) => (
              <label
                key={r}
                className={
                  "flex min-h-14 cursor-pointer items-center justify-center rounded-control border text-lg font-semibold transition-colors duration-150 " +
                  "has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus " +
                  (role === r ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface")
                }
              >
                <input type="radio" name="role" value={r} checked={role === r} onChange={() => chooseRole(r)} className="sr-only" />
                {photoRoles[r]}
              </label>
            ))}
          </div>
        </fieldset>

        {role === "BEFORE" && photo.role === "BEFORE" && !photo.pairedAfterId && (
          <button type="button" onClick={onStartPair} className={`${secondaryButtonClass} w-full`}>
            {t.pairStart}
          </button>
        )}

        <div>
          <label htmlFor="alt" className={labelClass}>
            {t.alt}
          </label>
          <textarea id="alt" value={alt} onChange={(e) => setAlt(e.target.value)} rows={2} maxLength={250} className={`${fieldClass} py-3`} />
          <p className={`mt-1 text-sm ${alt.trim() ? "text-ink-2" : "font-semibold text-danger"}`}>
            {alt.trim() ? t.altHint : t.altMissing}
          </p>
        </div>

        <div>
          <label htmlFor="caption" className={labelClass}>
            {t.caption} <span className="font-normal text-ink-2">({common.optional})</span>
          </label>
          <input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={250} className={fieldClass} />
        </div>

        {role === "PROGRESS" && (
          <div>
            <label htmlFor="milestone" className={labelClass}>
              {t.milestoneDate}
            </label>
            <input id="milestone" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className={secondaryButtonClass}>
            <IconChevronUp />
            {t.moveUp}
          </button>
          <button type="button" disabled={index === total - 1} onClick={() => onMove(1)} className={secondaryButtonClass}>
            <IconChevronDown />
            {t.moveDown}
          </button>
        </div>

        {isCover ? (
          <p className="flex min-h-14 items-center justify-center gap-2 rounded-control bg-accent-soft text-lg font-semibold text-accent">
            <IconStar />
            {t.cover}
          </p>
        ) : (
          <button
            type="button"
            className={`${secondaryButtonClass} w-full`}
            onClick={() => startTransition(async () => { await setCover(photo.id); onChanged(common.saved); })}
          >
            <IconStar />
            {t.makeCover}
          </button>
        )}

        <button type="button" disabled={pending || !alt.trim()} onClick={save} className={`${primaryButtonClass} w-full`}>
          {pending ? common.saving : common.save}
        </button>

        <button
          type="button"
          className="mx-auto block min-h-12 px-4 text-base font-semibold text-danger"
          onClick={() => {
            if (!confirm(t.confirmDeletePhoto)) return;
            startTransition(async () => {
              await deletePhoto(photo.id);
              onDeleted();
            });
          }}
        >
          {t.deletePhoto}
        </button>
      </div>
    </dialog>
  );
}
