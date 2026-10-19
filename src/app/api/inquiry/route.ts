import { after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { processImage, deleteImage } from "@/lib/images";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { notifyAdmin } from "@/lib/push";
import { ROOMS, SERVICE_SLUGS } from "@/lib/catalog";
import { adminSettings, districts, rooms, serviceNames } from "@/messages/mn";

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
const MIN_FILL_MS = 3000;

const schema = z.object({
  serviceSlug: z.union([z.enum(SERVICE_SLUGS), z.literal("")]),
  room: z.union([z.enum(ROOMS), z.literal("")]),
  areaM2: z.string().trim().max(10),
  district: z.union([z.enum(districts), z.literal("")]),
  message: z.string().trim().min(3).max(4000),
  timing: z.union([z.enum(["ASAP", "MONTH", "LATER", "FLEXIBLE"]), z.literal("")]),
  contactMethod: z.enum(["MESSENGER", "VIBER"]),
  contactValue: z.string().trim().min(3).max(190),
  name: z.string().trim().max(190),
});

// Accepts both fetch (JS, returns JSON) and a plain form post (no JS,
// redirects to the thank-you page).
export async function POST(request: Request) {
  const wantsJson = request.headers.get("accept")?.includes("application/json") ?? false;
  const fail = (error: string, status = 400) =>
    wantsJson
      ? Response.json({ error }, { status })
      : Response.redirect(new URL(`/holboo-barikh?error=${error}`, request.url), 303);

  const form = await request.formData().catch(() => null);
  if (!form) return fail("generic");

  // Bots fill the hidden field and submit instantly.
  const startedAt = Number(form.get("startedAt"));
  if (form.get("website") || !startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    return wantsJson ? Response.json({ ok: true }) : Response.redirect(new URL("/holboo-barikh/amjilttai", request.url), 303);
  }

  if (!(await rateLimit(`inquiry:${clientIp(request.headers)}`, 5, 60 * 60 * 1000))) return fail("tooMany", 429);

  const parsed = schema.safeParse({
    serviceSlug: form.get("serviceSlug") ?? "",
    room: form.get("room") ?? "",
    areaM2: form.get("areaM2") ?? "",
    district: form.get("district") ?? "",
    message: form.get("message") ?? "",
    timing: form.get("timing") ?? "",
    contactMethod: form.get("contactMethod") ?? "MESSENGER",
    contactValue: form.get("contactValue") ?? "",
    name: form.get("name") ?? "",
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return fail(field === "message" ? "message" : field === "contactValue" ? "contact" : "generic");
  }
  const d = parsed.data;

  const files = form
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_PHOTOS);
  const images = [];
  try {
    for (const file of files) {
      if (file.size > MAX_PHOTO_BYTES) throw new Error("too big");
      images.push(await processImage(Buffer.from(await file.arrayBuffer()), "private"));
    }
  } catch {
    await Promise.all(images.map((img) => deleteImage("private", img.storageKey)));
    return fail("photo");
  }

  const area = Number(d.areaM2.replace(",", "."));
  const created = await db.inquiry.create({
    data: {
      serviceSlug: d.serviceSlug,
      room: d.room || null,
      areaM2: d.areaM2 && Number.isFinite(area) && area > 0 && area < 100000 ? area : null,
      district: d.district,
      message: d.message,
      timing: d.timing,
      contactMethod: d.contactMethod,
      contactValue: d.contactValue,
      name: d.name,
      adminNote: "",
      photos: { create: images },
    },
  });

  // Notify after the response so the client never waits on push services.
  after(() =>
    notifyAdmin({
      title: adminSettings.newInquiryTitle,
      body: [
        d.serviceSlug ? serviceNames[d.serviceSlug] : "",
        d.room ? rooms[d.room] : "",
        d.district,
        d.message.slice(0, 80),
      ]
        .filter(Boolean)
        .join(" · "),
      url: `/admin/inquiries/${created.id}`,
    }),
  );

  return wantsJson
    ? Response.json({ ok: true })
    : Response.redirect(new URL("/holboo-barikh/amjilttai", request.url), 303);
}

