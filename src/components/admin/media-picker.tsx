"use client";

import { useEffect, useId, useState, useTransition } from "react";

import { listMediaAction, type MediaListItem } from "@/app/actions/media";
import { AdminModal } from "@/components/admin/modal";
import { MediaUploader } from "@/components/admin/media-uploader";
import { formatBytes } from "@/lib/media-constants";

/**
 * Modal picker over the media library.
 *
 * The listing is fetched through a Server Action when the dialog first opens,
 * rather than prop-drilling the whole library into every edit page, so the
 * picker shows what was uploaded a moment ago without a page reload. It
 * embeds the uploader too — needing a new photograph is the common case, and
 * leaving the form to get one loses unsaved edits.
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaListItem) => void;
}) {
  const titleId = useId();
  const [items, setItems] = useState<MediaListItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = (term: string) => {
    startTransition(async () => {
      setItems(await listMediaAction({ query: term }));
    });
  };

  useEffect(() => {
    if (!open || items !== null) return;
    load("");
    // `items` is intentionally not a dependency: this loads once per open
    // cycle, and reloads are driven by search and upload instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className="m-auto max-h-[90dvh] w-[min(56rem,92vw)] overflow-hidden rounded-2xl"
    >
      <div className="flex max-h-[90dvh] flex-col bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-4">
          <h2 id={titleId} className="font-display text-xl text-ink">
            Choose an image
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-hairline px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-teal"
          >
            Close
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
          <MediaUploader
            onUploaded={(asset) =>
              setItems((list) => [asset, ...(list ?? [])])
            }
          />

          <div className="flex items-center gap-2">
            <input
              type="search"
              value={query}
              placeholder="Search by filename or alt text"
              aria-label="Search media"
              onChange={(event) => {
                setQuery(event.target.value);
                load(event.target.value);
              }}
              className="field-input"
            />
          </div>

          {items === null || (isPending && items.length === 0) ? (
            <p className="py-6 text-center text-sm text-slate">Loading…</p>
          ) : items.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate">
              {query
                ? "No images match that search."
                : "No images yet — upload one above."}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((asset) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(asset);
                      onClose();
                    }}
                    className="flex w-full flex-col overflow-hidden rounded-xl border border-hairline bg-white text-left transition-colors hover:border-teal"
                  >
                    {/* Admin-only grid: keep it off the image optimiser. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.url}
                      alt={asset.altText}
                      loading="lazy"
                      className="aspect-[4/3] w-full bg-mint object-cover"
                    />
                    <span className="flex min-w-0 flex-col gap-0.5 p-2">
                      <span className="truncate text-xs font-medium text-ink">
                        {asset.originalFilename}
                      </span>
                      <span className="text-[11px] text-slate">
                        {asset.width && asset.height
                          ? `${asset.width}×${asset.height} · `
                          : ""}
                        {formatBytes(asset.byteSize)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminModal>
  );
}
