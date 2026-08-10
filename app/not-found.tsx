import DynamicFallback from "@/components/DynamicFallback";

// The 404 route doubles as the dynamic-content fallback: content published
// after the last build is fetched and rendered client-side (see
// components/DynamicFallback.tsx), so new posts never wait for a rebuild.
export default function NotFound() {
  return <DynamicFallback />;
}
