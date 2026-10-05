import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSession, type AdminSession } from "@/lib/auth";
import type { AdminActionState } from "@/lib/admin";

/**
 * Helpers shared by the admin Server Actions.
 *
 * These live here rather than in `src/app/actions/admin.ts` because a module
 * carrying the `"use server"` directive may only export async Server
 * Actions — so that file cannot share plain helpers with another actions
 * module. Anything used by more than one actions file belongs here.
 */

/**
 * Resolves the admin session or bounces to the login page.
 *
 * Every mutation must call this. The `(protected)` layout guard is not
 * sufficient on its own: Server Actions are reachable by direct POST without
 * ever rendering that layout.
 */
export async function authed(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Reads a form field as a string, treating files and absences as empty. */
export function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export const ERROR: AdminActionState = {
  status: "error",
  message: "Something went wrong. Please try again.",
};

/** Content edits can surface anywhere on the public site, so revalidate it all. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}
