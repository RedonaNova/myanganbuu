"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { admin as t } from "@/messages/mn";
import { IconGrid, IconInbox, IconReceipt, IconSettings } from "@/components/icons";

const items = [
  { href: "/admin/projects", label: t.nav.projects, Icon: IconGrid },
  { href: "/admin/inquiries", label: t.nav.inquiries, Icon: IconInbox },
  { href: "/admin/quotes", label: t.nav.quotes, Icon: IconReceipt },
  { href: "/admin/settings", label: t.nav.settings, Icon: IconSettings },
];

/** Bottom tab bar on phones, left rail on wide screens. */
export function AdminNav({ newInquiries = 0 }: { newInquiries?: number }) {
  const pathname = usePathname();
  return <NavList active={pathname} newInquiries={newInquiries} />;
}

export function NavList({ active, newInquiries = 0 }: { active?: string; newInquiries?: number }) {
  return (
    <ul className="grid grid-cols-4 md:grid-cols-1 md:gap-1">
      {items.map(({ href, label, Icon }) => {
        const current = !!active && (active === href || active.startsWith(`${href}/`));
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={current ? "page" : undefined}
              className={
                "relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl text-[0.8125rem] font-semibold " +
                "transition-colors duration-150 md:flex-row md:justify-start md:gap-3 md:px-4 md:text-base " +
                (current ? "text-accent md:bg-accent-soft" : "text-ink-2 hover:text-ink")
              }
            >
              <span className="relative">
                <Icon size={26} />
                {href === "/admin/inquiries" && newInquiries > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-xs leading-5 font-bold text-accent-ink tabular">
                    {newInquiries}
                  </span>
                )}
              </span>
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
