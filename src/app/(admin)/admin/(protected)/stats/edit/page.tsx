import Link from "next/link";
import { eq } from "drizzle-orm";

import { upsertStatAction } from "@/app/actions/admin";
import { AdminForm } from "@/components/admin/ui";
import { db } from "@/db";
import { impactStats } from "@/db/schema";
import { ICON_OPTIONS } from "@/lib/admin";

export const metadata = { title: "Edit stat — Admin" };

export default async function AdminStatEditPage({
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
      .from(impactStats)
      .where(eq(impactStats.id, recordId))
      .limit(1);
    if (row) {
      values = {
        value: row.value,
        label: row.label,
        detail: row.detail,
        icon: row.icon,
        sortOrder: row.sortOrder,
        status: row.status,
      };
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/stats"
        className="w-fit text-sm font-semibold text-accent hover:opacity-70"
      >
        ← Back to stats
      </Link>
      <h1 className="font-display text-3xl text-ink">
        {values ? "Edit stat" : "New stat"}
      </h1>
      <section className="rounded-2xl border border-hairline bg-white p-6">
        <AdminForm
          action={upsertStatAction}
          recordId={values ? recordId : undefined}
          submitLabel={values ? "Save stat" : "Create stat"}
          values={values}
          fields={[
            { name: "value", label: "Value (e.g. 12,400+)", type: "text" },
            { name: "label", label: "Label", type: "text" },
            { name: "detail", label: "Detail", type: "text" },
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
