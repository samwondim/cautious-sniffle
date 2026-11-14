/**
 * Human labels for the status enums. The database values (`in_progress`,
 * `one_time`) are identifiers, not words staff should have to read.
 *
 * Lives in its own module so both the server-rendered table and the client
 * status control can share it without dragging `AdminTable`'s render functions
 * into a client bundle.
 */
const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  new: "New",
  in_progress: "In progress",
  archived: "Archived",
  pending: "Pending",
  completed: "Completed",
  refunded: "Refunded",
  failed: "Failed",
};

export function statusLabel(status: string) {
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}
