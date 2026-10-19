import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAdmin } from "@/lib/session";
import { KEY_PATTERN, WIDTHS, variantDir } from "@/lib/images";

// Client inquiry photos are private (people's homes): admin session required.
export async function GET(request: Request, ctx: RouteContext<"/api/admin/inquiry-media/[key]/[file]">) {
  if (!(await getAdmin())) return new Response(null, { status: 401 });
  const { key, file } = await ctx.params;
  const requested = Number(file);
  if (!KEY_PATTERN.test(key) || !Number.isInteger(requested)) return new Response(null, { status: 404 });

  const width = WIDTHS.find((w) => w >= requested) ?? WIDTHS[WIDTHS.length - 1];
  const avif = (request.headers.get("accept") ?? "").includes("image/avif");
  const name = `${width}.${avif ? "avif" : "webp"}`;
  try {
    const data = await readFile(
      /*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ variantDir("private", key), name),
    );
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": avif ? "image/avif" : "image/webp",
        "Cache-Control": "private, max-age=86400",
        Vary: "Accept, Cookie",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
