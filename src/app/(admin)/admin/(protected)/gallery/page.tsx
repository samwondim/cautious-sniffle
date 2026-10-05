import Link from "next/link";
import { asc } from "drizzle-orm";

import { deleteGalleryAction } from "@/app/actions/admin";
import {
  AdminTable,
  EditLink,
  RowActions,
  StatusBadge,
  type AdminColumn,
} from "@/components/admin/table";
import { DeleteButton } from "@/components/admin/ui";
import { db } from "@/db";
import { galleryImages, type GalleryImage } from "@/db/schema";

export const metadata = { title: "Gallery — Admin" };

const COLUMNS: AdminColumn<GalleryImage>[] = [
  { header: "Title", cell: (row) => row.title, mobile: "title" },
  {
    header: "Image",
    cell: (row) =>
      row.imageUrl ? (
        // Admin-supplied URL on an admin-only page: a plain <img> keeps this
        // off the image optimizer, which exists to serve public traffic.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.imageUrl}
          alt=""
          loading="lazy"
          className="h-10 w-16 rounded-md border border-hairline object-cover"
        />
      ) : (
        <span className="text-slate">— placeholder</span>
      ),
  },
  { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  {
    header: "Order",
    cell: (row) => <span className="text-slate">{row.sortOrder}</span>,
  },
  {
    header: "Actions",
    align: "right",
    mobile: "footer",
    cell: (row) => (
      <RowActions>
        <EditLink href={`/admin/gallery/edit?id=${row.id}`} />
        <DeleteButton
          id={row.id}
          action={deleteGalleryAction}
          label="gallery image"
        />
      </RowActions>
    ),
  },
];

export default async function AdminGalleryPage() {
  const rows = await db
    .select()
    .from(galleryImages)
    .orderBy(asc(galleryImages.sortOrder), asc(galleryImages.id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Gallery</h1>
          <p className="mt-1 text-sm text-slate">
            The “Moments from the field” grid on the homepage. Only published
            images appear on the site.
          </p>
        </div>
        <Link
          href="/admin/gallery/edit"
          className="btn-donate w-fit shrink-0 px-5 py-2.5 text-sm font-semibold"
        >
          New image
        </Link>
      </div>

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        empty="No gallery images yet."
      />
    </div>
  );
}
