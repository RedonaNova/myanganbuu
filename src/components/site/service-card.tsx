import Link from "next/link";
import type { ServiceSlug } from "@/lib/catalog";
import { services } from "@/content/services";
import { serviceNames, servicesPage } from "@/messages/mn";
import { IconArrowRight } from "@/components/icons";

/** Typographic card: big index number, name, one line, quiet arrow. */
export function ServiceCard({ slug, index }: { slug: ServiceSlug; index: number }) {
  return (
    <Link
      href={`/uilchilgee/${slug}`}
      className="group flex h-full min-h-56 flex-col rounded-card border border-line bg-surface p-6 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-ink-2 md:p-7"
    >
      <span className="font-display text-sm font-bold text-accent tabular">{String(index + 1).padStart(2, "0")}</span>
      <h3 className="mt-auto pt-10 font-display text-2xl leading-tight font-bold">{serviceNames[slug]}</h3>
      <p className="mt-2 text-base text-ink-2">{services[slug].short}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-base font-semibold">
        {servicesPage.more}
        <IconArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
