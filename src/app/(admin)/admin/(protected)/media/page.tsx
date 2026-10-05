import { desc } from "drizzle-orm";

import { deleteMediaAction } from "@/app/actions/media";
import { MediaUploader } from "@/components/admin/media-uploader";
import { CopyButton } from "@/components/admin/copy-button";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { formatBytes, mediaPath, mediaRef } from "@/lib/media-constants";

export const metadata = { title: "Media — Admin" };

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; count?: string }>;
}) {
  const { error, count } = await searchParams;

  const rows = await db
    .select()
    .from(mediaAssets)
    // `created_at` ties need a unique tiebreaker or the order is unstable.
    .orderBy(desc(mediaAssets.createdAt), desc(mediaAssets.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Media</h1>
        <p className="mt-1 text-sm text-slate">
          Images you can pick from when editing projects and the gallery.
          Stored in the database and served from this site.
        </p>
      </div>

      {error === "in-use" ? (
        <p
          role="status"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          That image is still used by {count ?? "some"} item
          {count === "1" ? "" : "s"}. Remove it from them first, so the public
          site does not lose a photograph.
        </p>
      ) : null}

      <MediaUploader />

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-hairline bg-white px-5 py-6 text-sm text-slate">
          No media yet — upload your first image above.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-hairline bg-white"
            >
              {/*
                An admin-only thumbnail grid. A plain <img> keeps these off the
                image optimiser, which exists to serve public traffic.
              */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaPath(row.id)}
                alt={row.altText}
                loading="lazy"
                className="aspect-[4/3] w-full bg-mint object-cover"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
                <p
                  className="truncate text-sm font-medium text-ink"
                  title={row.originalFilename}
                >
                  {row.originalFilename}
                </p>
                <p className="text-xs text-slate">
                  {row.width && row.height ? `${row.width}×${row.height} · ` : ""}
                  {formatBytes(row.byteSize)}
                </p>
                <p className="truncate text-xs text-slate">
                  {row.altText ? row.altText : "No alt text"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CopyButton
                    value={mediaRef(row.id)}
                    label="image reference"
                    idleLabel="Copy reference"
                  />
                  <form action={deleteMediaAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
