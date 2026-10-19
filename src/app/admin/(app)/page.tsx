import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { IconArrowRight, IconCamera, IconReceipt } from "@/components/icons";
import { cardClass } from "@/components/admin/ui";
import { admin as t } from "@/messages/mn";

export default async function AdminHome() {
  await requireAdmin();
  const [newInquiries, published] = await Promise.all([
    db.inquiry.count({ where: { status: "NEW" } }),
    db.project.count({ where: { published: true } }),
  ]);

  return (
    <div className="container-page pt-8 md:pt-12">
      <h1 className="text-[2rem] leading-tight font-bold md:text-5xl">{t.home.greeting}</h1>

      <dl className="mt-8 grid grid-cols-2 gap-3">
        <Stat href="/admin/inquiries" label={t.home.newInquiries} value={newInquiries} accent={newInquiries > 0} />
        <Stat href="/admin/projects" label={t.home.publishedProjects} value={published} />
      </dl>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <ActionCard href="/admin/projects/new" title={t.home.addProject} hint={t.home.addProjectHint} Icon={IconCamera} />
        <ActionCard href="/admin/quotes/new" title={t.home.newQuote} hint={t.home.newQuoteHint} Icon={IconReceipt} />
      </div>
    </div>
  );
}

function Stat({ href, label, value, accent }: { href: string; label: string; value: number; accent?: boolean }) {
  return (
    <Link href={href} className={`${cardClass} block p-5 transition-colors duration-150 hover:border-ink-2`}>
      <dt className="text-base font-semibold text-ink-2">{label}</dt>
      <dd className={`mt-2 font-display text-5xl font-bold tabular ${accent ? "text-accent" : ""}`}>{value}</dd>
    </Link>
  );
}

function ActionCard({
  href,
  title,
  hint,
  Icon,
}: {
  href: string;
  title: string;
  hint: string;
  Icon: typeof IconCamera;
}) {
  return (
    <Link
      href={href}
      className={`${cardClass} group flex min-h-36 items-center gap-5 p-6 transition-colors duration-150 hover:border-accent`}
    >
      <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
        <Icon size={30} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-xl font-bold">{title}</span>
        <span className="mt-1 block text-base text-ink-2">{hint}</span>
      </span>
      <IconArrowRight className="shrink-0 text-ink-2 transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}
