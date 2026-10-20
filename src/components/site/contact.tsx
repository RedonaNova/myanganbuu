import { getSettings, instagramLink, viberLink, type Settings } from "@/lib/settings";
import { ContactDialog } from "@/components/site/contact-dialog";
import { contact as t } from "@/messages/mn";

// Brand colours, darkened where needed so white text passes WCAG AA.
const FACEBOOK = "#0866ff";
const VIBER = "#665cac";
// The purple-to-magenta half of Instagram's gradient; the orange end fails contrast.
export const INSTAGRAM = "linear-gradient(45deg, #833ab4, #c13584)";

export function InstagramIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        fill={FACEBOOK}
        d="M13.4 22v-7.3h2.45l.37-2.85H13.4v-1.82c0-.82.23-1.38 1.4-1.38h1.5V6.1a20 20 0 0 0-2.18-.11c-2.16 0-3.64 1.32-3.64 3.74v2.12H8.04v2.85h2.44V22Z"
      />
    </svg>
  );
}

export function ViberIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.2c5.3 0 9.3 3.4 9.3 8.4 0 4.9-4 8.3-9.3 8.3-.8 0-1.6-.1-2.4-.2l-3.4 2.4c-.4.3-.9 0-.9-.5v-3.2C3.5 16 2.7 13.5 2.7 10.6c0-5 4-8.4 9.3-8.4Z"
      />
      <path
        fill={VIBER}
        d="M9.3 6.9c.3-.3.8-.3 1.1.1l.8 1.3c.2.3.1.8-.2 1l-.4.4c.4 1 1.2 1.8 2.2 2.3l.4-.4c.3-.3.7-.3 1-.1l1.3.8c.4.2.4.8.1 1.1l-.6.6c-.5.5-1.4.7-2.1.3-1.9-1-3.5-2.6-4.4-4.5-.4-.7-.2-1.6.3-2.1Z"
      />
    </svg>
  );
}

const button =
  "inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full px-7 text-lg font-semibold whitespace-nowrap text-white transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98]";

/** Facebook always; Viber and Instagram once he has filled them in under Тохиргоо. */
export function ContactButtons({ settings, className = "" }: { settings: Settings; className?: string }) {
  const viber = viberLink(settings);
  const instagram = instagramLink(settings);
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap ${className}`}>
      <a href={settings.facebookUrl} rel="noopener" className={button} style={{ backgroundColor: FACEBOOK }}>
        <FacebookIcon />
        {t.facebook}
      </a>
      {viber && (
        <a href={viber} className={button} style={{ backgroundColor: VIBER }}>
          <ViberIcon />
          {t.viber}
        </a>
      )}
      {instagram && (
        <a href={instagram} rel="noopener" className={button} style={{ backgroundImage: INSTAGRAM }}>
          <InstagramIcon />
          {t.instagram}
        </a>
      )}
    </div>
  );
}

/** The site-wide contact modal, filled with his current links. */
export async function ContactModal() {
  const settings = await getSettings();
  return (
    <ContactDialog title={t.dialogTitle} body={t.dialogBody} closeLabel={t.close}>
      <ContactButtons settings={settings} className="sm:flex-col!" />
    </ContactDialog>
  );
}
