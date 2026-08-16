"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // The service worker itself (public/sw.js) detects localhost and skips
    // all caching there — see IS_DEV — so registering unconditionally is
    // safe and lets Chrome's install criteria (which require an active,
    // controlling service worker) be satisfied during `next dev` too.
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
