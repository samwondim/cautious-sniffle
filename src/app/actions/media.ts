"use server";

import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { galleryImages, mediaAssets, mediaBlobs, projects } from "@/db/schema";
import {
  ERROR,
  authed,
  formString,
  revalidateSite,
} from "@/lib/admin-actions";
import { mediaAltSchema, uploadMetaSchema } from "@/lib/admin";
import type { AdminActionState } from "@/lib/admin";
import { fieldErrorsFrom } from "@/lib/forms";
import {
  MAX_UPLOAD_BYTES,
  MEDIA_MIME_TYPES,
  mediaPath,
  mediaRef,
  type MediaMimeType,
} from "@/lib/media-constants";

/**
 * Media library actions.
 *
 * Image bytes live in Postgres (`media_blobs`), so an upload travels through
 * a Server Action rather than going straight to a storage service. That makes
 * the request body the binding constraint — see `MAX_UPLOAD_BYTES` and
 * `serverActions.bodySizeLimit` — which is why the browser downscales before
 * sending.
 *
 * Every action re-checks the session: Server Actions are reachable by direct
 * POST without the admin layout ever rendering.
 */

export type MediaListItem = {
  id: number;
  ref: string;
  url: string;
  originalFilename: string;
  contentType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  altText: string;
};

type AssetRow = typeof mediaAssets.$inferSelect;

function toListItem(row: AssetRow): MediaListItem {
  return {
    id: row.id,
    ref: mediaRef(row.id),
    url: mediaPath(row.id),
    originalFilename: row.originalFilename,
    contentType: row.contentType,
    byteSize: row.byteSize,
    width: row.width,
    height: row.height,
    altText: row.altText,
  };
}

/**
 * Stores one image.
 *
 * Metadata and bytes are written in a transaction, so an asset can never be
 * listed without the bytes behind it — the failure mode that, with an
 * external store, needed a reconciliation pass to find.
 */
export async function uploadMediaAction(
  formData: FormData,
): Promise<{ ok: true; asset: MediaListItem } | { ok: false; message: string }> {
  const session = await authed();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, message: "No file was received." };
  }

  const meta = uploadMetaSchema.safeParse({
    originalFilename: formString(formData, "originalFilename") || file.name,
    width: formString(formData, "width") || null,
    height: formString(formData, "height") || null,
  });
  if (!meta.success) {
    return { ok: false, message: "That upload could not be recorded." };
  }

  if (!MEDIA_MIME_TYPES.includes(file.type as MediaMimeType)) {
    return {
      ok: false,
      message: "That file type is not supported. Use JPEG, PNG, WebP or AVIF.",
    };
  }
  if (file.size <= 0) {
    return { ok: false, message: "That file is empty." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      message: `That image is still ${Math.round(file.size / (1024 * 1024))} MB after resizing. The limit is ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`,
    };
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const asset = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(mediaAssets)
        .values({
          originalFilename: meta.data.originalFilename,
          contentType: file.type,
          byteSize: bytes.byteLength,
          width: meta.data.width,
          height: meta.data.height,
          uploadedBy: session.adminId,
        })
        .returning();

      await tx.insert(mediaBlobs).values({
        mediaAssetId: row.id,
        data: bytes,
      });

      return row;
    });

    revalidateSite();
    return { ok: true, asset: toListItem(asset) };
  } catch (error) {
    console.error("[admin] could not store uploaded image", error);
    return { ok: false, message: "Could not save that image." };
  }
}

/** Library listing for the picker. Never selects the bytes. */
export async function listMediaAction(input?: {
  query?: string;
  limit?: number;
}): Promise<MediaListItem[]> {
  await authed();

  const term = input?.query?.trim();
  const limit = Math.min(Math.max(input?.limit ?? 60, 1), 200);

  const rows = await db
    .select()
    .from(mediaAssets)
    .where(
      term
        ? or(
            ilike(mediaAssets.originalFilename, `%${term}%`),
            ilike(mediaAssets.altText, `%${term}%`),
          )
        : undefined,
    )
    // `created_at` ties need a unique tiebreaker or the order is unstable.
    .orderBy(desc(mediaAssets.createdAt), desc(mediaAssets.id))
    .limit(limit);

  return rows.map(toListItem);
}

/** Alt text is the one editable field; the bytes themselves are immutable. */
export async function updateMediaAltAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await authed();

  const id = Number(formString(formData, "id"));
  const parsed = mediaAltSchema.safeParse({
    altText: formString(formData, "altText"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }
  if (!Number.isFinite(id)) return ERROR;

  try {
    await db
      .update(mediaAssets)
      .set({ altText: parsed.data.altText, updatedAt: new Date() })
      .where(eq(mediaAssets.id, id));
  } catch (error) {
    console.error("[admin] could not update alt text", error);
    return ERROR;
  }

  revalidateSite();
  redirect("/admin/media");
}

/**
 * Deletes an asset, refusing while a project or gallery image still uses it.
 *
 * Content rows hold the reference as plain text, so there is no foreign key
 * to stop a deletion that would leave a broken image on the public site. The
 * bytes go with the row through `ON DELETE CASCADE`.
 */
export async function deleteMediaAction(formData: FormData): Promise<void> {
  await authed();

  const id = Number(formString(formData, "id"));
  if (!Number.isFinite(id)) redirect("/admin/media");

  const reference = mediaRef(id);
  const [{ count: inProjects }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projects)
    .where(eq(projects.imageUrl, reference));
  const [{ count: inGallery }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(galleryImages)
    .where(eq(galleryImages.imageUrl, reference));

  const references = (inProjects ?? 0) + (inGallery ?? 0);
  if (references > 0) {
    redirect(`/admin/media?error=in-use&count=${references}`);
  }

  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));

  revalidateSite();
  redirect("/admin/media");
}
