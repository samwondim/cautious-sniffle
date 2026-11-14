"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logoutAction } from "@/app/actions/admin";
import { AdminModal } from "@/components/admin/modal";
import { NavIcon, type NavIconName } from "@/components/admin/nav-icon";
import { ADMIN_NAV_COOKIE } from "@/lib/admin-nav";

/**
 * Admin navigation shell.
 *
 * The admin layout stays an async Server Component so it can
 * `await requireAdmin()`, so the drawer's open/closed state lives here.
 *
 * Two presentations of one nav: below `md` a sticky bar plus an off-canvas
 * drawer, and at `md` and up the full-height column the dashboard has always
 * had. The desktop column can collapse to an icon rail; the choice is stored
 * in a cookie so it survives reloads, and icon-only items reveal their label
 * in a tooltip on hover or keyboard focus.
 */

const NAV: {
  href: string;
  label: string;
  section: string;
  icon: NavIconName;
}[] = [
  { href: "/admin", label: "Overview", section: "", icon: "layout" },
  {
    href: "/admin/content",
    label: "Site content",
    section: "Content",
    icon: "book-open",
  },
  { href: "/admin/theme", label: "Theme", section: "Content", icon: "palette" },
  { href: "/admin/media", label: "Media", section: "Content", icon: "image" },
  { href: "/admin/sectors", label: "Sectors", section: "Content", icon: "sprout" },
  { href: "/admin/projects", label: "Projects", section: "Content", icon: "flag" },
  { href: "/admin/gallery", label: "Gallery", section: "Content", icon: "camera" },
  {
    href: "/admin/stats",
    label: "Impact stats",
    section: "Content",
    icon: "bar-chart",
  },
  {
    href: "/admin/giving",
    label: "Giving options",
    section: "Content",
    icon: "hand-heart",
  },
  {
    href: "/admin/accounts",
    label: "Bank accounts",
    section: "Content",
    icon: "building",
  },
  {
    href: "/admin/donations",
    label: "Donations",
    section: "Inbox",
    icon: "credit-card",
  },
  {
    href: "/admin/volunteers",
    label: "Volunteers",
    section: "Inbox",
    icon: "users",
  },
  {
    href: "/admin/messages",
    label: "Messages",
    section: "Inbox",
    icon: "message",
  },
  { href: "/admin/users", label: "Admins", section: "Team", icon: "users" },
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

function Logo({
  className = "h-11",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <>
      <Image
        src="/brand/empower-humanity-logo-white.svg"
        alt="Empower Humanity"
        width={42}
        height={45}
        className={`${className} w-auto`}
      />
      {compact ? null : (
        <span className="text-sm leading-tight font-semibold">
          Empower Humanity
          <span className="block text-xs font-normal text-mist">Admin</span>
        </span>
      )}
    </>
  );
}

/**
 * Floating label for an icon-only control.
 *
 * The desktop nav scrolls (`overflow-y-auto`), so a tooltip positioned inside
 * it would be clipped at the rail edge. `position: fixed` escapes the scroll
 * container; the coordinates are measured from the hovered/focused control so
 * it always sits just to its right.
 */
function HoverTip({
  label,
  enabled = true,
  className = "",
  children,
}: {
  label: string;
  enabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [tip, setTip] = useState<{ top: number; left: number } | null>(null);

  if (!enabled) return <>{children}</>;

  function show(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    setTip({ top: rect.top + rect.height / 2, left: rect.right + 12 });
  }

  return (
    <span
      className={`relative flex ${className}`}
      onMouseEnter={(event) => show(event.currentTarget)}
      onMouseLeave={() => setTip(null)}
      onFocus={(event) => show(event.currentTarget)}
      onBlur={() => setTip(null)}
    >
      {children}
      {tip ? (
        <span
          aria-hidden="true"
          style={{ top: tip.top, left: tip.left }}
          className="pointer-events-none fixed z-50 -translate-y-1/2 rounded-md bg-ink-deep px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg ring-1 ring-white/20"
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}

function CollapseToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <HoverTip label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        aria-controls="admin-sidebar"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 text-mist transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {collapsed ? <path d="M8 4l6 6-6 6" /> : <path d="M12 4l-6 6 6 6" />}
        </svg>
      </button>
    </HoverTip>
  );
}

function NavList({
  pathname,
  collapsed = false,
  onNavigate,
}: {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const [query, setQuery] = useState("");
  // The filter only makes sense while the labels are visible; collapsing
  // shows every page rather than leaving an invisible filter applied.
  const term = collapsed ? "" : query.trim().toLowerCase();
  const sections = term
    ? SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.label.toLowerCase().includes(term),
        ),
      })).filter((section) => section.items.length > 0)
    : SECTIONS;

  return (
    <nav
      className={`flex flex-1 flex-col gap-0.5 overflow-y-auto py-4 ${
        collapsed ? "px-2" : "px-3"
      }`}
    >
      {collapsed ? null : (
        <div className="relative mb-2">
          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-mist"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jump to…"
            aria-label="Filter admin pages"
            className="h-9 w-full rounded-lg border border-white/15 bg-white/5 pr-8 pl-8 text-sm text-white transition-colors placeholder:text-mist focus:border-white/30 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear page filter"
              className="absolute top-1/2 right-1.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/10 hover:text-white"
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
      )}

      {!collapsed && sections.length === 0 ? (
        <p className="px-3 py-2 text-sm text-mist">No pages match.</p>
      ) : null}

      {sections.map((section) => (
        <div key={section.title || "home"}>
          {collapsed ? (
            <div
              aria-hidden="true"
              className="mx-2 my-2 border-t border-white/10 first:mt-0"
            />
          ) : (
            <span className="block px-3 pt-4 pb-1 text-[11px] font-semibold tracking-[0.12em] text-mist/70 uppercase first:pt-0">
              {section.title || "Home"}
            </span>
          )}
          {section.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <HoverTip
                key={item.href}
                label={item.label}
                enabled={collapsed}
                className="w-full"
              >
                <Link
                  href={item.href}
                  onClick={() => {
                    setQuery("");
                    onNavigate?.();
                  }}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-lg py-2 text-sm transition-colors ${
                    collapsed ? "justify-center px-0" : "px-3"
                  } ${
                    active
                      ? "bg-white/15 font-semibold text-white"
                      : "text-mist hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <NavIcon name={item.icon} className="shrink-0" />
                  <span className={collapsed ? "sr-only" : "truncate"}>
                    {item.label}
                  </span>
                </Link>
              </HoverTip>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function SessionFooter({
  email,
  collapsed = false,
}: {
  email: string;
  collapsed?: boolean;
}) {
  if (collapsed) {
    return (
      <div className="border-t border-white/15 px-2 py-4">
        <form action={logoutAction} className="flex justify-center">
          <HoverTip label="Log out">
            <button
              type="submit"
              aria-label="Log out"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-mist transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogoutIcon />
            </button>
          </HoverTip>
        </form>
      </div>
    );
  }

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

export function AdminSidebar({
  email,
  defaultCollapsed = false,
}: {
  email: string;
  defaultCollapsed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
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

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    // Persist for full reloads; a year is long enough to feel like a setting.
    document.cookie = `${ADMIN_NAV_COOKIE}=${
      next ? "collapsed" : "expanded"
    }; path=/; max-age=31536000; samesite=lax`;
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

      {/* `md` and up: the persistent column, collapsible to an icon rail. */}
      <aside
        id="admin-sidebar"
        className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-ink-deep text-white transition-[width] duration-200 ease-out md:flex ${
          collapsed ? "w-[4.75rem]" : "w-60"
        }`}
      >
        <div
          className={`flex items-center pt-6 pb-2 ${
            collapsed ? "flex-col gap-3 px-2" : "justify-between gap-2 px-4"
          }`}
        >
          <Link
            href="/admin"
            aria-label="Empower Humanity admin home"
            className={`flex min-w-0 items-center gap-3 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <Logo compact={collapsed} />
          </Link>
          <CollapseToggle collapsed={collapsed} onToggle={toggleCollapsed} />
        </div>
        <NavList pathname={pathname} collapsed={collapsed} />
        <SessionFooter email={email} collapsed={collapsed} />
      </aside>
    </>
  );
}
