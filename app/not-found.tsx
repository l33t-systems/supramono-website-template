import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-bold mb-2">Page not found</h1>
      <Link href="/" className="text-brand-primary underline">Go home</Link>
    </div>
  );
}
