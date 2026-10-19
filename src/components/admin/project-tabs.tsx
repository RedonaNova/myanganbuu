import Link from "next/link";
import { admin as t } from "@/messages/mn";

/** Two-tab switch between a project's photos and its details. */
export function ProjectTabs({ id, active }: { id: number; active: "photos" | "info" }) {
  const tabs = [
    { key: "photos", href: `/admin/projects/${id}`, label: t.projects.tabs.photos },
    { key: "info", href: `/admin/projects/${id}/info`, label: t.projects.tabs.info },
  ] as const;
  return (
    <nav aria-label={t.projects.title} className="container-page mb-6">
      <ul className="grid grid-cols-2 gap-1 rounded-full bg-surface-2 p-1">
        {tabs.map((tab) => (
          <li key={tab.key}>
            <Link
              href={tab.href}
              aria-current={active === tab.key ? "page" : undefined}
              className={
                "flex min-h-12 items-center justify-center rounded-full text-lg font-semibold transition-colors duration-150 " +
                (active === tab.key ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink")
              }
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
