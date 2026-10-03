"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/actions/admin";
import { AdminBanner, AdminField, AdminSubmit } from "@/components/admin/ui";
import { ADMIN_IDLE } from "@/lib/admin";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, ADMIN_IDLE);
  return (
    <form action={formAction} className="flex flex-col gap-5">
      <AdminBanner state={state} />
      <AdminField label="Email" name="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="field-input"
        />
      </AdminField>
      <AdminField label="Password" name="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field-input"
        />
      </AdminField>
      <AdminSubmit label="Log in" />
    </form>
  );
}
