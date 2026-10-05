import Link from "next/link";
import { eq } from "drizzle-orm";

import { upsertGalleryAction } from "@/app/actions/admin";
import { AdminForm } from "@/components/admin/ui";
import { db } from "@/db";
import { galleryImages } from "@/db/schema";

export const metadata = { title: "Edit gallery image — Admin" };

export default async function AdminGalleryEditPage({
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
      .from(galleryImages)
      .where(eq(galleryImages.id, recordId))
      .limit(1);
    if (row) {
      values = {
        title: row.title,
        caption: row.caption,
        imageUrl: row.imageUrl,
        sortOrder: row.sortOrder,
        status: row.status,
      };
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/gallery"
        className="w-fit text-sm font-semibold text-accent hover:opacity-70"
      >
        ← Back to gallery
      </Link>
      <h1 className="font-display text-3xl text-ink">
        {values ? "Edit gallery image" : "New gallery image"}
      </h1>
      <section className="rounded-2xl border border-hairline bg-white p-4 sm:p-6">
        <AdminForm
          action={upsertGalleryAction}
          recordId={values ? recordId : undefined}
          submitLabel={values ? "Save image" : "Create image"}
          values={values}
          fields={[
            { name: "title", label: "Title", type: "text" },
            { name: "caption", label: "Caption", type: "textarea" },
            {
              name: "imageUrl",
              label: "Image",
              type: "media",
              hint: "Blank shows a placeholder photo. External URLs still work.",
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
