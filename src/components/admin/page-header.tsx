import Link from "next/link";
import { IconArrowLeft } from "@/components/icons";
import { common } from "@/messages/mn";

/** Consistent admin page title with an optional back link and action. */
export function PageHeader({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="container-page flex items-center gap-3 pt-6 pb-6 md:pt-10">
      {backHref && (
        <Link
          href={backHref}
          aria-label={common.back}
          className="-ml-2 grid size-12 shrink-0 place-items-center rounded-full text-ink hover:bg-surface-2"
        >
          <IconArrowLeft />
        </Link>
      )}
      <h1 className="min-w-0 flex-1 truncate text-[1.75rem] leading-tight font-bold md:text-4xl">{title}</h1>
      {action}
    </header>
  );
}
