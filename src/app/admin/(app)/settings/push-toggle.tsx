"use client";

import { useEffect, useState, useTransition } from "react";
import { savePushSubscription, sendTestPush } from "./actions";
import { primaryButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import { IconCheck } from "@/components/icons";
import { adminSettings as t, common } from "@/messages/mn";

type State = "checking" | "unsupported" | "denied" | "off" | "on";

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function PushToggle() {
  const [state, setState] = useState<State>("checking");
  const [pending, start] = useTransition();

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        return setState("unsupported");
      }
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  function enable() {
    start(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return setState(permission === "denied" ? "denied" : "off");
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""),
        });
        await savePushSubscription(JSON.parse(JSON.stringify(sub)));
        setState("on");
      } catch {
        setState("unsupported");
      }
    });
  }

  if (state === "checking") return <div className="h-14 animate-pulse rounded-full bg-surface-2" />;
  if (state === "unsupported") return <p className="text-base text-danger">{t.pushUnsupported}</p>;
  if (state === "denied") return <p className="text-base text-danger">{t.pushDenied}</p>;
  if (state === "off") {
    return (
      <button type="button" onClick={enable} disabled={pending} className={`${primaryButtonClass} w-full`}>
        {pending ? common.loading : t.pushEnable}
      </button>
    );
  }
  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-lg font-semibold text-success">
        <IconCheck />
        {t.pushEnabled}
      </p>
      <button type="button" onClick={() => start(() => sendTestPush())} disabled={pending} className={`${secondaryButtonClass} w-full`}>
        {t.pushTest}
      </button>
    </div>
  );
}
