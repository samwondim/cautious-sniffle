import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/auth";
import { getAccent } from "@/lib/content";

/** Admin pages read live CMS content, so they must never be prerendered. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  // The public site themes `--accent` from the `theme` table; without the same
  // inline property here every `text-accent` in the admin area silently fell
  // back to the `:root` teal. Mirrors `src/app/(site)/layout.tsx`.
  const accent = await getAccent();

  return (
    <div
      style={{ "--accent": accent } as React.CSSProperties}
      className="flex min-h-screen flex-col bg-[#f2f6f7] font-sans text-ink md:flex-row"
    >
      <AdminSidebar email={session.email} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-8">
        <div className="mx-auto max-w-[1100px]">{children}</div>
      </main>
    </div>
  );
}
