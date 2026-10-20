import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { ContactButtons } from "@/components/site/contact";
import { nav } from "@/messages/mn";

/** Closing call to action: Messenger and Viber first, the form as a fallback. Never a phone call. */
export async function CtaBand({ title, body }: { title: string; body: string }) {
  const settings = await getSettings();
  return (
    <section className="container-page mt-24">
      <div className="relative overflow-hidden rounded-card bg-ink px-6 py-12 text-bg md:px-14 md:py-16">
        <h2 className="relative max-w-2xl text-3xl leading-tight font-bold md:text-5xl">{title}</h2>
        <p className="relative mt-4 max-w-xl text-lg text-bg/75">{body}</p>
        <div className="relative mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
          <ContactButtons settings={settings} />
          <Link
            href="/holboo-barikh"
            className="inline-flex min-h-14 items-center justify-center rounded-full border border-bg/25 px-7 text-lg font-semibold transition-colors duration-150 hover:border-bg/60"
          >
            {nav.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
