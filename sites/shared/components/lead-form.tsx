"use client";

import { useState, type FormEvent } from "react";
import type { ClinicForm, FormField } from "@shell/types";

export function LeadForm({ form, pagePath }: { form: ClinicForm; pagePath: string }) {
  const [startedAt] = useState(() => Date.now());
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setFieldErrors({});
    const data = new FormData(event.currentTarget);
    const fields: Record<string, string> = {};
    for (const field of form.fields) {
      fields[field.name] = String(data.get(field.name) ?? "");
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          formId: form.id,
          pagePath,
          startedAt,
          website: String(data.get("website") ?? ""),
          fields,
        }),
      });
      const body = (await response.json()) as { error?: string; fields?: Record<string, string> };
      if (!response.ok) {
        setFieldErrors(body.fields ?? {});
        setError(body.error || "Please check the highlighted fields.");
        return;
      }
      setDone(true);
    } catch {
      setError("We couldn't send that. Please call the clinic.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <p className="form-success" role="status">
        Thank you. We received your request and will be in touch.
      </p>
    );
  }

  return (
    <form className="lead-form" onSubmit={onSubmit} noValidate>
      <h2>{form.submitLabel}</h2>
      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {form.fields.map((field) => (
        <Field key={field.name} field={field} error={fieldErrors[field.name]} />
      ))}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "Sending…" : form.submitLabel}
      </button>
    </form>
  );
}

function Field({ field, error }: { field: FormField; error?: string }) {
  const id = `field-${field.name}`;
  const options = (field.options ?? []).filter((option) => option && option !== field.label);

  if (field.type === "textarea") {
    return (
      <label htmlFor={id}>
        {field.label}
        <textarea id={id} name={field.name} required={field.required} placeholder={field.placeholder} />
        {error ? <span className="field-error">{error}</span> : null}
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label htmlFor={id}>
        {field.label}
        <select id={id} name={field.name} required={field.required} defaultValue="">
          <option value="" disabled>
            {field.placeholder || field.label}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error ? <span className="field-error">{error}</span> : null}
      </label>
    );
  }

  if (field.type === "radio") {
    return (
      <fieldset>
        <legend>{field.label}</legend>
        <div className="choice-row">
          {options.map((option) => (
            <label key={option}>
              <input type="radio" name={field.name} value={option} required={field.required} />
              {option}
            </label>
          ))}
        </div>
        {error ? <span className="field-error">{error}</span> : null}
      </fieldset>
    );
  }

  const inputType = field.type === "tel" || field.type === "email" ? field.type : "text";
  return (
    <label htmlFor={id}>
      {field.label}
      <input
        id={id}
        name={field.name}
        type={inputType}
        required={field.required}
        placeholder={field.placeholder}
        autoComplete={autocomplete(field.name)}
      />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}

function autocomplete(name: string) {
  if (name === "email") return "email";
  if (name === "phone") return "tel";
  if (name === "firstName") return "given-name";
  if (name === "lastName") return "family-name";
  if (name === "name") return "name";
  return "on";
}
