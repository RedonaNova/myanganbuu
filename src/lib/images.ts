import "server-only";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import sharp from "sharp";

/** Widths generated for every photo. Must match next.config deviceSizes. */
export const WIDTHS = [480, 828, 1200, 1920] as const;
export type Width = (typeof WIDTHS)[number];

/** public = portfolio photos served at /media; private = client inquiry photos. */
export type Visibility = "public" | "private";

// Runtime data directory, outside the build: excluded from output tracing.
export function uploadRoot() {
  return path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "./.data/uploads");
}

export function variantDir(visibility: Visibility, key: string) {
  return path.join(/*turbopackIgnore: true*/ uploadRoot(), visibility, key);
}

export const KEY_PATTERN = /^[a-f0-9]{24}$/;

export type ProcessedImage = {
  storageKey: string;
  width: number;
  height: number;
  lqip: string;
};

// Phone photos are big: cap decoded size so a hostile upload can't exhaust RAM.
const MAX_INPUT_PIXELS = 60_000_000;

/**
 * Normalises an uploaded photo and writes all variants to disk:
 *  - applies EXIF orientation, then strips all metadata (incl. GPS)
 *  - AVIF + WebP at each width, plus a JPEG at 1200 for OG images / PDFs
 *  - a tiny blurred WebP data URL used as the loading placeholder
 */
export async function processImage(input: Buffer, visibility: Visibility): Promise<ProcessedImage> {
  const base = sharp(input, { failOn: "error", limitInputPixels: MAX_INPUT_PIXELS })
    .rotate() // honour EXIF orientation
    .toColourspace("srgb");

  // Materialise the upright master once; every variant derives from it.
  const { data: master, info } = await base
    .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  const storageKey = randomBytes(12).toString("hex");
  const dir = variantDir(visibility, storageKey);
  await mkdir(dir, { recursive: true });

  try {
    await Promise.all(
      WIDTHS.flatMap((w) => {
        const resized = () => sharp(master).resize({ width: w, withoutEnlargement: true });
        return [
          resized()
            .avif({ quality: 55, effort: 4 })
            .toFile(path.join(dir, `${w}.avif`)),
          resized()
            .webp({ quality: 78, effort: 4 })
            .toFile(path.join(dir, `${w}.webp`)),
        ];
      }),
    );
    await sharp(master)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(dir, "1200.jpg"));

    const tiny = await sharp(master).resize({ width: 16 }).blur(0.6).webp({ quality: 40 }).toBuffer();
    const lqip = `data:image/webp;base64,${tiny.toString("base64")}`;

    return { storageKey, width: info.width, height: info.height, lqip };
  } catch (err) {
    await rm(dir, { recursive: true, force: true });
    throw err;
  }
}

export async function deleteImage(visibility: Visibility, key: string) {
  if (!KEY_PATTERN.test(key)) return;
  await rm(variantDir(visibility, key), { recursive: true, force: true });
}
