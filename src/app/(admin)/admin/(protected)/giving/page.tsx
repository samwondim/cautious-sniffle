import Link from "next/link";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";

import { deleteGivingAction } from "@/app/actions/admin";
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
import { givingOptions, type GivingOption } from "@/db/schema";

export const metadata = { title: "Giving options — Admin" };

const SORT_OPTIONS = [
  { value: "order", label: "Sort order" },
  { value: "title", label: "Title A–Z" },
];

const CONTENT_STATUSES = ["draft", "published"] as const;

const COLUMNS: AdminColumn<GivingOption>[] = [
  {
    header: "Title",
    cell: (row) => (
      <span className="flex items-center gap-2">
        <Icon
          name={toIconName(row.icon)}
          size={18}
          className="shrink-0 text-accent"
        />
        {row.title}
      </span>
    ),
    mobile: "title",
  },
  { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  {
    header: "Actions",
    align: "right",
    mobile: "footer",
    cell: (row) => (
      <RowActions>
        <EditLink href={`/admin/giving/edit?id=${row.id}`} />
        <DeleteButton
          id={row.id}
          action={deleteGivingAction}
          label="giving option"
        />
      </RowActions>
    ),
  },
];

export default async function AdminGivingPage({
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
      .from(givingOptions)
      .where(
        and(
          statusFilter ? eq(givingOptions.status, statusFilter) : undefined,
          term
            ? or(
                ilike(givingOptions.title, `%${term}%`),
                ilike(givingOptions.description, `%${term}%`),
              )
            : undefined,
        ),
      )
      .orderBy(
        ...(sort === "title"
          ? [asc(givingOptions.title), asc(givingOptions.id)]
          : [asc(givingOptions.sortOrder), asc(givingOptions.id)]),
      ),
    db
      .select({
        status: givingOptions.status,
        count: sql<number>`count(*)::int`,
      })
      .from(givingOptions)
      .groupBy(givingOptions.status),
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
        <FlashToast message="Giving option saved — live on the site now." />
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Giving options</h1>
          <p className="mt-1 text-sm text-slate">
            The “Ways to Give” list on the homepage and donate page.
          </p>
        </div>
        <Link
          href="/admin/giving/edit"
          className="btn-donate w-fit shrink-0 px-5 py-2.5 text-sm font-semibold"
        >
          New option
        </Link>
      </div>

      <AdminTabs
        options={tabs}
        current={status}
        baseHref="/admin/giving"
        preserve={{ q, sort }}
      />
      <ListToolbar
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search giving options…"
      />
      <ListMeta
        count={rows.length}
        filtered={Boolean(term) || Boolean(statusFilter)}
        clearHref="/admin/giving"
      />

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        empty="No giving options yet."
      />
    </div>
  );
}
