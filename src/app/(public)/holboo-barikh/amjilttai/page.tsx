import type { Metadata } from "next";
import Link from "next/link";
import { inquiry as t } from "@/messages/mn";

export const metadata: Metadata = {
  title: t.successTitle,
  robots: { index: false },
};

export default function InquirySent() {
  return (
    <div className="container-page grid min-h-[60dvh] place-items-center py-16 text-center">
      <div className="max-w-lg">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-accent-soft text-accent">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h1 className="mt-8 text-4xl font-bold md:text-5xl">{t.successTitle}</h1>
        <p className="mt-4 text-lg text-ink-2 md:text-xl">{t.successBody}</p>
        <Link href="/ajluud" className="mt-10 inline-flex min-h-14 items-center rounded-full bg-ink px-7 text-lg font-semibold text-bg">
          {t.successBack}
        </Link>
      </div>
    </div>
  );
}
