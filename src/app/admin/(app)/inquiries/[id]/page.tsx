import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { area, longDate } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { cardClass, primaryButtonClass } from "@/components/admin/ui";
import { InquiryControls } from "./inquiry-controls";
import { adminInquiries as t, contactMethods, inquiry as form, rooms, serviceNames } from "@/messages/mn";

/** Best-effort link that opens the client's chat directly. */
function contactLink(method: "MESSENGER" | "VIBER", value: string) {
  const v = value.trim();
  if (method === "VIBER") {
    const digits = v.replace(/[^\d+]/g, "");
    const intl = digits.startsWith("+") ? digits : digits.length === 8 ? `+976${digits}` : `+${digits}`;
    return `viber://chat?number=${encodeURIComponent(intl)}`;
  }
  const url = /^(https?:\/\/)?(www\.|m\.)?(facebook|fb)\.com\/[^\s]+/i.exec(v);
  if (url) {
    const handle = v.replace(/^(https?:\/\/)?(www\.|m\.)?(facebook|fb)\.com\//i, "").split(/[/?#]/)[0];
    if (handle && handle !== "profile.php") return `https://m.me/${handle}`;
    return v.startsWith("http") ? v : `https://${v}`;
  }
  return `https://www.facebook.com/search/people/?q=${encodeURIComponent(v)}`;
}

export default async function InquiryPage({ params }: PageProps<"/admin/inquiries/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  const q = Number.isInteger(id) ? await db.inquiry.findUnique({ where: { id }, include: { photos: true } }) : null;
  if (!q) notFound();

  const details = [
    { label: form.service, value: q.serviceSlug ? serviceNames[q.serviceSlug as keyof typeof serviceNames] : "" },
    { label: form.room, value: q.room ? rooms[q.room] : "" },
    { label: form.area, value: q.areaM2 ? area(Number(q.areaM2)) : "" },
    { label: form.district, value: q.district },
    { label: form.timing, value: q.timing ? form.timings[q.timing as keyof typeof form.timings] : "" },
  ];

  const received = `${t.received}: ${longDate(q.createdAt)}`;

  return (
    <>
      <PageHeader title={q.name || q.contactValue} backHref="/admin/inquiries" />
      <div className="container-page grid max-w-3xl gap-4">
        <p className="text-base text-ink-2">{received}</p>

        <section className={`${cardClass} p-5`}>
          <h2 className="text-base font-semibold text-ink-2">{t.contactVia}</h2>
          <p className="mt-1 text-xl font-bold break-all">{q.contactValue}</p>
          <p className="text-base text-ink-2">{contactMethods[q.contactMethod]}</p>
          <a href={contactLink(q.contactMethod, q.contactValue)} rel="noopener" className={`${primaryButtonClass} mt-4 w-full`}>
            {q.contactMethod === "VIBER" ? t.openViber : t.openMessenger}
          </a>
        </section>

        <section className={`${cardClass} p-5`}>
          <p className="text-lg leading-relaxed whitespace-pre-line">{q.message}</p>
          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5">
            {details.map((d) => (
              <div key={d.label}>
                <dt className="text-sm text-ink-2">{d.label}</dt>
                <dd className="mt-0.5 text-base font-semibold">{d.value || t.notSpecified}</dd>
              </div>
            ))}
          </dl>
        </section>

        {q.photos.length > 0 && (
          <section className={`${cardClass} p-5`}>
            <h2 className="text-lg font-bold">{t.photos}</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {q.photos.map((p) => (
                <li key={p.id}>
                  <a href={`/api/admin/inquiry-media/${p.storageKey}/1920`} target="_blank" className="block overflow-hidden rounded-xl bg-surface-2" style={{ aspectRatio: `${p.width} / ${p.height}` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- private, auth-gated */}
                    <img src={`/api/admin/inquiry-media/${p.storageKey}/480`} alt="" loading="lazy" className="size-full object-cover" style={{ backgroundImage: `url(${p.lqip})`, backgroundSize: "cover" }} />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <InquiryControls id={q.id} status={q.status} note={q.adminNote} />

        <Link href={`/admin/quotes/new?inquiry=${q.id}`} className={`${primaryButtonClass} w-full`}>
          {t.makeQuote}
        </Link>
      </div>
    </>
  );
}
