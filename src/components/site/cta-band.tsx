import { getSettings } from "@/lib/settings";
import { ContactButtons } from "@/components/site/contact";

/** Closing call to action: Facebook and Viber. Never a phone call. */
export async function CtaBand({ title, body }: { title: string; body: string }) {
  const settings = await getSettings();
  return (
    <section className="container-page mt-24">
      <div className="relative overflow-hidden rounded-card bg-ink px-6 py-12 text-bg md:px-14 md:py-16">
        <h2 className="relative max-w-2xl text-3xl leading-tight font-bold md:text-5xl">{title}</h2>
        <p className="relative mt-4 max-w-xl text-lg text-bg/75">{body}</p>
        <ContactButtons settings={settings} className="relative mt-8" />
      </div>
    </section>
  );
}
