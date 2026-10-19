import "server-only";
import webpush from "web-push";
import { db } from "@/lib/db";

let configured = false;
function configure() {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@example.com", pub, priv);
  configured = true;
  return true;
}

/**
 * Notifies every phone where he turned notifications on. Never throws: a
 * failed notification must not lose the inquiry that triggered it.
 */
export async function notifyAdmin(payload: { title: string; body: string; url: string }) {
  if (!configure()) return;
  const subs = await db.pushSubscription.findMany();
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
          { TTL: 24 * 60 * 60, urgency: "high" },
        );
      } catch (err) {
        // Gone or invalid: the phone unsubscribed or reinstalled the browser.
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) await db.pushSubscription.deleteMany({ where: { id: s.id } });
        else console.error("push failed", status ?? err);
      }
    }),
  );
}
