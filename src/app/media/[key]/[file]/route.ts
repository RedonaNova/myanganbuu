import { readFile } from "node:fs/promises";
import path from "node:path";
import { KEY_PATTERN, WIDTHS, variantDir } from "@/lib/images";

// GET /media/<key>/<width>      → AVIF or WebP, negotiated from Accept
// GET /media/<key>/<width>.jpg  → JPEG (OG images, PDFs, old browsers)
export async function GET(request: Request, ctx: RouteContext<"/media/[key]/[file]">) {
  const { key, file } = await ctx.params;
  const match = /^(\d+)(\.jpg)?$/.exec(file);
  if (!KEY_PATTERN.test(key) || !match) return notFound();

  const requested = Number(match[1]);
  const width = WIDTHS.find((w) => w >= requested) ?? WIDTHS[WIDTHS.length - 1];
  const accept = request.headers.get("accept") ?? "";

  let name: string;
  let type: string;
  if (match[2]) {
    name = "1200.jpg";
    type = "image/jpeg";
  } else if (accept.includes("image/avif")) {
    name = `${width}.avif`;
    type = "image/avif";
  } else {
    name = `${width}.webp`;
    type = "image/webp";
  }

  try {
    const data = await readFile(
      /*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ variantDir("public", key), name),
    );
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(data.length),
        // Keys are random and never reused, so variants are immutable.
        "Cache-Control": "public, max-age=31536000, immutable",
        Vary: "Accept",
      },
    });
  } catch {
    return notFound();
  }
}

function notFound() {
  return new Response(null, { status: 404 });
}
