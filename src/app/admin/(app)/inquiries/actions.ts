"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { deleteImage } from "@/lib/images";

const statuses = ["NEW", "CONTACTED", "QUOTED", "STARTED", "DONE"] as const;

export async function setInquiryStatus(id: number, status: (typeof statuses)[number]) {
  await requireAdmin();
  await db.inquiry.update({ where: { id }, data: { status: z.enum(statuses).parse(status) } });
}

export async function saveInquiryNote(id: number, note: string) {
  await requireAdmin();
  await db.inquiry.update({ where: { id }, data: { adminNote: note.slice(0, 4000) } });
}

export async function deleteInquiry(id: number) {
  await requireAdmin();
  const inquiry = await db.inquiry.findUnique({ where: { id }, include: { photos: true } });
  if (inquiry) {
    await db.inquiry.delete({ where: { id } });
    await Promise.all(inquiry.photos.map((p) => deleteImage("private", p.storageKey)));
  }
  redirect("/admin/inquiries");
}
