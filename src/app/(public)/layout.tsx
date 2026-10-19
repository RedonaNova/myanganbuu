import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SwRegister } from "@/components/sw-register";
import { common } from "@/messages/mn";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink px-5 py-3 font-semibold text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {common.skipToContent}
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <SwRegister />
    </>
  );
}
