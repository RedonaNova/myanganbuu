"use client";

import { pageError as t } from "@/messages/errors";

/** Last resort when the root layout itself fails: plain, but never blank. */
export default function GlobalError() {
  return (
    <html lang="mn">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", background: "#121412", color: "#ecede8", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ padding: 24, maxWidth: 420 }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>{t.title}</h1>
          <p style={{ fontSize: 18, opacity: 0.75 }}>{t.body}</p>
          <button
            type="button"
            onClick={() => location.reload()}
            style={{ marginTop: 16, minHeight: 52, padding: "0 28px", borderRadius: 999, border: 0, fontSize: 18, fontWeight: 600, background: "#ecede8", color: "#121412" }}
          >
            {t.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
