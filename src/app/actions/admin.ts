"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  type DonationStatus,
  type LeadStatus,
} from "@/db/schema";
import {
  accountSchema,
  gallerySchema,
  givingSchema,
  projectSchema,
  sectorSchema,
  statSchema,
  themeSchema,
  type AdminActionState,
} from "@/lib/admin";
import {
  ERROR,
  authed,
  formString,
  revalidateSite,
  type ActionResult,
} from "@/lib/admin-actions";
import { loginAdmin, logoutAdmin } from "@/lib/auth";
import { fieldErrorsFrom } from "@/lib/forms";

/**
 * Admin Server Actions. Every mutation re-checks the session via `authed()` —
 * the layout guard alone is not enough, since actions are reachable by direct
 * POST. Shared helpers live in `src/lib/admin-actions.ts`, because a
 * `"use server"` module may only export Server Actions.
 */

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
  redirect("/admin/sectors?saved=1");
}

export async function deleteSectorAction(formData: FormData): Promise<ActionResult> {
  await authed();
  const id = Number(formString(formData, "id"));
  if (!Number.isFinite(id)) return { ok: false, message: "Invalid request." };
  try {
    await db.delete(sectors).where(eq(sectors.id, id));
  } catch (error) {
    console.error("[admin] delete sector failed", error);
    return { ok: false, message: "Could not delete. Please try again." };
  }
  revalidateSite();
  return { ok: true };
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
    partner: formString(formData, "partner"),
    timeframe: formString(formData, "timeframe"),
    beneficiaries: formString(formData, "beneficiaries"),
    outcomes: formString(formData, "outcomes"),
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
  redirect("/admin/projects?saved=1");
}

export async function deleteProjectAction(formData: FormData): Promise<ActionResult> {
  await authed();
  const id = Number(formString(formData, "id"));
  if (!Number.isFinite(id)) return { ok: false, message: "Invalid request." };
  try {
    await db.delete(projects).where(eq(projects.id, id));
  } catch (error) {
    console.error("[admin] delete project failed", error);
    return { ok: false, message: "Could not delete. Please try again." };
  }
  revalidateSite();
  return { ok: true };
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
  redirect("/admin/stats?saved=1");
}

export async function deleteStatAction(formData: FormData): Promise<ActionResult> {
  await authed();
  const id = Number(formString(formData, "id"));
  if (!Number.isFinite(id)) return { ok: false, message: "Invalid request." };
  try {
    await db.delete(impactStats).where(eq(impactStats.id, id));
  } catch (error) {
    console.error("[admin] delete stat failed", error);
    return { ok: false, message: "Could not delete. Please try again." };
  }
  revalidateSite();
  return { ok: true };
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
  redirect("/admin/giving?saved=1");
}

export async function deleteGivingAction(formData: FormData): Promise<ActionResult> {
  await authed();
  const id = Number(formString(formData, "id"));
  if (!Number.isFinite(id)) return { ok: false, message: "Invalid request." };
  try {
    await db.delete(givingOptions).where(eq(givingOptions.id, id));
  } catch (error) {
    console.error("[admin] delete giving option failed", error);
    return { ok: false, message: "Could not delete. Please try again." };
  }
  revalidateSite();
  return { ok: true };
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
  redirect("/admin/accounts?saved=1");
}

export async function deleteAccountAction(formData: FormData): Promise<ActionResult> {
  await authed();
  const id = Number(formString(formData, "id"));
  if (!Number.isFinite(id)) return { ok: false, message: "Invalid request." };
  try {
    await db.delete(bankAccounts).where(eq(bankAccounts.id, id));
  } catch (error) {
    console.error("[admin] delete bank account failed", error);
    return { ok: false, message: "Could not delete. Please try again." };
  }
  revalidateSite();
  return { ok: true };
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
  const parsed = gallerySchema.safeParse({
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
  redirect("/admin/gallery?saved=1");
}

export async function deleteGalleryAction(formData: FormData): Promise<ActionResult> {
  await authed();
  const id = Number(formString(formData, "id"));
  if (!Number.isFinite(id)) return { ok: false, message: "Invalid request." };
  try {
    await db.delete(galleryImages).where(eq(galleryImages.id, id));
  } catch (error) {
    console.error("[admin] delete gallery image failed", error);
    return { ok: false, message: "Could not delete. Please try again." };
  }
  revalidateSite();
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Submission statuses (donations / volunteers / messages)                    */
/* -------------------------------------------------------------------------- */

/** Result shape the optimistic status control consumes. */
export type StatusResult = { ok: true } | { ok: false; message: string };

const DONATION_STATUSES: readonly string[] = [
  "pending",
  "completed",
  "refunded",
  "failed",
];
const LEAD_STATUSES: readonly string[] = ["new", "in_progress", "archived"];

/** Narrows a form string to the enum after a runtime membership check. */
function isDonationStatus(value: string): value is DonationStatus {
  return DONATION_STATUSES.includes(value);
}

function isLeadStatus(value: string): value is LeadStatus {
  return LEAD_STATUSES.includes(value);
}

export async function updateDonationStatusAction(
  formData: FormData,
): Promise<StatusResult> {
  await authed();
  const id = Number(formString(formData, "id"));
  const status = formString(formData, "status");
  if (!Number.isFinite(id)) return { ok: false, message: "Invalid record." };
  if (!isDonationStatus(status)) {
    return { ok: false, message: "That status is not recognised." };
  }
  try {
    await db.update(donations).set({ status }).where(eq(donations.id, id));
  } catch (error) {
    console.error("[admin] update donation status failed", error);
    return { ok: false, message: "Could not update. Please try again." };
  }
  revalidatePath("/admin/donations");
  // The overview's confirmed total and "to confirm" count read these rows.
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateLeadStatusAction(
  formData: FormData,
): Promise<StatusResult> {
  await authed();
  const id = Number(formString(formData, "id"));
  const kind = formString(formData, "kind");
  const status = formString(formData, "status");
  if (!Number.isFinite(id)) return { ok: false, message: "Invalid record." };
  if (!isLeadStatus(status)) {
    return { ok: false, message: "That status is not recognised." };
  }
  try {
    if (kind === "volunteer") {
      await db
        .update(volunteers)
        .set({ status })
        .where(eq(volunteers.id, id));
      revalidatePath("/admin/volunteers");
    } else if (kind === "message") {
      await db.update(messages).set({ status }).where(eq(messages.id, id));
      revalidatePath("/admin/messages");
    } else {
      return { ok: false, message: "That record type is not recognised." };
    }
  } catch (error) {
    console.error("[admin] update lead status failed", error);
    return { ok: false, message: "Could not update. Please try again." };
  }
  // The overview counts new volunteers and messages.
  revalidatePath("/admin");
  return { ok: true };
}
