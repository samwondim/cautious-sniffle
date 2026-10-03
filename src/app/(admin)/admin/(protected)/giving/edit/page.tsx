import Link from "next/link";
import { eq } from "drizzle-orm";

import { upsertGivingAction } from "@/app/actions/admin";
import { AdminForm } from "@/components/admin/ui";
import { db } from "@/db";
import { givingOptions } from "@/db/schema";
import { ICON_OPTIONS } from "@/lib/admin";

export const metadata = { title: "Edit giving option — Admin" };

export default async function AdminGivingEditPage({
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
      .from(givingOptions)
      .where(eq(givingOptions.id, recordId))
      .limit(1);
    if (row) {
      values = {
        title: row.title,
        description: row.description,
        icon: row.icon,
        ctaLabel: row.ctaLabel,
        ctaHref: row.ctaHref,
        sortOrder: row.sortOrder,
        status: row.status,
      };
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/giving"
        className="w-fit text-sm font-semibold text-accent hover:opacity-70"
      >
        ← Back to giving options
      </Link>
      <h1 className="font-display text-3xl text-ink">
        {values ? "Edit option" : "New option"}
      </h1>
      <section className="rounded-2xl border border-hairline bg-white p-6">
        <AdminForm
          action={upsertGivingAction}
          recordId={values ? recordId : undefined}
          submitLabel={values ? "Save option" : "Create option"}
          values={values}
          fields={[
            { name: "title", label: "Title", type: "text" },
            { name: "description", label: "Description", type: "textarea" },
            { name: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
            { name: "ctaLabel", label: "Button label", type: "text" },
            { name: "ctaHref", label: "Button link", type: "text" },
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
