"use client";

import { useRef, useState, useTransition } from "react";
import { deleteVideo, updateVideoCaption } from "@/app/admin/(app)/projects/actions";
import { UploadError } from "@/lib/client-image";
import type { ClientVideo } from "@/lib/videos";
import { cardClass, fieldClass, secondaryButtonClass } from "@/components/admin/ui";
import { IconCheck } from "@/components/icons";
import { admin, common } from "@/messages/mn";

const t = admin.videos;
const MAX_BYTES = 500 * 1024 * 1024;

type Upload = { id: number; name: string; progress: number; status: "poster" | "uploading" | "failed"; error?: string };

/** Some phones leave file.type empty for .mov; fall back to the extension. */
function videoType(file: File) {
  if (file.type) return file.type === "video/x-m4v" ? "video/mp4" : file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "mov" ? "video/quicktime" : ext === "webm" ? "video/webm" : "video/mp4";
}

/**
 * Reads size and length in the browser and grabs a poster frame about a second
 * in. If this browser can't decode the file (e.g. HEVC on an old desktop), the
 * video still uploads; it just has no poster.
 */
async function readVideo(file: File) {
  const url = URL.createObjectURL(file);
  const v = document.createElement("video");
  v.muted = true;
  v.playsInline = true;
  v.preload = "auto";
  v.src = url;
  const once = (event: "loadedmetadata" | "seeked", ms: number) =>
    new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), ms);
      v.addEventListener(event, () => (clearTimeout(timer), resolve()), { once: true });
      v.addEventListener("error", () => (clearTimeout(timer), reject(new Error("decode"))), { once: true });
    });
  try {
    await once("loadedmetadata", 15000);
    const meta = { width: v.videoWidth, height: v.videoHeight, duration: Number.isFinite(v.duration) ? v.duration : 0 };
    let poster: Blob | null = null;
    try {
      v.currentTime = Math.min(1, (meta.duration || 2) / 4);
      await once("seeked", 10000);
      const scale = Math.min(1, 1920 / Math.max(v.videoWidth, v.videoHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(v.videoWidth * scale);
      canvas.height = Math.round(v.videoHeight * scale);
      canvas.getContext("2d")?.drawImage(v, 0, 0, canvas.width, canvas.height);
      poster = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
    } catch {
      // No poster; the video itself is still fine.
    }
    return { ...meta, poster };
  } catch {
    return { width: 0, height: 0, duration: 0, poster: null };
  } finally {
    v.removeAttribute("src");
    v.load();
    URL.revokeObjectURL(url);
  }
}

/** Raw-body XHR so the bytes stream to disk on the server and progress is visible. */
function sendVideo(url: string, file: File, meta: { width: number; height: number; duration: number }, onProgress: (f: number) => void) {
  return new Promise<ClientVideo>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "json";
    xhr.setRequestHeader("Content-Type", videoType(file));
    xhr.setRequestHeader("X-Video-Width", String(meta.width));
    xhr.setRequestHeader("X-Video-Height", String(meta.height));
    xhr.setRequestHeader("X-Video-Duration", String(Math.round(meta.duration)));
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve(xhr.response as ClientVideo)
        : reject(new UploadError(xhr.status, (xhr.response as { error?: string } | null)?.error));
    xhr.onerror = () => reject(new UploadError(0, "network"));
    xhr.send(file);
  });
}

async function sendPoster(videoId: number, poster: Blob) {
  const form = new FormData();
  form.append("file", poster, "poster.jpg");
  const res = await fetch(`/api/admin/videos/${videoId}/poster`, { method: "POST", body: form });
  return res.ok ? ((await res.json()) as ClientVideo) : null;
}

