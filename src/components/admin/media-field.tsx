"use client";

import { useState } from "react";

import { MediaPicker } from "@/components/admin/media-picker";
import { mediaPath, parseMediaRef } from "@/lib/media-constants";

/**
 * Image reference field: a media-library key or an external URL.
 *
 * The underlying value stays a plain text input rather than a hidden one, so
 * the paste-a-URL workflow the dashboard has always supported keeps working
 * and the stored value is never a mystery. The picker is a convenience on top
 * that writes an object key into the same input.
 *
 * A library reference (`media:12`) resolves to this origin's own serving
 * route, so unlike an external store nothing has to be passed down from the
 * server to build a preview URL.
 */
export function MediaField({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [pickerOpen, setPickerOpen] = useState(false);

  const trimmed = value.trim();
  const referencedId = trimmed ? parseMediaRef(trimmed) : null;
  const previewUrl =
    referencedId !== null
      ? mediaPath(referencedId)
      : trimmed && /^(https?:)?\/\//i.test(trimmed)
        ? trimmed
        : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-hairline bg-mint">
          {previewUrl ? (
            /* Admin preview of an arbitrary origin: not optimiser-eligible. */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={previewUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="px-2 text-center text-[11px] text-slate">
              Placeholder
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            id={name}
            name={name}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Choose from library, or paste an image URL"
            className="field-input"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="rounded-full border border-hairline px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-teal"
            >
              Choose from library
            </button>
            {trimmed ? (
              <button
                type="button"
                onClick={() => setValue("")}
                className="rounded-full border border-hairline px-4 py-1.5 text-xs font-semibold text-slate transition-colors hover:border-teal hover:text-ink"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => setValue(asset.ref)}
      />
    </div>
  );
}
