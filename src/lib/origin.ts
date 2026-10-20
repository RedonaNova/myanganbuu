import { useSyncExternalStore } from "react";

/**
 * The public address of a page, built from the address the visitor is really
 * on. A misconfigured SITE_URL (say, localhost) can never leak into a share.
 * `url` may be a path ("/ajluud") or a full URL; only its path and query are kept.
 */
export function absoluteUrl(url: string) {
  const u = new URL(url, location.origin);
  return location.origin + u.pathname + u.search;
}

const noop = () => () => {};

/** location.origin in the browser, `fallback` during server rendering. */
export function useOrigin(fallback = "") {
  return useSyncExternalStore(
    noop,
    () => location.origin,
    () => fallback,
  );
}
