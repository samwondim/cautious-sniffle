import { createHash, randomBytes } from "node:crypto";
import { verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { db } from "@/db";
import { admins, sessions } from "@/db/schema";

/**
 * Admin session auth.
 *
 * The `sessions` table stores only the SHA-256 digest of an opaque random
 * token (`sessions.id`); the raw token lives in an HttpOnly cookie. Every
 * admin page and action resolves the session through `requireAdmin()`.
 */

const SESSION_COOKIE = "eh_admin_session";
const SESSION_DAYS = 30;

export type AdminSession = {
  adminId: number;
  email: string;
  name: string;
  expiresAt: Date;
};

function digest(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/** The current admin session, or `null` when logged out / expired. */
export const getSession = cache(async (): Promise<AdminSession | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select({
      adminId: sessions.adminId,
      email: admins.email,
      name: admins.name,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(admins, eq(sessions.adminId, admins.id))
    .where(eq(sessions.id, digest(token)))
    .limit(1);

  if (!row) return null;
  if (row.expiresAt.getTime() <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, digest(token)));
    return null;
  }
  return row;
});

/** Guard for admin pages/layouts — redirects anonymous visitors to login. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Validates credentials, creates a session row, and sets the cookie. */
export async function loginAdmin(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    return { ok: false, error: "Please enter your email and password." };
  }

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, normalized))
    .limit(1);

  // Same message either way, so addresses can't be enumerated.
  const invalid = { ok: false as const, error: "Invalid email or password." };
  if (!admin) return invalid;

  let valid = false;
  try {
    valid = await verify(admin.passwordHash, password);
  } catch {
    return invalid;
  }
  if (!valid) return invalid;

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({
    id: digest(token),
    adminId: admin.id,
    expiresAt,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_DAYS * 24 * 60 * 60));
  return { ok: true };
}

/** Deletes the session row and clears the cookie. */
export async function logoutAdmin(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, digest(token)));
  }
  store.set(SESSION_COOKIE, "", sessionCookieOptions(0));
}
