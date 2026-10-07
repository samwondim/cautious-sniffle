"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import { REVEAL_EASE } from "@/lib/motion";

export type MobileNavItem = {
  href: string;
  label: string;
};

/**
 * The panel is absolutely positioned, so animating its height moves nothing
 * else on the page — the band below stays exactly where it is while the menu
 * opens over it.
 *
 * `when` sequences the two halves: links fade in once there is room for them,
 * and clear out before the panel closes over them. The closing stagger runs
 * backwards, so the list collapses from the bottom up.
 */
const PANEL = {
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: REVEAL_EASE,
      when: "beforeChildren" as const,
      delayChildren: 0.04,
      staggerChildren: 0.045,
    },
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.22,
      ease: REVEAL_EASE,
      when: "afterChildren" as const,
      staggerChildren: 0.025,
      staggerDirection: -1 as const,
    },
  },
};

const ITEM = {
  open: { opacity: 1, transform: "translateY(0px)" },
  closed: { opacity: 0, transform: "translateY(-6px)" },
};

/** The three bars fold into a cross; the middle one just goes. */
const BAR_TRANSITION = { duration: 0.28, ease: REVEAL_EASE };

const BARS = [
  {
    open: { transform: "translateY(0px) rotate(45deg)" },
    closed: { transform: "translateY(-6px) rotate(0deg)" },
  },
  {
    open: { opacity: 0, transform: "scaleX(0.4)" },
    closed: { opacity: 1, transform: "scaleX(1)" },
  },
  {
    open: { transform: "translateY(0px) rotate(-45deg)" },
    closed: { transform: "translateY(6px) rotate(0deg)" },
  },
];

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
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-ink transition-colors hover:border-teal"
      >
        <span aria-hidden="true" className="relative block h-4 w-5">
          {BARS.map((bar, index) => (
            <motion.span
              key={index}
              // No entry animation: the closed bars are the resting state.
              initial={false}
              animate={open ? "open" : "closed"}
              variants={bar}
              transition={BAR_TRANSITION}
              className="absolute left-0 block h-[2px] w-5 rounded-full bg-current"
              // `top` rather than a translate utility, so Motion owns the
              // whole transform and nothing competes with it.
              style={{ top: "calc(50% - 1px)" }}
            />
          ))}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.nav
            id="mobile-menu"
            key="mobile-menu"
            aria-label="Mobile"
            variants={PANEL}
            initial="closed"
            animate="open"
            exit="closed"
            className="absolute inset-x-4 top-[calc(100%+8px)] z-50 overflow-hidden rounded-3xl border border-hairline-strong bg-white px-6 shadow-[0_24px_48px_-16px_rgba(16,60,70,0.4)]"
          >
            {/* Padding lives inside, so the collapsing height reaches zero. */}
            <ul className="flex flex-col pt-2">
              {items.map((item) => (
                <motion.li
                  key={item.href}
                  variants={ITEM}
                  className="border-b border-hairline"
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-3.5 text-[16px] font-medium text-ink"
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div variants={ITEM} className="pt-5 pb-6">
              <Link
                href={donateHref}
                onClick={() => setOpen(false)}
                className="btn-donate block px-6 py-3.5 text-center text-sm font-semibold tracking-[0.08em] uppercase"
              >
                {donateLabel}
              </Link>
            </motion.div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
