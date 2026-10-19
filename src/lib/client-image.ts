"use client";

const MAX_EDGE = 2560;

/**
 * Shrinks a phone photo before upload (12 MB → ~1.5 MB) while applying its
 * EXIF orientation. Falls back to the original file when the browser can't
 * decode it (e.g. HEIC on Android Chrome); the server then tries itself.
 */
export async function prepareImage(file: File): Promise<Blob> {
  if (typeof createImageBitmap !== "function") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  // Already small JPEG: re-encoding would only lose quality.
  if (scale === 1 && file.type === "image/jpeg" && file.size < 2_500_000) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
  return blob ?? file;
}

export type UploadProgress = (fraction: number) => void;

/** XHR (not fetch) so upload progress is observable. */
export function uploadWithProgress<T>(url: string, blob: Blob, name: string, onProgress: UploadProgress) {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response as T);
      else reject(new UploadError(xhr.status, (xhr.response as { error?: string } | null)?.error));
    };
    xhr.onerror = () => reject(new UploadError(0, "network"));
    const form = new FormData();
    form.append("file", blob, name.replace(/\.\w+$/, "") + ".jpg");
    xhr.send(form);
  });
}

export class UploadError extends Error {
  constructor(
    public status: number,
    public code?: string,
  ) {
    super(code ?? `HTTP ${status}`);
  }
}
