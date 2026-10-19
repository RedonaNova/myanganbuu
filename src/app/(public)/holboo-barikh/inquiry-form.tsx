"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { prepareImage } from "@/lib/client-image";
import { ROOMS, SERVICE_SLUGS } from "@/lib/catalog";
import type { contactMethods as ContactMethods, districts as Districts, inquiry as Inquiry, rooms as Rooms, serviceNames as ServiceNames } from "@/messages/mn";

export type InquiryCopy = {
  t: typeof Inquiry;
  rooms: typeof Rooms;
  serviceNames: typeof ServiceNames;
  contactMethods: typeof ContactMethods;
  districts: typeof Districts;
};

const MAX_PHOTOS = 6;

type ErrorKey = keyof typeof Inquiry.errors;

const field =
  "block w-full min-h-14 rounded-control border border-line bg-surface px-4 text-lg text-ink placeholder:text-ink-2/70 " +
  "transition-[border-color,box-shadow] duration-150 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20";
const label = "mb-2 block text-lg font-semibold";
const tile =
  "flex min-h-13 cursor-pointer items-center justify-center rounded-control border border-line bg-surface px-3 text-center text-base leading-tight font-semibold " +
  "transition-colors duration-150 hover:border-ink-2 has-checked:border-ink has-checked:bg-ink has-checked:text-bg " +
  "has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus";

/**
 * Works as a plain multipart form without JS. With JS it shrinks photos
 * before sending (mobile data), shows previews and stays on the page on error.
 */
