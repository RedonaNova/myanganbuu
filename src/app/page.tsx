import { site } from "@/messages/mn";

// Temporary: the real home page lands in build step 4.
export default function Home() {
  return (
    <main className="container-page grid min-h-dvh content-center py-16">
      <h1 className="text-5xl font-bold md:text-7xl">{site.name}</h1>
      <p className="mt-4 max-w-xl text-xl text-ink-2">{site.tagline}</p>
    </main>
  );
}
