import Image from "next/image";
import Link from "next/link";

import { logoutAction } from "@/app/actions/admin";
import { requireAdmin } from "@/lib/auth";

/** Admin pages read live CMS content, so they must never be prerendered. */
export const dynamic = "force-dynamic";

const NAV: { href: string; label: string; section: string }[] = [
  { href: "/admin", label: "Overview", section: "" },
  { href: "/admin/content", label: "Site content", section: "Content" },
  { href: "/admin/theme", label: "Theme", section: "Content" },
  { href: "/admin/sectors", label: "Sectors", section: "Content" },
  { href: "/admin/projects", label: "Projects", section: "Content" },
  { href: "/admin/stats", label: "Impact stats", section: "Content" },
  { href: "/admin/giving", label: "Giving options", section: "Content" },
  { href: "/admin/accounts", label: "Bank accounts", section: "Content" },
  { href: "/admin/donations", label: "Donations", section: "Inbox" },
  { href: "/admin/volunteers", label: "Volunteers", section: "Inbox" },
  { href: "/admin/messages", label: "Messages", section: "Inbox" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  const sections: { title: string; items: typeof NAV }[] = [];
  for (const item of NAV) {
    const last = sections[sections.length - 1];
    if (last && last.title === item.section) {
      last.items.push(item);
    } else {
      sections.push({ title: item.section, items: [item] });
    }
  }
  return (
    <div className="flex min-h-screen bg-[#f2f6f7] font-sans text-ink">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-ink-deep text-white">
        <Link href="/admin" className="flex items-center gap-3 px-5 pt-6 pb-2">
          <Image
            src="/brand/empower-humanity-logo-white.svg"
            alt="Empower Humanity"
            width={42}
            height={45}
            className="h-11 w-auto"
          />
          <span className="text-sm leading-tight font-semibold">
            Empower Humanity
            <span className="block text-xs font-normal text-mist">Admin</span>
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.title || "home"}>
              <span className="block px-3 pt-4 pb-1 text-[11px] font-semibold tracking-[0.12em] text-sage uppercase first:pt-0">
                {section.title || "Home"}
              </span>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-mist transition-colors hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/15 px-5 py-4">
          <p className="truncate text-xs text-mist">{session.email}</p>
          <form action={logoutAction} className="mt-2">
            <button
              type="submit"
              className="rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto max-w-[1100px]">{children}</div>
      </main>
    </div>
  );
}
