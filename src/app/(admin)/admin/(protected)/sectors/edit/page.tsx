import Link from "next/link";
import { eq } from "drizzle-orm";

import { upsertSectorAction } from "@/app/actions/admin";
import { AdminForm } from "@/components/admin/ui";
import { db } from "@/db";
import { sectors } from "@/db/schema";
import { ICON_OPTIONS } from "@/lib/admin";

export const metadata = { title: "Edit sector — Admin" };

export default async function AdminSectorEditPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const recordId = id ? Number(id) : undefined;

  let values: Record<string, string | number | null | undefined> | undefined;
  if (recordId && Number.isFinite(recordId)) {
    const [row] = await db
      .select()
      .from(sectors)
      .where(eq(sectors.id, recordId))
      .limit(1);
    if (row) {
      values = {
        slug: row.slug,
        name: row.name,
        description: row.description,
        icon: row.icon,
        sortOrder: row.sortOrder,
        status: row.status,
      };
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/sectors"
        className="w-fit text-sm font-semibold text-accent hover:opacity-70"
      >
        ← Back to sectors
      </Link>
      <h1 className="font-display text-3xl text-ink">
        {values ? "Edit sector" : "New sector"}
      </h1>
      <section className="rounded-2xl border border-hairline bg-white p-6">
        <AdminForm
          action={upsertSectorAction}
          recordId={values ? recordId : undefined}
          submitLabel={values ? "Save sector" : "Create sector"}
          values={values}
          fields={[
            { name: "slug", label: "Slug", type: "text", hint: "Lowercase letters, numbers, dashes." },
            { name: "name", label: "Name", type: "text" },
            { name: "description", label: "Description", type: "textarea" },
            { name: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
            { name: "sortOrder", label: "Sort order", type: "number" },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: ["draft", "published"],
            },
          ]}
        />
      </section>
    </div>
  );
}
