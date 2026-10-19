import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { admin as t, site } from "@/messages/mn";

export const metadata: Metadata = {
  title: t.login.title,
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">{site.name}</p>
        <h1 className="mt-3 mb-10 text-4xl font-bold">{t.login.title}</h1>
        <LoginForm />
      </div>
    </main>
  );
}
