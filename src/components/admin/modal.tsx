"use client";

import { useEffect, useRef } from "react";

/**
 * Modal built on the native `<dialog>` element.
 *
 * `showModal()` gives us the top layer, a `::backdrop`, Escape-to-close, an
 * inert page behind, and a real focus trap — all of which would otherwise be
 * hand-rolled, since this project has no component library. The UA's default
 * centred box is reset here so callers control position and size entirely
 * through `className`.
 *
 * Escape is routed through React state rather than letting the browser close
 * the dialog on its own, so `open` never disagrees with what's on screen.
 */
export function AdminModal({
  open,
  onClose,
  labelledBy,
  className = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** id of the element naming this dialog, for screen readers. */
  labelledBy: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }

    if (!open) return;

    // `showModal()` makes the page inert but does not reliably stop it
    // scrolling behind the dialog.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        // Escape: keep React as the source of truth for `open`.
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // The backdrop is part of the dialog's own box, so a click landing on
        // the element itself (rather than a child) is a backdrop click.
        if (event.target === ref.current) onClose();
      }}
      className={`m-0 max-h-none max-w-none bg-transparent p-0 text-ink backdrop:bg-ink-deep/60 ${className}`}
    >
      {children}
    </dialog>
  );
}
