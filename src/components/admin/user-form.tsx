"use client";

import { useActionState, useEffect, useRef } from "react";

import { createAdminUserAction } from "@/app/actions/admin";
import { AdminBanner, AdminSubmit } from "@/components/admin/ui";
import { ADMIN_IDLE, ADMIN_PASSWORD_MIN } from "@/lib/admin";

/**
 * "Add user" form. Passwords are never part of the returned state, so after a
 * failed submit only email and name come back filled; both password fields
 * are always re-entered.
 */

type FieldName = "email" | "name" | "password" | "confirmPassword";

export function UserForm() {
  const [state, formAction] = useActionState(createAdminUserAction, ADMIN_IDLE);
  const formRef = useRef<HTMLFormElement>(null);

  // Move focus to the first invalid field so keyboard and screen-reader users
  // land on what needs fixing.
  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [state]);

  function field(name: FieldName, hint?: string) {
    const error = state.fieldErrors?.[name];
    const id = `user-${name}`;
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    return {
      error,
      hint,
      hintId,
      errorId,
      input: {
        id,
        name,
        "aria-invalid": error ? (true as const) : undefined,
        "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
        className: "field-input",
      },
    };
  }

  const email = field("email");
  const name = field("name");
  const password = field("password", `At least ${ADMIN_PASSWORD_MIN} characters.`);
  const confirm = field("confirmPassword");

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className="flex flex-col gap-5"
    >
      <AdminBanner state={state} />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Email" id="user-email" {...email}>
          <input
            {...email.input}
            type="email"
            autoComplete="off"
            defaultValue={state.values?.email}
          />
        </Field>
        <Field label="Name" id="user-name" {...name}>
          <input
            {...name.input}
            type="text"
            autoComplete="off"
            defaultValue={state.values?.name}
          />
        </Field>
        <Field label="Password" id="user-password" {...password}>
          <input {...password.input} type="password" autoComplete="new-password" />
        </Field>
        <Field label="Confirm password" id="user-confirmPassword" {...confirm}>
          <input {...confirm.input} type="password" autoComplete="new-password" />
        </Field>
      </div>
      <AdminSubmit label="Add user" pendingLabel="Adding…" />
    </form>
  );
}

function Field({
  label,
  id,
  hint,
  hintId,
  error,
  errorId,
  children,
}: {
  label: string;
  id: string;
  hint?: string;
  hintId?: string;
  error?: string;
  errorId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {hint ? (
        <span id={hintId} className="text-xs text-slate">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </div>
  );
}
