"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { FieldError, Hint, Input, Label, Select, Textarea } from "@/components/ui/field";
import type { ResourceState } from "@/lib/actions/content";

export type FieldSpec = {
  name: string;
  label?: string;
  kind: "text" | "email" | "date" | "number" | "color" | "textarea" | "select" | "checkbox" | "hidden";
  required?: boolean;
  hint?: string;
  placeholder?: string;
  rows?: number;
  /** Span both columns of the two-column grid. */
  wide?: boolean;
  options?: { value: string; label: string }[];
  /** Used for checkboxes and as the value for hidden fields. */
  defaultChecked?: boolean;
  value?: string;
  description?: string;
};

const initialState: ResourceState = { ok: false };

/**
 * One form for every simple admin record.
 *
 * Fields are described as data rather than written out six times, which keeps
 * the faculty, toppers, courses, FAQ, album and campus-settings screens
 * consistent and makes adding a field a one-line change.
 */
export function ResourceForm({
  action,
  fields,
  initial,
  submitLabel = "Save",
  cancelHref,
  resetAfterSuccess = false,
}: {
  action: (state: ResourceState, formData: FormData) => Promise<ResourceState>;
  fields: FieldSpec[];
  initial?: Record<string, string | number | boolean | Date | null | undefined>;
  submitLabel?: string;
  cancelHref?: string;
  /** Clears the form after a successful save — right for "add another" forms. */
  resetAfterSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const errors = state.errors ?? {};

  const valueFor = (name: string) => {
    if (state.values && name in state.values) return state.values[name];

    const raw = initial?.[name];
    if (raw === null || raw === undefined) return "";
    // Dates come straight off a Prisma record; <input type="date"> wants yyyy-mm-dd.
    if (raw instanceof Date) return raw.toISOString().slice(0, 10);

    return String(raw);
  };

  const checkedFor = (field: FieldSpec) => {
    if (state.values) return state.values[field.name] === "on";
    if (initial && field.name in initial) return Boolean(initial[field.name]);
    return field.defaultChecked ?? false;
  };

  // A successful save resets the form only when the caller asked for it;
  // edit screens should keep showing what was just saved.
  const formKey = `${state.attempt ?? 0}-${resetAfterSuccess && state.ok ? "reset" : "keep"}`;

  return (
    <form key={formKey} action={formAction} noValidate className="p-5">
      {state.message ? (
        <div
          role="status"
          className={
            state.ok
              ? "mb-5 border-l-4 border-emerald-600 bg-emerald-50 px-4 py-2.5 text-[0.85rem] text-emerald-900"
              : "mb-5 border-l-4 border-red-600 bg-red-50 px-4 py-2.5 text-[0.85rem] text-red-800"
          }
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
        {fields.map((field) => {
          if (field.kind === "hidden") {
            return (
              <input
                key={field.name}
                type="hidden"
                name={field.name}
                value={field.value ?? valueFor(field.name)}
              />
            );
          }

          const id = `rf-${field.name}`;
          const invalid = Boolean(errors[field.name]);
          const wrapperClass = field.wide ? "sm:col-span-2" : undefined;

          if (field.kind === "checkbox") {
            return (
              <div key={field.name} className={wrapperClass ?? "sm:col-span-2"}>
                <label className="flex items-start gap-3">
                  <input
                    id={id}
                    type="checkbox"
                    name={field.name}
                    defaultChecked={checkedFor(field)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#7a1f2b]"
                  />
                  <span>
                    <span className="block text-[0.86rem] font-medium text-ink-800">
                      {field.label}
                    </span>
                    {field.description ? (
                      <span className="block text-[0.78rem] text-ink-500">
                        {field.description}
                      </span>
                    ) : null}
                  </span>
                </label>
                <FieldError message={errors[field.name]} />
              </div>
            );
          }

          return (
            <div key={field.name} className={wrapperClass}>
              <Label htmlFor={id} required={field.required}>
                {field.label}
              </Label>

              {field.kind === "textarea" ? (
                <Textarea
                  id={id}
                  name={field.name}
                  rows={field.rows ?? 4}
                  defaultValue={valueFor(field.name)}
                  placeholder={field.placeholder}
                  invalid={invalid}
                />
              ) : field.kind === "select" ? (
                <Select
                  id={id}
                  name={field.name}
                  defaultValue={valueFor(field.name)}
                  invalid={invalid}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  id={id}
                  name={field.name}
                  type={field.kind === "number" ? "text" : field.kind}
                  inputMode={field.kind === "number" ? "numeric" : undefined}
                  defaultValue={valueFor(field.name)}
                  placeholder={field.placeholder}
                  invalid={invalid}
                />
              )}

              {field.hint ? <Hint>{field.hint}</Hint> : null}
              <FieldError message={errors[field.name]} />
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <SubmitButton label={submitLabel} />
        {cancelHref ? (
          <Link
            href={cancelHref}
            className="text-[0.82rem] font-semibold text-ink-600 underline underline-offset-4"
          >
            Cancel
          </Link>
        ) : null}
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}
