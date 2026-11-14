import Link from "next/link";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";

import { deleteStatAction } from "@/app/actions/admin";
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
import { impactStats, type ImpactStat } from "@/db/schema";

export const metadata = { title: "Impact stats — Admin" };

const SORT_OPTIONS = [
  { value: "order", label: "Sort order" },
  { value: "label", label: "Label A–Z" },
];

const CONTENT_STATUSES = ["draft", "published"] as const;

const COLUMNS: AdminColumn<ImpactStat>[] = [
  {
    header: "Value + label",
    mobile: "title",
    cell: (row) => (
      <span className="flex items-center gap-2">
        <Icon
          name={toIconName(row.icon)}
          size={18}
          className="shrink-0 text-accent"
        />
        <span>
          {row.value} {row.label}
        </span>
      </span>
    ),
  },
  { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  {
    header: "Actions",
    align: "right",
    mobile: "footer",
    cell: (row) => (
      <RowActions>
        <EditLink href={`/admin/stats/edit?id=${row.id}`} />
        <DeleteButton id={row.id} action={deleteStatAction} label="stat" />
      </RowActions>
    ),
  },
];

export default async function AdminStatsPage({
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
      .from(impactStats)
      .where(
        and(
          statusFilter ? eq(impactStats.status, statusFilter) : undefined,
          term
            ? or(
                ilike(impactStats.value, `%${term}%`),
                ilike(impactStats.label, `%${term}%`),
                ilike(impactStats.detail, `%${term}%`),
              )
            : undefined,
        ),
      )
      .orderBy(
        ...(sort === "label"
          ? [asc(impactStats.label), asc(impactStats.id)]
          : [asc(impactStats.sortOrder), asc(impactStats.id)]),
      ),
    db
      .select({ status: impactStats.status, count: sql<number>`count(*)::int` })
      .from(impactStats)
      .groupBy(impactStats.status),
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
        <FlashToast message="Impact stat saved — live on the site now." />
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Impact stats</h1>
          <p className="mt-1 text-sm text-slate">
            The impact figures along the bottom of the home page hero. The
            first three published stats are shown.
          </p>
        </div>
        <Link
          href="/admin/stats/edit"
          className="btn-donate w-fit shrink-0 px-5 py-2.5 text-sm font-semibold"
        >
          New stat
        </Link>
      </div>

      <AdminTabs
        options={tabs}
        current={status}
        baseHref="/admin/stats"
        preserve={{ q, sort }}
      />
      <ListToolbar
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search stats…"
      />
      <ListMeta
        count={rows.length}
        filtered={Boolean(term) || Boolean(statusFilter)}
        clearHref="/admin/stats"
      />

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        empty="No stats yet."
      />
    </div>
  );
}
