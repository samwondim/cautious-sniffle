"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Search + sort toolbar for the admin list pages.
 *
 * State lives in the URL (`?q=` and `?sort=`), read here with `useSearchParams`
 * and written through `router.replace`, so filtering stays server-side and the
 * selection survives refresh. Only the input is interactive client-side: the
 * search box debounces, the sort select navigates immediately.
 *
 * Admin pages are `force-dynamic`, so `useSearchParams` needs no Suspense
 * boundary.
 */

export type SortOption = { value: string; label: string };

export function ListToolbar({
  sortOptions,
  searchPlaceholder,
}: {
  sortOptions: SortOption[];
  searchPlaceholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQ = searchParams.get("q") ?? "";
  const urlSort = searchParams.get("sort") ?? sortOptions[0]?.value ?? "";

  const [q, setQ] = useState(urlQ);

  // The input mirrors the URL. A change to `urlQ` that did not come from
  // typing — a tab, Clear, or back/forward — resets the box. `prevUrlQ` stores
  // the last rendered value so we can detect that change; adjusting state
  // during render is React's documented alternative to a reset effect, and an
  // effect here would trip `react-hooks/set-state-in-effect`.
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setQ(urlQ);
  }

  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed === (searchParams.get("q") ?? "")) return;
    const id = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(id);
  }, [q, searchParams, pathname, router]);

  function changeSort(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("sort", value);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate"
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5L14 14" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search"
          className="h-10 w-full rounded-full border border-hairline bg-white pr-9 pl-9 text-sm text-ink [&::-webkit-search-cancel-button]:hidden"
        />
        {q ? (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate transition-colors hover:bg-mint hover:text-ink"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M2 2l8 8M10 2L2 10" />
            </svg>
          </button>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate">
        <span className="hidden sm:inline">Sort</span>
        <select
          value={urlSort}
          onChange={(event) => changeSort(event.target.value)}
          aria-label="Sort"
          className="h-10 rounded-full border border-hairline bg-white px-3 text-sm font-medium text-ink"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
