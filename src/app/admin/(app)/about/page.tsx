import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { aboutStats, getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/page-header";
import { IconExternal } from "@/components/icons";
import { AboutForm } from "./about-form";
import { PortraitPicker } from "./portrait-picker";
import { SitePhotoManager } from "./site-photo-manager";
import { about, adminAbout as t } from "@/messages/mn";

export default async function AdminAboutPage() {
  await requireAdmin();
  const [settings, photos] = await Promise.all([
    getSettings(),
    db.sitePhoto.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
  ]);
  const toClient = (p: (typeof photos)[number]) => ({
    id: p.id,
    src: `/media/${p.storageKey}`,
    width: p.width,
    height: p.height,
    lqip: p.lqip,
    alt: p.alt,
    caption: p.caption,
  });
  const portrait = photos.find((p) => p.isPortrait);

  return (
    <>
      <PageHeader
        title={t.title}
        backHref="/admin/settings"
        action={
          <Link href="/minii-tukhai" target="_blank" aria-label={t.view} className="grid size-12 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-2 hover:text-ink">
            <IconExternal />
          </Link>
        }
      />
      <div className="container-page max-w-2xl space-y-4 pb-12">
        <PortraitPicker portrait={portrait ? toClient(portrait) : null} />
        <AboutForm
          headline={settings.aboutHeadline || about.defaultHeadline}
          bio={settings.aboutBio || about.defaultBio}
          stats={aboutStats(settings)}
        />
        <SitePhotoManager initial={photos.filter((p) => !p.isPortrait).map(toClient)} />
      </div>
    </>
  );
}
