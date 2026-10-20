import { messengerLink, viberLink, type Settings } from "@/lib/settings";
import { contact as t } from "@/messages/mn";

// Brand colours, darkened where needed so white text passes WCAG AA.
const MESSENGER = "#0866ff";
const VIBER = "#665cac";

export function MessengerIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.42 3.14 7.16.16.15.26.35.27.57l.05 1.78a.8.8 0 0 0 1.12.71l1.98-.88a.8.8 0 0 1 .53-.04c.91.25 1.87.38 2.91.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2Z"
      />
      <path
        fill={MESSENGER}
        d="m6 14.54 2.94-4.66a1.5 1.5 0 0 1 2.17-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.63l-2.94 4.66a1.5 1.5 0 0 1-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63Z"
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

/** Messenger always; Viber once he has entered a number in Тохиргоо. */
export function ContactButtons({ settings, className = "" }: { settings: Settings; className?: string }) {
  const viber = viberLink(settings);
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap ${className}`}>
      <a href={messengerLink(settings)} rel="noopener" className={button} style={{ backgroundColor: MESSENGER }}>
        <MessengerIcon />
        {t.messenger}
      </a>
      {viber && (
        <a href={viber} className={button} style={{ backgroundColor: VIBER }}>
          <ViberIcon />
          {t.viberButton}
        </a>
      )}
    </div>
  );
}

/** Facebook and Viber, the two ways he is reached. */
export function ContactDetails({ settings, tone = "light" }: { settings: Settings; tone?: "light" | "dark" }) {
  const muted = tone === "dark" ? "text-bg/65" : "text-ink-2";
  const handle = settings.facebookUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
  if (!settings.facebookUrl && !settings.viberNumber) return null;
  return (
    <dl className="space-y-4">
      {settings.facebookUrl && (
        <div>
          <dt className={`text-sm font-semibold ${muted}`}>{t.facebook}</dt>
          <dd className="mt-1 text-lg font-semibold wrap-break-word">
            <a href={settings.facebookUrl} rel="noopener" className="underline-offset-4 hover:underline">
              {handle}
            </a>
          </dd>
        </div>
      )}
      {settings.viberNumber && (
        <div>
          <dt className={`text-sm font-semibold ${muted}`}>{t.viber}</dt>
          <dd className="tabular mt-1 text-lg font-semibold">{settings.viberNumber}</dd>
        </div>
      )}
    </dl>
  );
}
