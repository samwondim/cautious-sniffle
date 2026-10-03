import Link from "next/link";
import { asc, eq } from "drizzle-orm";

import { upsertProjectAction } from "@/app/actions/admin";
import { AdminForm } from "@/components/admin/ui";
import { db } from "@/db";
import { projects, sectors } from "@/db/schema";

export const metadata = { title: "Edit project — Admin" };

export default async function AdminProjectEditPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const recordId = id ? Number(id) : undefined;

  const allSectors = await db
    .select({ id: sectors.id, name: sectors.name })
    .from(sectors)
    .orderBy(asc(sectors.sortOrder), asc(sectors.id));

  let values: Record<string, string | number | null | undefined> | undefined;
  if (recordId && Number.isFinite(recordId)) {
    const [row] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, recordId))
      .limit(1);
    if (row) {
      values = {
        title: row.title,
        location: row.location,
        sectorId: row.sectorId === null ? "none" : row.sectorId,
        summary: row.summary,
        body: row.body,
        imageUrl: row.imageUrl,
        sortOrder: row.sortOrder,
        status: row.status,
      };
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/projects"
        className="w-fit text-sm font-semibold text-accent hover:opacity-70"
      >
        ← Back to projects
      </Link>
      <h1 className="font-display text-3xl text-ink">
        {values ? "Edit project" : "New project"}
      </h1>
      <section className="rounded-2xl border border-hairline bg-white p-6">
        <AdminForm
          action={upsertProjectAction}
          recordId={values ? recordId : undefined}
          submitLabel={values ? "Save project" : "Create project"}
          values={values}
          fields={[
            { name: "title", label: "Title", type: "text" },
            { name: "location", label: "Location", type: "text" },
            {
              name: "sectorId",
              label: "Sector",
              type: "select",
              options: [
                { value: "none", label: "No sector" },
                ...allSectors.map((s) => ({
                  value: String(s.id),
                  label: s.name,
                })),
              ],
            },
            { name: "summary", label: "Summary (card)", type: "textarea" },
            { name: "body", label: "Body (detail page)", type: "textarea", rows: 6 },
            {
              name: "imageUrl",
              label: "Image URL (blank = placeholder)",
              type: "text",
            },
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
