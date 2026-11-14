import Link from "next/link";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";

import { deleteGalleryAction } from "@/app/actions/admin";
import { FlashToast } from "@/components/admin/flash-toast";
import { ListMeta } from "@/components/admin/list-meta";
import { ListToolbar } from "@/components/admin/list-toolbar";
import {
  AdminTable,
  EditLink,
  RowActions,
  StatusBadge,
  type AdminColumn,
} from "@/components/admin/table";
import { AdminTabs } from "@/components/admin/tabs";
import { DeleteButton } from "@/components/admin/ui";
import { db } from "@/db";
import { galleryImages, type GalleryImage } from "@/db/schema";

export const metadata = { title: "Gallery — Admin" };

const SORT_OPTIONS = [
  { value: "order", label: "Sort order" },
  { value: "title", label: "Title A–Z" },
];

const CONTENT_STATUSES = ["draft", "published"] as const;

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

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    status?: string;
    saved?: string;
  }>;
}) {
  const { q, sort, status, saved } = await searchParams;
  const term = q?.trim();
  const statusFilter =
    status && (CONTENT_STATUSES as readonly string[]).includes(status)
      ? (status as (typeof CONTENT_STATUSES)[number])
      : undefined;

  const [rows, counts] = await Promise.all([
    db
      .select()
      .from(galleryImages)
      .where(
        and(
          statusFilter ? eq(galleryImages.status, statusFilter) : undefined,
          term
            ? or(
                ilike(galleryImages.title, `%${term}%`),
                ilike(galleryImages.caption, `%${term}%`),
              )
            : undefined,
        ),
      )
      .orderBy(
        ...(sort === "title"
          ? [asc(galleryImages.title), asc(galleryImages.id)]
          : [asc(galleryImages.sortOrder), asc(galleryImages.id)]),
      ),
    db
      .select({
        status: galleryImages.status,
        count: sql<number>`count(*)::int`,
      })
      .from(galleryImages)
      .groupBy(galleryImages.status),
  ]);

  const countBy = new Map(counts.map((row) => [row.status, row.count]));
  const total = counts.reduce((sum, row) => sum + row.count, 0);
  const tabs = [
    { value: "all", label: "All", count: total },
    { value: "draft", label: "Draft", count: countBy.get("draft") ?? 0 },
    {
      value: "published",
      label: "Published",
      count: countBy.get("published") ?? 0,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {saved ? (
        <FlashToast message="Gallery image saved — live on the site now." />
      ) : null}
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

      <AdminTabs
        options={tabs}
        current={status}
        baseHref="/admin/gallery"
        preserve={{ q, sort }}
      />
      <ListToolbar
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search gallery images…"
      />
      <ListMeta
        count={rows.length}
        filtered={Boolean(term) || Boolean(statusFilter)}
        clearHref="/admin/gallery"
      />

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        empty="No gallery images yet."
      />
    </div>
  );
}
