import { FormEvent, useState } from "react";
import { supramono } from "../lib/supramono";

/** Contact/lead form wired to the Supramono CRM (public leads endpoint).
    The hidden website_url field is a honeypot — leave it in place. */
export default function LeadForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    try {
      await supramono.submitLead({
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        message: String(form.get("message") || ""),
        ...(form.get("website_url")
          ? { website_url: String(form.get("website_url")) } as object
          : {}),
      });
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="rounded-lg bg-brand-bg p-4 text-sm">
        Thanks — we got your message and will be in touch shortly.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
      <input type="text" name="website_url" tabIndex={-1} autoComplete="off"
             className="hidden" aria-hidden="true" />
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="lf-name">Name</label>
        <input id="lf-name" name="name" required
               className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="lf-email">Email</label>
        <input id="lf-email" name="email" type="email" required
               className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="lf-message">Message</label>
        <textarea id="lf-message" name="message" rows={4} required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <button type="submit" disabled={state === "sending"}
              className="bg-brand-primary text-white font-medium px-4 py-2 rounded-lg text-sm disabled:opacity-50">
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
      {state === "error" && (
        <p className="text-sm text-red-600">Something went wrong — please try again.</p>
      )}
    </form>
  );
}
