// Supramono SDK — your product's content, brand and CRM as an API.
//
// Two clients, one iron rule:
//   createPublicClient  -> safe everywhere (public site key, read-only content)
//   createAdminClient   -> build/server ONLY (bearer token, read/write)
//
// The `supramono` singleton below is configured from env inlined by
// next.config.mjs — usable in server components (build-time fetches) and
// client components (lead form) alike.
export { createPublicClient } from "./publicClient";
export type { PublicClient, PublicClientConfig } from "./publicClient";
export * from "./types";

import { createPublicClient } from "./publicClient";

export const supramono = createPublicClient({
  baseUrl: process.env.NEXT_PUBLIC_SUPRAMONO_API_URL || "https://supramono.com",
  siteKey: process.env.NEXT_PUBLIC_SUPRAMONO_PUBLIC_KEY || "",
});
