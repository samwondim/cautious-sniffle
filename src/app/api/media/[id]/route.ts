import { eq } from "drizzle-orm";

import { db } from "@/db";
import { mediaAssets, mediaBlobs } from "@/db/schema";

/**
 * Streams a stored image.
 *
 * Deliberately unauthenticated: these bytes back the public website, so the
 * route has to answer anonymous requests the same way an image CDN would.
 * The ids are sequential, so an unreferenced upload is discoverable by
 * guessing — the same exposure the library had when it was a public bucket.
 * Nothing secret should be uploaded here.
 *
 * Bytes are immutable once stored: editing an asset changes only its alt
 * text, and replacing a photograph means uploading a new one with a new id.
 * That is what makes a long immutable cache safe, which matters because every
 * miss is a database round trip rather than a CDN hit.
 */
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const assetId = Number(id);
  if (!Number.isSafeInteger(assetId) || assetId <= 0) {
    return new Response("Not found", { status: 404 });
  }

  const [row] = await db
    .select({
      data: mediaBlobs.data,
      contentType: mediaAssets.contentType,
      byteSize: mediaAssets.byteSize,
    })
    .from(mediaBlobs)
    .innerJoin(mediaAssets, eq(mediaAssets.id, mediaBlobs.mediaAssetId))
    .where(eq(mediaBlobs.mediaAssetId, assetId))
    .limit(1);

  if (!row) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.contentType,
      "Content-Length": String(row.byteSize),
      "Cache-Control": "public, max-age=31536000, immutable",
      // The bytes are served from this origin and are never markup, but say
      // so explicitly rather than letting a browser sniff a type.
      "X-Content-Type-Options": "nosniff",
    },
  });
}
