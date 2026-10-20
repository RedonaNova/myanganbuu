"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { prepareImage, uploadWithProgress, UploadError } from "@/lib/client-image";
import { MediaImage } from "@/components/media-image";
import { cardClass, secondaryButtonClass } from "@/components/admin/ui";
import { IconCamera } from "@/components/icons";
import { admin, adminAbout as t, common } from "@/messages/mn";

type Photo = { id: number; src: string; width: number; height: number; lqip: string; alt: string; caption: string };

/** His profile photo: one slot, replaced in place. */
export function PortraitPicker({ portrait }: { portrait: Photo | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [, start] = useTransition();

  async function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    setProgress(0);
    try {
      const blob = await prepareImage(file);
      await uploadWithProgress<Photo>("/api/admin/site-photos?portrait=1", blob, file.name, setProgress);
      start(() => router.refresh());
    } catch (err) {
      setError(err instanceof UploadError && err.code === "unsupported" ? admin.photos.unsupported : common.errorGeneric);
    } finally {
      setProgress(null);
    }
  }

  return (
    <section className={`${cardClass} flex items-center gap-5 p-5`}>
      <div className="relative size-28 shrink-0 overflow-hidden rounded-full bg-surface-2">
        {portrait && <MediaImage photo={portrait} alt="" sizes="112px" fill className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-bold">{t.portraitTitle}</h2>
        <p className="mt-1 text-base text-ink-2">{t.portraitHint}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            upload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button type="button" disabled={progress !== null} onClick={() => inputRef.current?.click()} className={`${secondaryButtonClass} mt-3 min-h-12 px-5 text-base`}>
          <IconCamera size={20} />
          {progress !== null ? `${Math.round(progress * 100)}%` : portrait ? t.changePortrait : t.addPortrait}
        </button>
        {error && (
          <p role="alert" className="mt-2 text-base text-danger">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
