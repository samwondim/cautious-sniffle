"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";

import { AdminModal } from "@/components/admin/modal";
import { IconPicker } from "@/components/admin/icon-picker";
import { MediaField } from "@/components/admin/media-field";
import { usePendingRemoval } from "@/components/admin/optimistic-row";
import { useToast } from "@/components/admin/toast";
import type { AdminActionState } from "@/lib/admin";
import { ADMIN_IDLE } from "@/lib/admin";
import type { ActionResult } from "@/lib/admin-actions";

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
  className = "",
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      {children}
      {hint ? <span className="text-xs text-slate">{hint}</span> : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}

export function AdminSubmit({
  label,
  pendingLabel = "Saving…",
}: {
  label: string;
  /** What the button says while the action runs. */
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-donate w-fit px-7 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export type FieldDef = {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "textarea"
    | "select"
    | "color"
    | "media"
    | "icon";
  options?: readonly string[] | { value: string; label: string }[];
  rows?: number;
  hint?: string;
  /** `media` only: spans both columns, since a thumbnail reads badly in half. */
  fullWidth?: boolean;
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

          // Icons get a visual grid instead of a dropdown of database keys, so
          // staff can see the glyph they are choosing.
          if (field.type === "icon") {
            const options = (field.options ?? []).map((option) =>
              typeof option === "string" ? option : option.value,
            );
            return (
              <IconPicker
                key={field.name}
                name={field.name}
                label={field.label}
                defaultValue={value}
                options={options}
                error={error}
                hint={field.hint}
                className="md:col-span-2"
              />
            );
          }

          return (
            <AdminField
              key={field.name}
              label={field.label}
              name={field.name}
              error={error}
              hint={field.hint}
              className={
                field.type === "media" || field.fullWidth
                  ? "md:col-span-2"
                  : undefined
              }
            >
              {field.type === "media" ? (
                <MediaField name={field.name} defaultValue={value} />
              ) : field.type === "textarea" ? (
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

/**
 * Delete button gated behind a confirm dialog.
 *
 * `window.confirm` works but is unstyled, blocks the tab, and can't say much
 * beyond a single line. A real dialog (the shared `AdminModal`) gives the
 * confirm step room to explain that the delete is immediate and permanent.
 *
 * The delete is optimistic: confirming hides the row at once and the action
 * runs in the background. A success toast confirms it; if the server rejects
 * the delete, the row is revealed again and the reason is shown as an error
 * toast, so the list never lies about what is still there.
 */
export function DeleteButton({
  id,
  action,
  label,
}: {
  id: number;
  action: (formData: FormData) => Promise<ActionResult>;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { setPendingRemoval } = usePendingRemoval();
  const { toast } = useToast();
  const router = useRouter();

  function confirm() {
    if (isPending) return;
    setOpen(false);
    setPendingRemoval(true);

    const formData = new FormData();
    formData.append("id", String(id));

    startTransition(async () => {
      let result: ActionResult;
      try {
        result = await action(formData);
      } catch {
        result = { ok: false, message: "Could not delete. Please try again." };
      }

      if (result.ok) {
        toast({ message: `${label[0].toUpperCase()}${label.slice(1)} deleted.` });
        router.refresh();
      } else {
        setPendingRemoval(false);
        toast({ message: result.message, tone: "error" });
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
      >
        Delete
      </button>

      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        labelledBy={`delete-${id}-title`}
        className="flex h-full w-full items-center justify-center"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            confirm();
          }}
          className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        >
          <h2
            id={`delete-${id}-title`}
            className="font-display text-xl text-ink"
          >
            Delete this {label}?
          </h2>
          <p className="mt-2 text-sm text-slate">
            This cannot be undone, and it disappears from the public site
            immediately.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-hairline px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-teal"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
