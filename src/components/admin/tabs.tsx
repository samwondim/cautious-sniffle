import Link from "next/link";

/**
 * Status tab bar for the inbox pages.
 *
 * Server-rendered links: each tab is a plain URL (`?status=…`), so the
 * selection survives refresh and is shareable, matching the rest of the admin
 * area. The first option is the default — no param means "show what needs
 * attention" — and `all` clears the filter.
 */

export type TabOption = { value: string; label: string; count?: number };

export function AdminTabs({
  options,
  current,
  baseHref,
  label = "Filter by status",
  preserve,
}: {
  options: TabOption[];
  /** Raw `status` search param; `undefined` means the default tab. */
  current: string | undefined;
  baseHref: string;
  label?: string;
  /**
   * Other query params to keep when switching tabs (e.g. the current search
   * and sort), so changing view does not silently discard the filter.
   */
  preserve?: Record<string, string | undefined>;
}) {
  const activeValue = current ?? options[0]?.value;

  function hrefFor(value: string): string {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(preserve ?? {})) {
      if (val) params.set(key, val);
    }
    // The first option is the default and stays param-free.
    if (value !== options[0]?.value) params.set("status", value);
    const query = params.toString();
    return query ? `${baseHref}?${query}` : baseHref;
  }

  return (
    <nav aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.value === activeValue;
        return (
          <Link
            key={option.value}
            href={hrefFor(option.value)}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-white"
                : "rounded-full border border-hairline bg-white px-4 py-1.5 text-sm text-slate transition-colors hover:border-teal hover:text-ink"
            }
          >
            {option.label}
            {option.count != null ? (
              <span
                className={`ml-1.5 text-xs font-semibold ${
                  active ? "text-white/70" : "text-slate"
                }`}
              >
                {option.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
