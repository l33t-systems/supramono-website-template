"use client";

import { useEffect, useRef } from "react";

/** Name of the meta tag app/layout.tsx writes when Turnstile is in force. */
export const TURNSTILE_META = "supramono-turnstile";

type TurnstileApi = { render: (el: HTMLElement, opts: { sitekey: string; size?: string }) => string };
declare global {
  interface Window { turnstile?: TurnstileApi }
}

let loading: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile script failed"));
    document.head.appendChild(s);
  });
  return loading;
}

/** Cloudflare Turnstile widget (Supramono #870). Renders only while the
    product requires it: the site key comes from brand/ via the meta tag in
    app/layout.tsx. Place it inside the form; it adds a hidden
    `cf-turnstile-response` field, which the form posts as `turnstile_token`
    (see `turnstileToken`). Supramono verifies it; without a valid token a
    submission is dropped. */
export default function Turnstile() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const key = document.querySelector<HTMLMetaElement>(`meta[name="${TURNSTILE_META}"]`)?.content;
    const el = ref.current;
    if (!key || !el || el.dataset.rendered) return;
    el.dataset.rendered = "1";
    loadScript()
      .then(() => window.turnstile?.render(el, { sitekey: key, size: "flexible" }))
      .catch(() => { delete el.dataset.rendered; });
  }, []);
  return <div ref={ref} />;
}

/** The widget's token from a submitted form, or undefined. */
export function turnstileToken(form: HTMLFormElement): string | undefined {
  const v = new FormData(form).get("cf-turnstile-response");
  return v ? String(v) : undefined;
}