export function VideoManager({ projectId, initial }: { projectId: number; initial: ClientVideo[] }) {
  const [videos, setVideos] = useState(initial);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, start] = useTransition();

  const patch = (id: number, p: Partial<Upload>) => setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...p } : u)));

  async function upload(files: FileList | null) {
    for (const file of Array.from(files ?? [])) {
      const id = Date.now() + Math.random();
      if (file.size > MAX_BYTES) {
        setUploads((list) => [...list, { id, name: file.name, progress: 0, status: "failed", error: t.tooBig }]);
        continue;
      }
      setUploads((list) => [...list, { id, name: file.name, progress: 0, status: "poster" }]);
      try {
        const meta = await readVideo(file);
        patch(id, { status: "uploading" });
        let video = await sendVideo(`/api/admin/projects/${projectId}/videos`, file, meta, (progress) => patch(id, { progress }));
        if (meta.poster) video = (await sendPoster(video.id, meta.poster)) ?? video;
        setVideos((list) => [...list, video]);
        setUploads((list) => list.filter((u) => u.id !== id));
      } catch (err) {
        const code = err instanceof UploadError ? err.code : undefined;
        patch(id, { status: "failed", error: code === "too_big" ? t.tooBig : code === "unsupported" ? t.unsupported : common.errorGeneric });
      }
    }
  }

  return (
    <section className="container-page mt-10 max-w-2xl" aria-labelledby="videos-title">
      <h2 id="videos-title" className="text-xl font-bold">
        {t.title}
      </h2>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.m4v,.webm"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          upload(e.target.files);
          e.target.value = "";
        }}
      />
      <button type="button" onClick={() => inputRef.current?.click()} className={`${secondaryButtonClass} mt-3 w-full`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="6" width="13" height="12" rx="2.5" />
          <path d="m16 10.5 5-3v9l-5-3" />
        </svg>
        {t.upload}
      </button>
      <p className="mt-2 text-center text-base text-ink-2">{t.uploadHint}</p>

      {uploads.length > 0 && (
        <ul className="mt-4 space-y-2" aria-live="polite">
          {uploads.map((u) => (
            <li key={u.id} className={`${cardClass} p-4`}>
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-base">{u.name}</span>
                <span className="shrink-0 text-sm font-semibold text-ink-2 tabular">
                  {u.status === "uploading" ? `${Math.round(u.progress * 100)}%` : u.status === "poster" ? t.poster : t.failed}
                </span>
              </div>
              {u.status === "failed" ? (
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="text-base text-danger">{u.error}</p>
                  <button type="button" onClick={() => setUploads((list) => list.filter((x) => x.id !== u.id))} className="shrink-0 text-base font-semibold text-ink-2">
                    {common.close}
                  </button>
                </div>
              ) : (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={`h-full rounded-full bg-accent transition-[width] duration-200 ${u.status === "poster" ? "animate-pulse" : ""}`}
                    style={{ width: `${Math.max(4, u.progress * 100)}%` }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <ul className="mt-5 space-y-3">
        {videos.map((v) => (
          <VideoRow
            key={v.id}
            video={v}
            onDelete={() => {
              if (!confirm(t.confirmDelete)) return;
              setVideos((list) => list.filter((x) => x.id !== v.id));
              start(() => deleteVideo(v.id));
            }}
          />
        ))}
      </ul>
    </section>
  );
}

function VideoRow({ video, onDelete }: { video: ClientVideo; onDelete: () => void }) {
  const [caption, setCaption] = useState(video.caption);
  const [saved, setSaved] = useState(true);
  const [pending, start] = useTransition();
  const id = `video-caption-${video.id}`;
  const mb = video.sizeBytes / 1024 / 1024;
  const meta = `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} ${t.mb}${video.durationSec ? `, ${Math.floor(video.durationSec / 60)}:${String(video.durationSec % 60).padStart(2, "0")}` : ""}`;

  return (
    <li className={`${cardClass} p-3`}>
      <div className="flex gap-3">
        <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-2 text-center text-xs text-ink-2">
          {video.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${video.poster.src}/480`} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            t.noPoster
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={id} className="text-sm font-semibold">
              {t.caption}
            </label>
            <span className="text-sm text-ink-2 tabular">{meta}</span>
          </div>
          <textarea
            id={id}
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              setSaved(false);
            }}
            rows={2}
            maxLength={250}
            placeholder={t.captionPlaceholder}
            className={`${fieldClass} mt-1 min-h-16 py-2 text-base`}
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!saved ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await updateVideoCaption(video.id, caption);
                setSaved(true);
              })
            }
            className={`${secondaryButtonClass} min-h-11 px-5 text-base`}
          >
            {pending ? common.saving : common.save}
          </button>
        ) : (
          caption && <IconCheck size={18} className="text-success" />
        )}
        <a href={video.src} target="_blank" rel="noopener" className="min-h-11 content-center px-2 text-base font-semibold text-ink-2 underline underline-offset-4">
          {t.view}
        </a>
        <button type="button" onClick={onDelete} className="ml-auto min-h-11 px-2 text-base font-semibold text-danger">
          {common.delete}
        </button>
      </div>
    </li>
  );
}
