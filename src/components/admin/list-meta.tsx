import Link from "next/link";

/**
 * "N matching · Clear" line shown above a list only while a search or status
 * filter is active, so staff always know they are looking at a subset.
 * Server-rendered: the page already knows the filtered count.
 */
export function ListMeta({
  count,
  filtered,
  clearHref,
}: {
  count: number;
  filtered: boolean;
  clearHref: string;
}) {
  if (!filtered) return null;
  return (
    <p className="flex items-center justify-between gap-3 text-sm text-slate">
      <span>
        <strong className="font-semibold text-ink">{count}</strong> matching
      </span>
      <Link
        href={clearHref}
        className="font-semibold text-accent transition-opacity hover:opacity-70"
      >
        Clear
      </Link>
    </p>
  );
}
