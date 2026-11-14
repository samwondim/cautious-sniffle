import Link from "next/link";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";

import { deleteSectorAction } from "@/app/actions/admin";
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
import { Icon, toIconName } from "@/components/icons";
import { db } from "@/db";
import { sectors, type Sector } from "@/db/schema";

export const metadata = { title: "Sectors — Admin" };

const SORT_OPTIONS = [
  { value: "order", label: "Sort order" },
  { value: "name", label: "Name A–Z" },
];

const CONTENT_STATUSES = ["draft", "published"] as const;

const COLUMNS: AdminColumn<Sector>[] = [
  {
    header: "Name",
    mobile: "title",
    cell: (row) => (
      <span className="flex items-center gap-2">
        <Icon
          name={toIconName(row.icon)}
          size={18}
          className="shrink-0 text-accent"
        />
        {row.name}
      </span>
    ),
  },
  { header: "Slug", cell: (row) => <span className="text-slate">{row.slug}</span> },
  { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  { header: "Order", cell: (row) => <span className="text-slate">{row.sortOrder}</span> },
  {
    header: "Actions",
    align: "right",
    mobile: "footer",
    cell: (row) => (
      <RowActions>
        <EditLink href={`/admin/sectors/edit?id=${row.id}`} />
        <DeleteButton id={row.id} action={deleteSectorAction} label="sector" />
      </RowActions>
    ),
  },
];

export default async function AdminSectorsPage({
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
      .from(sectors)
      .where(
        and(
          statusFilter ? eq(sectors.status, statusFilter) : undefined,
          term
            ? or(
                ilike(sectors.name, `%${term}%`),
                ilike(sectors.slug, `%${term}%`),
                ilike(sectors.description, `%${term}%`),
              )
            : undefined,
        ),
      )
      .orderBy(
        ...(sort === "name"
          ? [asc(sectors.name), asc(sectors.id)]
          : [asc(sectors.sortOrder), asc(sectors.id)]),
      ),
    db
      .select({ status: sectors.status, count: sql<number>`count(*)::int` })
      .from(sectors)
      .groupBy(sectors.status),
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
        <FlashToast message="Sector saved — live on the site now." />
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Sectors</h1>
          <p className="mt-1 text-sm text-slate">
            The four cards on “What We Do”. Order is by sort order.
          </p>
        </div>
        <Link
          href="/admin/sectors/edit"
          className="btn-donate w-fit shrink-0 px-5 py-2.5 text-sm font-semibold"
        >
          New sector
        </Link>
      </div>

      <AdminTabs
        options={tabs}
        current={status}
        baseHref="/admin/sectors"
        preserve={{ q, sort }}
      />
      <ListToolbar
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search sectors…"
      />
      <ListMeta
        count={rows.length}
        filtered={Boolean(term) || Boolean(statusFilter)}
        clearHref="/admin/sectors"
      />

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        empty="No sectors yet."
      />
    </div>
  );
}
