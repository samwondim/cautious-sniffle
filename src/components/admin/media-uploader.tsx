"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { uploadMediaAction, type MediaListItem } from "@/app/actions/media";
import {
  MAX_IMAGE_EDGE,
  MAX_SOURCE_BYTES,
  MAX_UPLOAD_BYTES,
  MEDIA_MIME_TYPES,
  formatBytes,
} from "@/lib/media-constants";

/**
 * Uploads images into the media library.
 *
 * Bytes are stored in Postgres, so they travel through a Server Action and
 * the request body becomes the binding limit — a few megabytes on a typical
 * serverless host. A photograph straight off a phone is comfortably larger
 * than that, so the browser downscales and re-encodes first. That also keeps
 * the database from carrying full-resolution originals it has no use for: the
 * largest slot on the site is a 900px-wide hero.
 *
 * The consequence worth knowing: what is stored is a web-sized derivative,
 * not an archival copy of the file the admin selected.
 */

type Upload = {
  id: string;
  name: string;
  status: "pending" | "working" | "done" | "error";
  message?: string;
};

const ACCEPT = MEDIA_MIME_TYPES.join(",");

type Prepared = {
  blob: Blob;
  width: number;
  height: number;
  filename: string;
};

/** Longest-edge cap, re-encoded to WebP. Falls back to the original bytes. */
async function prepareImage(file: File): Promise<Prepared> {
  const original: Prepared = {
    blob: file,
    width: 0,
    height: 0,
    filename: file.name,
  };

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Undecodable here (an AVIF on an older browser, say). Send it as-is and
    // let the server's type and size checks have the final word.
    return original;
  }

  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return { ...original, width, height };
  }
  context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const encoded = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.82),
  );

  // Re-encoding is only worth it if it actually saved bytes and the source
  // did not need shrinking anyway.
  if (!encoded || (scale === 1 && encoded.size >= file.size)) {
    return { ...original, width, height };
  }

  return {
    blob: encoded,
    width: targetWidth,
    height: targetHeight,
    filename: file.name.replace(/\.[^.]+$/, "") + ".webp",
  };
}

export function MediaUploader({
  onUploaded,
}: {
  /** Called per successful upload. Omit to just refresh the page. */
  onUploaded?: (asset: MediaListItem) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragging, setDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  const update = (id: string, patch: Partial<Upload>) =>
    setUploads((list) =>
      list.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    );

  async function uploadOne(file: File, id: string): Promise<void> {
    if (!MEDIA_MIME_TYPES.includes(file.type as (typeof MEDIA_MIME_TYPES)[number])) {
      update(id, {
        status: "error",
        message: "Unsupported type. Use JPEG, PNG, WebP or AVIF.",
      });
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      update(id, {
        status: "error",
        message: `Too large (${formatBytes(file.size)}).`,
      });
      return;
    }

    update(id, { status: "working" });

    const prepared = await prepareImage(file);
    if (prepared.blob.size > MAX_UPLOAD_BYTES) {
      update(id, {
        status: "error",
        message: `Still ${formatBytes(prepared.blob.size)} after resizing; limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`,
      });
      return;
    }

    const body = new FormData();
    body.append(
      "file",
      new File([prepared.blob], prepared.filename, {
        type: prepared.blob.type || file.type,
      }),
    );
    body.append("originalFilename", prepared.filename);
    if (prepared.width) body.append("width", String(prepared.width));
    if (prepared.height) body.append("height", String(prepared.height));

    let result: Awaited<ReturnType<typeof uploadMediaAction>>;
    try {
      result = await uploadMediaAction(body);
    } catch {
      update(id, {
        status: "error",
        message: "Upload failed. Check your connection and retry.",
      });
      return;
    }

    if (!result.ok) {
      update(id, { status: "error", message: result.message });
      return;
    }

    update(id, { status: "done" });
    onUploaded?.(result.asset);
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const queued = Array.from(files).map((file) => ({
      file,
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
    }));

    setUploads((list) => [
      ...queued.map(({ file, id }) => ({
        id,
        name: file.name,
        status: "pending" as const,
      })),
      ...list,
    ]);

    startTransition(async () => {
      // Sequential: resizing is CPU-bound and a handful of large photographs
      // at once is the common case, so serialising keeps the page responsive
      // and the progress list honest.
      for (const { file, id } of queued) await uploadOne(file, id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors ${
          dragging ? "border-teal bg-mint" : "border-hairline bg-white"
        }`}
      >
        <p className="text-sm font-medium text-ink">
          Drag images here, or choose files
        </p>
        <p className="text-xs text-slate">
          JPEG, PNG, WebP or AVIF · large photos are resized automatically
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="btn-secondary mt-2 px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Uploading…" : "Choose files"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="sr-only"
          onChange={(event) => {
            handleFiles(event.target.files);
            // Allow re-selecting the same file after a failure.
            event.target.value = "";
          }}
        />
      </div>

      {uploads.length > 0 ? (
        <ul className="flex flex-col gap-1.5" aria-live="polite">
          {uploads.map((upload) => (
            <li
              key={upload.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-white px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate text-ink">{upload.name}</span>
              <span
                className={`shrink-0 text-xs font-semibold ${
                  upload.status === "error" ? "text-red-600" : "text-slate"
                }`}
              >
                {upload.status === "done"
                  ? "Uploaded"
                  : upload.status === "error"
                    ? upload.message
                    : upload.status === "working"
                      ? "Resizing…"
                      : "Queued"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
