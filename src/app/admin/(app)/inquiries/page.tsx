import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { shortDate } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { StatusChip } from "@/components/admin/status-chip";
import { cardClass } from "@/components/admin/ui";
import { adminInquiries as t, inquiryStatuses, rooms, serviceNames } from "@/messages/mn";

const STATUSES = ["NEW", "CONTACTED", "QUOTED", "STARTED", "DONE"] as const;

export default async function InquiriesPage({ searchParams }: PageProps<"/admin/inquiries">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status);

  const [inquiries, counts] = await Promise.all([
    db.inquiry.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { _count: { select: { photos: true } } },
    }),
    db.inquiry.groupBy({ by: ["status"], _count: true }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <>
      <PageHeader title={t.title} />
      <nav aria-label={t.status} className="container-page">
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none">
          {[{ key: undefined, label: t.all }, ...STATUSES.map((s) => ({ key: s, label: inquiryStatuses[s] }))].map((f) => {
            const active = f.key === status;
            const n = f.key ? countOf(f.key) : null;
            return (
              <li key={f.label} className="shrink-0">
                <Link
                  href={f.key ? `/admin/inquiries?status=${f.key}` : "/admin/inquiries"}
                  aria-current={active ? "page" : undefined}
                  className={
                    "inline-flex min-h-12 items-center gap-2 rounded-full border px-4 text-base font-semibold whitespace-nowrap " +
                    (active ? "border-ink bg-ink text-bg" : "border-line bg-surface")
                  }
                >
                  {f.label}
                  {n ? <span className="tabular opacity-70">{n}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="container-page mt-4">
        {inquiries.length === 0 ? (
          <p className="text-lg text-ink-2">{t.empty}</p>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {inquiries.map((q) => {
              const topic = [q.serviceSlug && serviceNames[q.serviceSlug as keyof typeof serviceNames], q.room && rooms[q.room], q.district]
                .filter(Boolean)
                .join(" · ");
              const photoCount = `${q._count.photos} ${t.photos.toLowerCase()}`;
              return (
                <li key={q.id}>
                  <Link href={`/admin/inquiries/${q.id}`} className={`${cardClass} block p-5 transition-colors duration-150 hover:border-ink-2`}>
                    <div className="flex items-center justify-between gap-3">
                      <StatusChip status={q.status} />
                      <span className="text-sm text-ink-2 tabular">{shortDate(q.createdAt)}</span>
                    </div>
                    <p className="mt-3 text-lg font-bold">{q.name || q.contactValue}</p>
                    {topic && <p className="mt-0.5 text-base text-ink-2">{topic}</p>}
                    <p className="mt-2 line-clamp-2 text-base">{q.message}</p>
                    {q._count.photos > 0 && (
                      <p className="mt-2 text-sm font-semibold text-ink-2">{photoCount}</p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
