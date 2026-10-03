"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  bankAccounts,
  donations,
  galleryImages,
  givingOptions,
  impactStats,
  messages,
  projects,
  sectors,
  siteSettings,
  theme,
  volunteers,
} from "@/db/schema";
import {
  accountSchema,
  givingSchema,
  projectSchema,
  sectorSchema,
  statSchema,
  themeSchema,
  type AdminActionState,
} from "@/lib/admin";
import { getSession, loginAdmin, logoutAdmin } from "@/lib/auth";
import { fieldErrorsFrom } from "@/lib/forms";

/**
 * Admin Server Actions. Every mutation re-checks the session — the layout
 * guard alone is not enough, since actions are reachable by direct POST.
 */

async function authed() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

const ERROR: AdminActionState = {
  status: "error",
  message: "Something went wrong. Please try again.",
};

function revalidateSite() {
  revalidatePath("/", "layout");
}

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

export async function loginAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = await loginAdmin(
    formString(formData, "email"),
    formString(formData, "password"),
  );
  if (!result.ok) {
    return { status: "error", message: result.error };
  }
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await authed();
  await logoutAdmin();
  redirect("/admin/login");
}

/* -------------------------------------------------------------------------- */
/* Site settings + theme                                                      */
/* -------------------------------------------------------------------------- */

export async function saveSettingsAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await authed();
  try {
    const entries: { key: string; value: string }[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("setting.") && typeof value === "string") {
        entries.push({ key: key.slice("setting.".length), value });
      }
    }
    for (const { key, value } of entries) {
      await db
        .insert(siteSettings)
        .values({ key, value })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value, updatedAt: new Date() },
        });
    }
  } catch (error) {
    console.error("[admin] save settings failed", error);
    return ERROR;
  }
  revalidateSite();
  return { status: "success", message: "Content saved — live on the site now." };
}

export async function saveThemeAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await authed();
  const parsed = themeSchema.safeParse({
    accent: formString(formData, "accent"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }
  try {
    const [existing] = await db.select({ id: theme.id }).from(theme).limit(1);
    if (existing) {
      await db
        .update(theme)
        .set({ accent: parsed.data.accent, updatedAt: new Date() })
        .where(eq(theme.id, existing.id));
    } else {
      await db.insert(theme).values({ id: 1, accent: parsed.data.accent });
    }
  } catch (error) {
    console.error("[admin] save theme failed", error);
    return ERROR;
  }
  revalidateSite();
  return { status: "success", message: "Accent colour saved." };
}

/* -------------------------------------------------------------------------- */
/* Sectors                                                                    */
/* -------------------------------------------------------------------------- */

export async function upsertSectorAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await authed();
  const id = formString(formData, "id");
  const parsed = sectorSchema.safeParse({
    slug: formString(formData, "slug"),
    name: formString(formData, "name"),
    description: formString(formData, "description"),
    icon: formString(formData, "icon"),
    sortOrder: formString(formData, "sortOrder") || "0",
    status: formString(formData, "status") || "published",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }
  try {
    if (id) {
      await db
        .update(sectors)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(sectors.id, Number(id)));
    } else {
      await db.insert(sectors).values(parsed.data);
    }
  } catch (error) {
    console.error("[admin] upsert sector failed", error);
    return { status: "error", message: "Save failed — is the slug unique?" };
  }
  revalidateSite();
  redirect("/admin/sectors");
}

export async function deleteSectorAction(formData: FormData): Promise<void> {
  await authed();
  const id = Number(formString(formData, "id"));
  if (Number.isFinite(id)) {
    await db.delete(sectors).where(eq(sectors.id, id));
  }
  revalidateSite();
  redirect("/admin/sectors");
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export async function upsertProjectAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await authed();
  const id = formString(formData, "id");
  const sectorRaw = formString(formData, "sectorId");
  const parsed = projectSchema.safeParse({
    title: formString(formData, "title"),
    location: formString(formData, "location"),
    sectorId: sectorRaw === "" || sectorRaw === "none" ? null : sectorRaw,
    summary: formString(formData, "summary"),
    body: formString(formData, "body"),
    imageUrl: formString(formData, "imageUrl"),
    sortOrder: formString(formData, "sortOrder") || "0",
    status: formString(formData, "status") || "draft",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }
  try {
    if (id) {
      await db
        .update(projects)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(projects.id, Number(id)));
    } else {
      await db.insert(projects).values(parsed.data);
    }
  } catch (error) {
    console.error("[admin] upsert project failed", error);
    return ERROR;
  }
  revalidateSite();
  redirect("/admin/projects");
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await authed();
  const id = Number(formString(formData, "id"));
  if (Number.isFinite(id)) {
    await db.delete(projects).where(eq(projects.id, id));
  }
  revalidateSite();
  redirect("/admin/projects");
}

/* -------------------------------------------------------------------------- */
/* Impact stats                                                               */
/* -------------------------------------------------------------------------- */

export async function upsertStatAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await authed();
  const id = formString(formData, "id");
  const parsed = statSchema.safeParse({
    value: formString(formData, "value"),
    label: formString(formData, "label"),
    detail: formString(formData, "detail"),
    icon: formString(formData, "icon"),
    sortOrder: formString(formData, "sortOrder") || "0",
    status: formString(formData, "status") || "published",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }
  try {
    if (id) {
      await db
        .update(impactStats)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(impactStats.id, Number(id)));
    } else {
      await db.insert(impactStats).values(parsed.data);
    }
  } catch (error) {
    console.error("[admin] upsert stat failed", error);
    return ERROR;
  }
  revalidateSite();
  redirect("/admin/stats");
}

