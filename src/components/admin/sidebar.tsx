"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logoutAction } from "@/app/actions/admin";
import { AdminModal } from "@/components/admin/modal";

/**
 * Admin navigation shell.
 *
 * The admin layout stays an async Server Component so it can
 * `await requireAdmin()`, so the drawer's open/closed state lives here.
 *
 * Two presentations of one nav: below `md` a sticky bar plus an off-canvas
 * drawer, and at `md` and up the full-height column the dashboard has always
 * had. The desktop markup is carried over unchanged — only the breakpoint
 * prefixes and the active-link styling are new.
 */

const NAV: { href: string; label: string; section: string }[] = [
  { href: "/admin", label: "Overview", section: "" },
  { href: "/admin/content", label: "Site content", section: "Content" },
  { href: "/admin/theme", label: "Theme", section: "Content" },
  { href: "/admin/media", label: "Media", section: "Content" },
  { href: "/admin/sectors", label: "Sectors", section: "Content" },
  { href: "/admin/projects", label: "Projects", section: "Content" },
  { href: "/admin/gallery", label: "Gallery", section: "Content" },
  { href: "/admin/stats", label: "Impact stats", section: "Content" },
  { href: "/admin/giving", label: "Giving options", section: "Content" },
  { href: "/admin/accounts", label: "Bank accounts", section: "Content" },
  { href: "/admin/donations", label: "Donations", section: "Inbox" },
  { href: "/admin/volunteers", label: "Volunteers", section: "Inbox" },
  { href: "/admin/messages", label: "Messages", section: "Inbox" },
];

const SECTIONS: { title: string; items: typeof NAV }[] = [];
for (const item of NAV) {
  const last = SECTIONS[SECTIONS.length - 1];
  if (last && last.title === item.section) {
    last.items.push(item);
  } else {
    SECTIONS.push({ title: item.section, items: [item] });
  }
}

/**
 * Overview is an exact match; every other entry also owns its `edit` child,
 * so `/admin/projects/edit?id=3` still highlights "Projects".
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function currentLabel(pathname: string): string {
  const match = NAV.find((item) => isActive(pathname, item.href));
  return match?.label ?? "Admin";
}

function Logo({ className = "h-11" }: { className?: string }) {
  return (
    <>
      <Image
        src="/brand/empower-humanity-logo-white.svg"
        alt="Empower Humanity"
        width={42}
        height={45}
        className={`${className} w-auto`}
      />
      <span className="text-sm leading-tight font-semibold">
        Empower Humanity
        <span className="block text-xs font-normal text-mist">Admin</span>
      </span>
    </>
  );
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
      {SECTIONS.map((section) => (
        <div key={section.title || "home"}>
          <span className="block px-3 pt-4 pb-1 text-[11px] font-semibold tracking-[0.12em] text-sage uppercase first:pt-0">
            {section.title || "Home"}
          </span>
          {section.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "block rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white"
                    : "block rounded-lg px-3 py-2 text-sm text-mist transition-colors hover:bg-white/10 hover:text-white"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SessionFooter({ email }: { email: string }) {
  return (
    <div className="border-t border-white/15 px-5 py-4">
      <p className="truncate text-xs text-mist">{email}</p>
      <form action={logoutAction} className="mt-2">
        <button
          type="submit"
          className="rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
        >
          Log out
        </button>
      </form>
    </div>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
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
      {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 5h14M3 10h14M3 15h14" />}
    </svg>
  );
}

export function AdminSidebar({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Navigating closes the drawer, so it never sits over the page it just
  // opened. Link clicks close it directly; this also covers navigation the
  // drawer didn't initiate, such as browser back/forward. Adjusting state
  // during render is React's documented alternative to a reset effect —
  // an effect here would trip `react-hooks/set-state-in-effect`.
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setOpen(false);
  }

  return (
    <>
      {/* Small screens: the bar holding the drawer toggle. */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/15 bg-ink-deep px-4 py-3 text-white md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-label="Open navigation"
          className="-ml-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        >
          <MenuIcon open={false} />
        </button>
        <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
          <Logo className="h-8" />
        </Link>
        <span className="ml-auto truncate text-xs text-mist">
          {currentLabel(pathname)}
        </span>
      </header>

      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="admin-drawer-title"
        className="mr-auto h-dvh w-[17rem] max-w-[85vw]"
      >
        <div className="flex h-full flex-col bg-ink-deep text-white">
          <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-2">
            <Link
              href="/admin"
              id="admin-drawer-title"
              onClick={() => setOpen(false)}
              className="flex min-w-0 items-center gap-3"
            >
              <Logo className="h-9" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="-mr-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            >
              <MenuIcon open />
            </button>
          </div>
          <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
          <SessionFooter email={email} />
        </div>
      </AdminModal>

      {/* `md` and up: the original persistent column. */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-ink-deep text-white md:flex">
        <Link href="/admin" className="flex items-center gap-3 px-5 pt-6 pb-2">
          <Logo />
        </Link>
        <NavList pathname={pathname} />
        <SessionFooter email={email} />
      </aside>
    </>
  );
}
