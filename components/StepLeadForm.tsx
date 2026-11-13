"use client";

import Link from "next/link";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { supramono } from "@/src/lib/supramono";
import { SupramonoError, type FormField, type FormStep } from "@/src/lib/supramono/types";

type Answers = Record<string, string | string[]>;

/** Lead-column names; everything else is an answer the CRM stores as a
    filterable field (Supramono #869). */
const CORE = new Set(["name", "email", "phone", "company_name", "company", "message", "idea_description", "role"]);

const AUTOCOMPLETE: Record<string, string> = {
  name: "name", email: "email", phone: "tel", company_name: "organization",
  company: "organization", role: "organization-title",
};

/** Multi-step lead form built from a form section's `content.steps`.
    One step at a time; Next checks the step, focus moves to the new step's
    heading and the step counter is announced. Answers live in state, so
    Back keeps them. Choice fields are native radio / checkbox groups in a
    fieldset with a legend, styled as cards. Submits once, at the end, with
    `page` and every answer. The hidden website_url field is a honeypot. */
export default function StepLeadForm({
  steps,
  page = "",
  submitLabel = "Send",
  secondaryCta,
}: {
  steps: FormStep[];
  page?: string;
  submitLabel?: string;
  secondaryCta?: { label: string; href: string };
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const uid = useId();
  const step = steps[index];
  const last = index === steps.length - 1;

  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [index]);

  function set(name: string, value: string | string[]) {
    setAnswers((a) => ({ ...a, [name]: value }));
  }

  function toggle(name: string, value: string) {
    const current = Array.isArray(answers[name]) ? (answers[name] as string[]) : [];
    set(name, current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  }

  /** Labels of required answers missing on this step, or invalid emails. */
  function problems(s: FormStep): string[] {
    return s.fields.filter((f) => {
      const v = answers[f.name];
      const empty = Array.isArray(v) ? v.length === 0 : !String(v ?? "").trim();
      if (f.required && empty) return true;
      return f.type === "email" && !empty && !/^\S+@\S+\.\S+$/.test(String(v));
    }).map((f) => f.label);
  }

  function go(to: number) {
    moved.current = true;
    setError("");
    setIndex(to);
  }

  function next() {
    const p = problems(step);
    if (p.length) return setError(`Please fill in: ${p.join(", ")}`);
    go(index + 1);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!last) return next();
    const p = problems(step);
    if (p.length) return setError(`Please fill in: ${p.join(", ")}`);
    const honeypot = String(new FormData(e.currentTarget).get("website_url") || "");
    const text = (n: string) => (typeof answers[n] === "string" ? (answers[n] as string).trim() : "");
    const fields: Answers = {};
    for (const [k, v] of Object.entries(answers)) if (!CORE.has(k)) fields[k] = v;
    setState("sending");
    setError("");
    try {
      await supramono.submitLead({
        email: text("email"),
        name: text("name") || undefined,
        phone: text("phone") || undefined,
        company_name: text("company_name") || text("company") || undefined,
        message: text("message") || text("idea_description") || undefined,
        page,
        fields: { ...fields, ...(text("role") ? { role: text("role") } : {}) },
        ...(honeypot ? ({ website_url: honeypot } as object) : {}),
      });
      setState("done");
    } catch (err) {
      setState("idle");
      setError(err instanceof SupramonoError && err.status === 400
        ? err.message.replace(/^please answer/i, "Please answer")
        : "Something went wrong — please try again.");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="rounded-lg bg-brand-bg p-4 text-sm">
        Thanks — we got your answers and will be in touch shortly.
      </p>
    );
  }
  if (!step) return null;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6 max-w-xl">
      <input type="text" name="website_url" tabIndex={-1} autoComplete="off"
             className="hidden" aria-hidden="true" />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Step {index + 1} of {steps.length}
      </p>
      {step.title && (
        <h3 ref={heading} tabIndex={-1} className="text-xl font-semibold outline-none">{step.title}</h3>
      )}
      {step.subtitle && <p className="-mt-4 text-muted-foreground">{step.subtitle}</p>}

      {step.fields.map((f) => (
        <Field key={f.name} field={f} id={`${uid}-${f.name}`} value={answers[f.name]}
               onText={(v) => set(f.name, v)} onPick={(v) => (f.multiple ? toggle(f.name, v) : set(f.name, v))} />
      ))}

      <p role="alert" className="text-sm text-red-600 empty:hidden">{error}</p>
      <div className="flex flex-wrap items-center gap-3">
        {index > 0 && (
          <button type="button" onClick={() => go(index - 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium">
            Back
          </button>
        )}
        <button type="submit" disabled={state === "sending"}
                className="bg-brand-primary text-white font-medium px-4 py-2 rounded-lg text-sm disabled:opacity-50">
          {last ? (state === "sending" ? "Sending…" : submitLabel) : "Next"}
        </button>
        {last && secondaryCta && (
          <Link href={secondaryCta.href} className="text-sm font-medium underline underline-offset-4">
            {secondaryCta.label}
          </Link>
        )}
      </div>
    </form>
  );
}

function Field({ field: f, id, value, onText, onPick }: {
  field: FormField;
  id: string;
  value: string | string[] | undefined;
  onText: (v: string) => void;
  onPick: (v: string) => void;
}) {
  if (f.type === "choice") {
    const picked = Array.isArray(value) ? value : value ? [value] : [];
    return (
      <fieldset>
        <legend className="mb-2 block text-sm font-medium">
          {f.label}{f.required && <span aria-hidden> *</span>}
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(f.options || []).map((o) => (
            <label key={o.value}
                   className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-300 p-4 has-[:checked]:border-brand-primary has-[:checked]:ring-2 has-[:checked]:ring-brand-primary has-[:focus-visible]:ring-2">
              <input type={f.multiple ? "checkbox" : "radio"} name={f.name} value={o.value}
                     checked={picked.includes(o.value)} onChange={() => onPick(o.value)}
                     className="mt-1 size-4 shrink-0" />
              <span>
                {o.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.image_url} alt="" className="mb-2 size-10 object-contain" />
                )}
                <span className="block font-medium">{o.label}</span>
                {o.description && <span className="mt-1 block text-sm text-muted-foreground">{o.description}</span>}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }
  const common = {
    id, name: f.name, required: f.required, placeholder: f.placeholder || undefined,
    value: typeof value === "string" ? value : "",
    onChange: (e: { target: { value: string } }) => onText(e.target.value),
    className: "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm",
  };
  return (
    <div>
      <label className="block text-sm font-medium mb-1" htmlFor={id}>
        {f.label}{f.required && <span aria-hidden> *</span>}
      </label>
      {f.type === "textarea" ? (
        <textarea rows={4} {...common} />
      ) : (
        <input type={f.type} autoComplete={AUTOCOMPLETE[f.name]} {...common} />
      )}
    </div>
  );
}
