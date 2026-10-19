import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { InquiryForm } from "./inquiry-form";
import { getSettings, messengerLink, viberLink } from "@/lib/settings";
import { contactMethods, districts, footer, inquiry as t, rooms, serviceNames } from "@/messages/mn";

export const metadata: Metadata = {
  title: t.title,
  description: t.intro,
  alternates: { canonical: "/holboo-barikh" },
};

export default function InquiryPage({ searchParams }: PageProps<"/holboo-barikh">) {
  return (
    <div className="container-page grid gap-12 pt-10 md:pt-16 lg:grid-cols-[1fr_20rem] lg:gap-16">
      <div className="max-w-3xl">
        <h1 className="text-[2.5rem] leading-[1.05] font-bold md:text-6xl">{t.title}</h1>
        <p className="mt-5 text-lg text-ink-2 md:text-xl">{t.intro}</p>
        <div className="mt-12">
          <Suspense fallback={<div className="h-[60rem] animate-pulse rounded-card bg-surface-2" />}>
            <Form searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
      <aside className="lg:pt-40">
        <DirectContact />
      </aside>
    </div>
  );
}

/** Server time of this request; the inquiry API rejects instant (bot) submits. */
async function requestTime() {
  await connection();
  return Date.now();
}

async function Form({ searchParams }: Pick<PageProps<"/holboo-barikh">, "searchParams">) {
  const startedAt = await requestTime();
  const sp = await searchParams;
  const error = typeof sp.error === "string" && sp.error in t.errors ? (sp.error as keyof typeof t.errors) : undefined;
  return <InquiryForm startedAt={startedAt} initialError={error} copy={{ t, rooms, serviceNames, contactMethods, districts }} />;
}

async function DirectContact() {
  const settings = await getSettings();
  const viber = viberLink(settings);
  return (
    <div className="rounded-card bg-surface-2 p-6 lg:sticky lg:top-28">
      <p className="text-base font-semibold text-ink-2">{t.orMessenger}</p>
      <ul className="mt-4 space-y-2">
        <li>
          <a
            href={messengerLink(settings)}
            rel="noopener"
            className="flex min-h-14 items-center justify-center rounded-full bg-ink px-6 text-lg font-semibold text-bg"
          >
            {footer.messenger}
          </a>
        </li>
        {viber && (
          <li>
            <a href={viber} className="flex min-h-14 items-center justify-center rounded-full border border-ink/20 px-6 text-lg font-semibold">
              {footer.viber}
            </a>
          </li>
        )}
      </ul>
      <p className="mt-4 text-sm text-ink-2">{footer.textFirst}</p>
    </div>
  );
}
