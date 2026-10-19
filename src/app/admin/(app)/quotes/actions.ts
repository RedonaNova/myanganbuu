"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { normalizeQty } from "@/lib/quote-math";

// ─── Rate card ───────────────────────────────────────────────────────────

const rateSchema = z.object({
  id: z.number().int().optional(),
  label: z.string().trim().min(1).max(190),
  unit: z.string().trim().min(1).max(32),
  unitPrice: z.number().int().min(0).max(1_000_000_000),
  category: z.string().trim().max(64),
});

export async function saveRateItem(input: z.input<typeof rateSchema>) {
  await requireAdmin();
  const { id, ...data } = rateSchema.parse(input);
  if (id) return db.rateItem.update({ where: { id }, data });
  const last = await db.rateItem.findFirst({ orderBy: { sortOrder: "desc" } });
  return db.rateItem.create({ data: { ...data, sortOrder: (last?.sortOrder ?? -1) + 1 } });
}

export async function deleteRateItem(id: number) {
  await requireAdmin();
  await db.rateItem.delete({ where: { id } });
}

export async function reorderRateItems(ids: number[]) {
  await requireAdmin();
  await db.$transaction(ids.map((id, i) => db.rateItem.update({ where: { id }, data: { sortOrder: i } })));
}

// ─── Quotes ──────────────────────────────────────────────────────────────

const quoteSchema = z.object({
  clientName: z.string().trim().max(190),
  address: z.string().trim().max(255),
  note: z.string().trim().max(4000),
  includesMaterials: z.boolean(),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  inquiryId: z.number().int().nullable(),
  lines: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(190),
        unit: z.string().trim().max(32),
        unitPrice: z.number().int().min(0).max(1_000_000_000),
        quantity: z.number().min(0).max(1_000_000),
      }),
    )
    .max(200),
});

export type QuoteInput = z.input<typeof quoteSchema>;

/** Creates or replaces a quote. Lines are snapshots, not links to the rate card. */
export async function saveQuote(id: number | null, input: QuoteInput): Promise<{ id: number; token: string }> {
  await requireAdmin();
  const d = quoteSchema.parse(input);
  const data = {
    clientName: d.clientName,
    address: d.address,
    note: d.note,
    includesMaterials: d.includesMaterials,
    validUntil: new Date(`${d.validUntil}T00:00:00Z`),
    inquiryId: d.inquiryId,
  };
  const lines = d.lines.map((l, i) => ({ ...l, quantity: normalizeQty(l.quantity), sortOrder: i }));

  const quote = id
    ? await db.$transaction(async (tx) => {
        await tx.quoteLine.deleteMany({ where: { quoteId: id } });
        return tx.quote.update({ where: { id }, data: { ...data, lines: { create: lines } } });
      })
    : await db.quote.create({
        data: { ...data, publicToken: randomBytes(16).toString("base64url"), lines: { create: lines } },
      });

  // Quoting an inquiry moves it along the status flow.
  if (d.inquiryId) {
    await db.inquiry.updateMany({
      where: { id: d.inquiryId, status: { in: ["NEW", "CONTACTED"] } },
      data: { status: "QUOTED" },
    });
  }
  updateTag(`quote:${quote.publicToken}`);
  return { id: quote.id, token: quote.publicToken };
}

export async function deleteQuote(id: number) {
  await requireAdmin();
  const quote = await db.quote.delete({ where: { id } });
  updateTag(`quote:${quote.publicToken}`);
  redirect("/admin/quotes");
}
