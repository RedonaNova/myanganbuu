import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// sharp keeps output files open in its cache, which blocks cleanup on Windows.
sharp.cache(false);
import { processImage, variantDir, WIDTHS } from "@/lib/images";

let dir: string;
beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "mb-img-"));
  process.env.UPLOAD_DIR = dir;
});
afterAll(() => rm(dir, { recursive: true, force: true }));

// A landscape-stored 3000×2000 sensor image tagged "rotate 90° CW"
// (EXIF orientation 6), with GPS data — exactly what phones produce.
async function phonePhoto() {
  return sharp({ create: { width: 3000, height: 2000, channels: 3, background: "#b0784a" } })
    .jpeg()
    .withExif({ IFD0: { Make: "TestPhone" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "47/1 55/1 0/1" } })
    .withMetadata({ orientation: 6 })
    .toBuffer();
}

describe("processImage", () => {
  it("fixes orientation, strips metadata and writes every variant", async () => {
    const result = await processImage(await phonePhoto(), "public");

    // Rotated upright: portrait, capped at 2560 on the long edge.
    expect(result.width).toBeLessThan(result.height);
    expect(result.height).toBe(2560);
    expect(result.lqip).toMatch(/^data:image\/webp;base64,/);
    expect(result.storageKey).toMatch(/^[a-f0-9]{24}$/);

    const out = variantDir("public", result.storageKey);
    const files = (await readdir(out)).sort();
    const expected = [...WIDTHS.flatMap((w) => [`${w}.avif`, `${w}.webp`]), "1200.jpg"].sort();
    expect(files).toEqual(expected);

    for (const file of files) {
      const meta = await sharp(path.join(out, file)).metadata();
      expect(meta.exif, `${file} should have no EXIF`).toBeUndefined();
      expect(meta.orientation ?? 1).toBe(1);
      expect(meta.width!).toBeLessThan(meta.height!);
    }
    const w828 = await sharp(path.join(out, "828.webp")).metadata();
    expect(w828.width).toBe(828);
  });

  it("rejects non-images", async () => {
    await expect(processImage(Buffer.from("not an image"), "public")).rejects.toThrow();
  });
});
