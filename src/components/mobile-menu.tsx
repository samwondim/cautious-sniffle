"use client";

import Link from "next/link";
import { useState } from "react";

export type MobileNavItem = {
  href: string;
  label: string;
};

/** Hamburger menu for small screens — the desktop nav is `hidden md:flex`. */
export function MobileMenu({
  items,
  donateHref,
  donateLabel,
}: {
  items: MobileNavItem[];
  donateHref: string;
  donateLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-ink transition-colors hover:border-teal"
      >
        {open ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 4l12 12M16 4L4 16" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        )}
      </button>

      {open ? (
        <nav
          aria-label="Mobile"
          className="absolute inset-x-0 top-full z-50 border-b border-hairline-strong bg-white px-6 pt-2 pb-6"
        >
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.href} className="border-b border-hairline">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3.5 text-[16px] font-medium text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={donateHref}
            onClick={() => setOpen(false)}
            className="btn-donate mt-5 block px-6 py-3.5 text-center text-sm font-semibold tracking-[0.08em] uppercase"
          >
            {donateLabel}
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
