// Supramono SDK — your product's content, brand and CRM as an API.
//
// Two clients, one iron rule:
//   createPublicClient  -> browser-safe (public site key, read-only content)
//   createAdminClient   -> build/server ONLY (bearer token, read/write)
export { createPublicClient } from "./publicClient";
export type { PublicClient, PublicClientConfig } from "./publicClient";
export * from "./types";

// The browser-safe singleton the site's components use.
import { createPublicClient } from "./publicClient";

export const supramono = createPublicClient({
  baseUrl: import.meta.env.VITE_SUPRAMONO_API_URL || "https://supramono.com",
  siteKey: import.meta.env.VITE_SUPRAMONO_PUBLIC_KEY || "",
});
