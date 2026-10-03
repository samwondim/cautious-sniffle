"use server";
import { db } from "@/db";
import { volunteers } from "@/db/schema";
export async function debugRead() {
  const rows = await db.select({ n: volunteers.name }).from(volunteers);
  return { ok: true, count: rows.length };
}
export async function debugWrite() {
  const [row] = await db.insert(volunteers).values({ name: "Action Write", email: "aw@t.com", interest: "Health" }).returning({ id: volunteers.id });
  return { ok: true, id: row?.id };
}