export async function deleteStatAction(formData: FormData): Promise<void> {
  await authed();
  const id = Number(formString(formData, "id"));
  if (Number.isFinite(id)) {
    await db.delete(impactStats).where(eq(impactStats.id, id));
  }
  revalidateSite();
  redirect("/admin/stats");
}

/* -------------------------------------------------------------------------- */
/* Giving options                                                             */
/* -------------------------------------------------------------------------- */

export async function upsertGivingAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await authed();
  const id = formString(formData, "id");
  const parsed = givingSchema.safeParse({
    title: formString(formData, "title"),
    description: formString(formData, "description"),
    icon: formString(formData, "icon"),
    ctaLabel: formString(formData, "ctaLabel"),
    ctaHref: formString(formData, "ctaHref"),
    sortOrder: formString(formData, "sortOrder") || "0",
    status: formString(formData, "status") || "published",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }
  try {
    if (id) {
      await db
        .update(givingOptions)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(givingOptions.id, Number(id)));
    } else {
      await db.insert(givingOptions).values(parsed.data);
    }
  } catch (error) {
    console.error("[admin] upsert giving option failed", error);
    return ERROR;
  }
  revalidateSite();
  redirect("/admin/giving");
}

export async function deleteGivingAction(formData: FormData): Promise<void> {
  await authed();
  const id = Number(formString(formData, "id"));
  if (Number.isFinite(id)) {
    await db.delete(givingOptions).where(eq(givingOptions.id, id));
  }
  revalidateSite();
  redirect("/admin/giving");
}

/* -------------------------------------------------------------------------- */
/* Bank accounts                                                              */
/* -------------------------------------------------------------------------- */

export async function upsertAccountAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await authed();
  const id = formString(formData, "id");
  const parsed = accountSchema.safeParse({
    scope: formString(formData, "scope") || "local",
    bankName: formString(formData, "bankName"),
    accountName: formString(formData, "accountName"),
    accountNumber: formString(formData, "accountNumber"),
    swiftCode: formString(formData, "swiftCode"),
    branch: formString(formData, "branch"),
    currency: formString(formData, "currency") || "ETB",
    note: formString(formData, "note"),
    sortOrder: formString(formData, "sortOrder") || "0",
    status: formString(formData, "status") || "draft",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }
  try {
    if (id) {
      await db
        .update(bankAccounts)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(bankAccounts.id, Number(id)));
    } else {
      await db.insert(bankAccounts).values(parsed.data);
    }
  } catch (error) {
    console.error("[admin] upsert bank account failed", error);
    return ERROR;
  }
  revalidateSite();
  redirect("/admin/accounts");
}

export async function deleteAccountAction(formData: FormData): Promise<void> {
  await authed();
  const id = Number(formString(formData, "id"));
  if (Number.isFinite(id)) {
    await db.delete(bankAccounts).where(eq(bankAccounts.id, id));
  }
  revalidateSite();
  redirect("/admin/accounts");
}

/* -------------------------------------------------------------------------- */
/* Gallery                                                                    */
/* -------------------------------------------------------------------------- */

export async function upsertGalleryAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await authed();
  const id = formString(formData, "id");
  const parsed = z.object({
    title: z.string().trim().min(1, "Required.").max(200),
    caption: z.string().trim().max(2000).optional().transform((v) => (v ? v : null)),
    imageUrl: z.string().trim().max(2000).optional().transform((v) => (v ? v : null)),
    sortOrder: z.coerce.number().int().default(0),
    status: z.enum(["draft", "published"]).default("draft"),
  }).safeParse({
    title: formString(formData, "title"),
    caption: formString(formData, "caption"),
    imageUrl: formString(formData, "imageUrl"),
    sortOrder: formString(formData, "sortOrder") || "0",
    status: formString(formData, "status") || "draft",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }
  try {
    if (id) {
      await db
        .update(galleryImages)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(galleryImages.id, Number(id)));
    } else {
      await db.insert(galleryImages).values(parsed.data);
    }
  } catch (error) {
    console.error("[admin] upsert gallery image failed", error);
    return ERROR;
  }
  revalidateSite();
  redirect("/admin/gallery");
}

export async function deleteGalleryAction(formData: FormData): Promise<void> {
  await authed();
  const id = Number(formString(formData, "id"));
  if (Number.isFinite(id)) {
    await db.delete(galleryImages).where(eq(galleryImages.id, id));
  }
  revalidateSite();
  redirect("/admin/gallery");
}

/* -------------------------------------------------------------------------- */
/* Submission statuses (donations / volunteers / messages)                    */
/* -------------------------------------------------------------------------- */

export async function updateDonationStatusAction(
  formData: FormData,
): Promise<void> {
  await authed();
  const id = Number(formString(formData, "id"));
  const status = formString(formData, "status");
  if (
    Number.isFinite(id) &&
    ["pending", "completed", "refunded", "failed"].includes(status)
  ) {
    await db
      .update(donations)
      .set({ status: status as "pending" })
      .where(eq(donations.id, id));
  }
  revalidatePath("/admin/donations");
}

export async function updateLeadStatusAction(
  formData: FormData,
): Promise<void> {
  await authed();
  const id = Number(formString(formData, "id"));
  const kind = formString(formData, "kind");
  const status = formString(formData, "status");
  if (
    !Number.isFinite(id) ||
    !["new", "in_progress", "archived"].includes(status)
  ) {
    return;
  }
  const value = status as "new";
  if (kind === "volunteer") {
    await db.update(volunteers).set({ status: value }).where(eq(volunteers.id, id));
    revalidatePath("/admin/volunteers");
  } else if (kind === "message") {
    await db.update(messages).set({ status: value }).where(eq(messages.id, id));
    revalidatePath("/admin/messages");
  }
}
