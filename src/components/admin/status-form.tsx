"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useToast } from "@/components/admin/toast";
import { statusLabel } from "@/lib/status";

/**
 * Inline status control for the inbox pages.
 *
 * Keeps the explicit "Set" step so a stray selection can't change a record by
 * accident, but commits without a full page round-trip: the Server Action runs
 * in the background, confirms with a toast, and the select snaps back to the
 * saved value if the save fails.
 */
export function StatusForm({
  action,
  id,
  kind,
  status,
  options,
}: {
  action: (formData: FormData) => Promise<{ ok: true } | { ok: false; message: string }>;
  id: number;
  kind?: string;
  status: string;
  options: readonly string[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [selected, setSelected] = useState(status);
  const [isPending, startTransition] = useTransition();

  const dirty = selected !== status;

  function commit() {
    if (!dirty || isPending) return;
    const next = selected;
    const previous = status;

    const formData = new FormData();
    formData.append("id", String(id));
    if (kind) formData.append("kind", kind);
    formData.append("status", next);

    startTransition(async () => {
      let result: Awaited<ReturnType<typeof action>>;
      try {
        result = await action(formData);
      } catch {
        result = { ok: false, message: "Could not update. Please try again." };
      }
      if (result.ok) {
        toast({ message: `${statusLabel(next)} — saved.` });
        // Pull fresh rows so the Overview totals and tab counts reconcile.
        router.refresh();
      } else {
        setSelected(previous);
        toast({ message: result.message, tone: "error" });
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selected}
        onChange={(event) => setSelected(event.target.value)}
        aria-label="Status"
        disabled={isPending}
        className="h-9 rounded-lg border border-hairline bg-white px-2 text-xs font-medium text-ink transition-opacity disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {statusLabel(option)}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={commit}
        disabled={!dirty || isPending}
        className="rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-teal disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Set"}
      </button>
    </div>
  );
}