export function InquiryForm({
  startedAt,
  initialError,
  copy: { t, rooms, serviceNames, contactMethods, districts },
}: {
  startedAt: number;
  initialError?: ErrorKey;
  /** Passed from the server so the client bundle carries only this page's copy. */
  copy: InquiryCopy;
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [error, setError] = useState<ErrorKey | undefined>(initialError);
  const [sending, setSending] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- marks hydration
  useEffect(() => setEnhanced(true), []);
  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), [photos]);

  function addPhotos(list: FileList | null) {
    if (!list) return;
    const next = Array.from(list)
      .slice(0, MAX_PHOTOS - photos.length)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotos((p) => [...p, ...next]);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (!String(data.get("message") ?? "").trim()) return showError("message");
    if (String(data.get("contactValue") ?? "").trim().length < 3) return showError("contact");

    setSending(true);
    setError(undefined);
    try {
      for (const p of photos) data.append("photos", await prepareImage(p.file, 1600), "photo.jpg");
      const res = await fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: ErrorKey };
      if (!res.ok || !body.ok) throw body.error ?? "generic";
      router.push("/holboo-barikh/amjilttai");
    } catch (err) {
      showError(typeof err === "string" && err in t.errors ? (err as ErrorKey) : "generic");
      setSending(false);
    }
  }

  function showError(key: ErrorKey) {
    setError(key);
    requestAnimationFrame(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  return (
    <form
      action="/api/inquiry"
      method="post"
      encType="multipart/form-data"
      onSubmit={onSubmit}
      className="group/form space-y-10"
      noValidate={enhanced}
    >
      <input type="hidden" name="startedAt" value={startedAt} />
      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          {t.name}
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset>
        <legend className={label}>{t.service}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SERVICE_SLUGS.map((s) => (
            <label key={s} className={tile}>
              <input type="radio" name="serviceSlug" value={s} className="sr-only" />
              {serviceNames[s]}
            </label>
          ))}
          <label className={tile}>
            <input type="radio" name="serviceSlug" value="" defaultChecked className="sr-only" />
            {t.serviceOther}
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className={label}>{t.room}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ROOMS.map((r) => (
            <label key={r} className={tile}>
              <input type="radio" name="room" value={r} className="sr-only" />
              {rooms[r]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="areaM2" className={label}>
            {t.area}
          </label>
          <input id="areaM2" name="areaM2" inputMode="decimal" className={`${field} tabular`} aria-describedby="area-hint" />
          <p id="area-hint" className="mt-2 text-base text-ink-2">
            {t.areaHint}
          </p>
        </div>
        <div>
          <label htmlFor="district" className={label}>
            {t.district}
          </label>
          <select id="district" name="district" defaultValue="" className={field}>
            <option value="">{t.chooseDistrict}</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className={label}>
          {t.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          maxLength={4000}
          placeholder={t.messagePlaceholder}
          className={`${field} py-3 leading-relaxed`}
        />
      </div>

      <div>
        <p className={label} id="photos-label">
          {t.photos}
        </p>
        <p className="-mt-1 mb-3 text-base text-ink-2">{t.photosHint}</p>
        {enhanced ? (
          <>
            {photos.length > 0 && (
              <ul className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {photos.map((p, i) => (
                  <li key={p.url} className="relative aspect-square overflow-hidden rounded-xl bg-surface-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
                    <img src={p.url} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos((list) => list.filter((_, j) => j !== i))}
                      aria-label={t.removePhoto}
                      className="absolute top-1 right-1 grid size-9 place-items-center rounded-full bg-black/60 text-white"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M6 6l12 12M18 6 6 18" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-describedby="photos-label"
                className="inline-flex min-h-14 items-center gap-2 rounded-full border border-dashed border-ink-2 px-6 text-lg font-semibold transition-colors duration-150 hover:border-ink"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {t.addPhotos}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => {
                addPhotos(e.target.files);
                e.target.value = "";
              }}
            />
          </>
        ) : (
          <input type="file" name="photos" accept="image/*" multiple aria-labelledby="photos-label" className="text-base" />
        )}
      </div>

      <fieldset>
        <legend className={label}>{t.timing}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(t.timings) as (keyof typeof t.timings)[]).map((k) => (
            <label key={k} className={`${tile} justify-start px-4 text-left`}>
              <input type="radio" name="timing" value={k} className="sr-only" />
              {t.timings[k]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-card border border-line bg-surface p-5 md:p-6">
        <legend className="px-2 text-lg font-semibold">{t.contact}</legend>
        <div className="grid grid-cols-2 gap-2 rounded-full bg-surface-2 p-1">
          {(["MESSENGER", "VIBER"] as const).map((m) => (
            <label
              key={m}
              className="flex min-h-12 cursor-pointer items-center justify-center rounded-full text-base font-semibold text-ink-2 transition-colors duration-150 has-checked:bg-surface has-checked:text-ink has-checked:shadow-sm has-focus-visible:outline-3 has-focus-visible:outline-focus"
            >
              <input type="radio" name="contactMethod" value={m} defaultChecked={m === "MESSENGER"} className="sr-only" />
              {contactMethods[m]}
            </label>
          ))}
        </div>
        <div className="mt-5">
          {/* Label follows the chosen method with CSS only, so it also works without JS. */}
          <label htmlFor="contactValue" className={label}>
            <span className="group-has-[[value=VIBER]:checked]/form:hidden">{t.contactMessengerLabel}</span>
            <span className="hidden group-has-[[value=VIBER]:checked]/form:inline">{t.contactViberLabel}</span>
          </label>
          <input id="contactValue" name="contactValue" required maxLength={190} autoComplete="off" className={field} />
        </div>
        <div className="mt-5">
          <label htmlFor="name" className={label}>
            {t.name}
          </label>
          <input id="name" name="name" maxLength={190} autoComplete="name" className={field} />
        </div>
      </fieldset>

      <p ref={errorRef} role="alert" className="min-h-7 text-lg font-semibold text-danger">
        {error ? t.errors[error] : null}
      </p>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex min-h-16 w-full items-center justify-center rounded-full bg-accent px-8 text-xl font-semibold text-accent-ink transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60 sm:w-auto"
      >
        {sending ? t.sending : t.submit}
      </button>
    </form>
  );
}
