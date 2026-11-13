"use client";

import Link from "next/link";
import { FormEvent, useId, useState } from "react";
import { supramono } from "@/src/lib/supramono";
import type { LeadSubmission } from "@/src/lib/supramono/types";

/** One form field, as the API returns it in a form section's
    `content.fields` (Supramono #861). */
export interface LeadField {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

/** The form when the CMS defines no fields. */
const DEFAULT_FIELDS: LeadField[] = [
  { name: "name", label: "Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "message", label: "Message", type: "textarea", required: true },
];

/** Fields the leads endpoint reads directly; `idea_description` is the live
    form's name for the message. Anything else is kept in the message as
    "Label: value" so nothing is lost. */
const LEAD_KEYS = ["name", "email", "phone", "company_name", "message", "idea_description"];

function toLead(fields: LeadField[], form: FormData): LeadSubmission {
  const lead: Record<string, string> = {};
  const extra: string[] = [];
  for (const f of fields) {
    const v = String(form.get(f.name) || "").trim();
    if (!v) continue;
    if (LEAD_KEYS.includes(f.name)) lead[f.name] = v;
    else extra.push(`${f.label}: ${v}`);
  }
  const message = [lead.message || lead.idea_description, ...extra].filter(Boolean).join("\n\n");
  delete lead.idea_description;
  if (message) lead.message = message;
  return { ...lead, email: lead.email || "" };
}

/** Contact/lead form wired to the Supramono CRM (public leads endpoint).
    Runs in the browser — the only client-side Supramono call in the
    template. The hidden website_url field is a honeypot — leave it in.
    Fields, submit label and the secondary link come from the CMS form
    section (content.fields / submit_label / secondary_cta). */
export default function LeadForm({
  fields,
  submitLabel = "Send message",
  secondaryCta,
}: {
  fields?: LeadField[];
  submitLabel?: string;
  secondaryCta?: { label: string; href: string };
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const uid = useId();
  const list = fields?.filter((f) => f?.name).length ? fields.filter((f) => f?.name) : DEFAULT_FIELDS;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    try {
      await supramono.submitLead({
        ...toLead(list, form),
        ...(form.get("website_url")
          ? ({ website_url: String(form.get("website_url")) } as object)
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
      {list.map((f) => (
        <div key={f.name}>
          <label className="block text-sm font-medium mb-1" htmlFor={`${uid}-${f.name}`}>{f.label}</label>
          {f.type === "textarea" ? (
            <textarea id={`${uid}-${f.name}`} name={f.name} rows={4} required={f.required}
                      placeholder={f.placeholder || undefined}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          ) : (
            <input id={`${uid}-${f.name}`} name={f.name} type={f.type || "text"} required={f.required}
                   placeholder={f.placeholder || undefined}
                   className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          )}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={state === "sending"}
                className="bg-brand-primary text-white font-medium px-4 py-2 rounded-lg text-sm disabled:opacity-50">
          {state === "sending" ? "Sending…" : submitLabel}
        </button>
        {secondaryCta && (
          <Link href={secondaryCta.href} className="text-sm font-medium underline underline-offset-4">
            {secondaryCta.label}
          </Link>
        )}
      </div>
      {state === "error" && (
        <p className="text-sm text-red-600">Something went wrong — please try again.</p>
      )}
    </form>
  );
}
