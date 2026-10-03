"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { AdminActionState } from "@/lib/admin";
import { ADMIN_IDLE } from "@/lib/admin";

/** Shared form primitives for the admin dashboard (brand-styled). */

export type AdminAction = (
  prev: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

export function AdminBanner({ state }: { state: AdminActionState }) {
  if (state.status === "idle") return null;
  const ok = state.status === "success";
  return (
    <p
      role="status"
      aria-live="polite"
      className={
        ok
          ? "rounded-xl bg-growth/12 px-4 py-3 text-sm font-medium text-ink"
          : "rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
      }
    >
      {state.message}
    </p>
  );
}

export function AdminField({
  label,
  name,
  error,
  children,
  hint,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      {children}
      {hint ? <span className="text-xs text-slate">{hint}</span> : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}

export function AdminSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-donate w-fit px-7 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "color";
  options?: readonly string[] | { value: string; label: string }[];
  rows?: number;
  hint?: string;
};

/**
 * Generic create/edit form: renders `fields` from `values` and posts to
 * `action`. `recordId` adds the hidden id for updates.
 */
export function AdminForm({
  action,
  fields,
  values,
  recordId,
  submitLabel,
}: {
  action: AdminAction;
  fields: FieldDef[];
  values?: Record<string, string | number | null | undefined>;
  recordId?: number;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <AdminBanner state={state} />
      {recordId ? <input type="hidden" name="id" value={recordId} /> : null}
      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((field) => {
          const raw = values?.[field.name];
          const value = raw === null || raw === undefined ? "" : String(raw);
          const error = state.fieldErrors?.[field.name];
          return (
            <AdminField
              key={field.name}
              label={field.label}
              name={field.name}
              error={error}
              hint={field.hint}
            >
              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  defaultValue={value}
                  rows={field.rows ?? 3}
                  className="field-input h-auto py-3"
                />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  defaultValue={value}
                  className="field-input"
                >
                  {field.options?.map((opt) =>
                    typeof opt === "string" ? (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ) : (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ),
                  )}
                </select>
              ) : field.type === "color" ? (
                <input
                  id={field.name}
                  name={field.name}
                  type="color"
                  defaultValue={value || "#3EACB4"}
                  className="h-12 w-24 cursor-pointer rounded-lg border border-hairline bg-white p-1"
                />
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  defaultValue={value}
                  className="field-input"
                />
              )}
            </AdminField>
          );
        })}
      </div>
      <div>
        <AdminSubmit label={submitLabel} />
      </div>
    </form>
  );
}

/** Delete button with a native confirm step. Posts `id` to `action`. */
export function DeleteButton({
  id,
  action,
  label,
}: {
  id: number;
  action: (formData: FormData) => Promise<void>;
  label: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`Delete this ${label}? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}
