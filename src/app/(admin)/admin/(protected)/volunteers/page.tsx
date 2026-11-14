import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

import { updateLeadStatusAction } from "@/app/actions/admin";
import { ListMeta } from "@/components/admin/list-meta";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { StatusForm } from "@/components/admin/status-form";
import { AdminTable, type AdminColumn } from "@/components/admin/table";
import { AdminTabs } from "@/components/admin/tabs";
import { db } from "@/db";
import { volunteers, type LeadStatus, type Volunteer } from "@/db/schema";

export const metadata = { title: "Volunteers — Admin" };

const STATUSES: readonly LeadStatus[] = ["new", "in_progress", "archived"];
const DEFAULT_STATUS: LeadStatus = "new";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
];

const COLUMNS: AdminColumn<Volunteer>[] = [
  {
    header: "Name",
    mobile: "title",
    cell: (row) => (
      <>
        <span className="font-medium text-ink">{row.name}</span>
        <span className="block text-xs font-normal break-all text-slate">
          {row.email}
        </span>
        {row.message ? (
          <span className="mt-1 block max-w-[320px] text-xs font-normal text-slate">
            {row.message}
          </span>
        ) : null}
      </>
    ),
  },
  {
    header: "Interest",
    cell: (row) => <span className="text-slate">{row.interest}</span>,
  },
  {
    header: "Status",
    mobile: "footer",
    cell: (row) => (
      <StatusForm
        action={updateLeadStatusAction}
        id={row.id}
        kind="volunteer"
        status={row.status}
        options={STATUSES}
      />
    ),
  },
];

function orderFor(sort: string | undefined) {
  switch (sort) {
    case "oldest":
      return [asc(volunteers.createdAt), asc(volunteers.id)];
    case "name":
      return [asc(volunteers.name), asc(volunteers.id)];
    default:
      return [desc(volunteers.createdAt), desc(volunteers.id)];
  }
}

export default async function AdminVolunteersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; status?: string }>;
}) {
  const { q, sort, status } = await searchParams;
  const term = q?.trim();

  const statusParam = status ?? DEFAULT_STATUS;
  const statusFilter: LeadStatus | undefined =
    statusParam === "all"
      ? undefined
      : STATUSES.includes(statusParam as LeadStatus)
        ? (statusParam as LeadStatus)
        : DEFAULT_STATUS;

  const [rows, counts] = await Promise.all([
    db
      .select()
      .from(volunteers)
      .where(
        and(
          statusFilter ? eq(volunteers.status, statusFilter) : undefined,
          term
            ? or(
                ilike(volunteers.name, `%${term}%`),
                ilike(volunteers.email, `%${term}%`),
                ilike(volunteers.message, `%${term}%`),
              )
            : undefined,
        ),
      )
      .orderBy(...orderFor(sort))
      .limit(100),
    db
      .select({ status: volunteers.status, count: sql<number>`count(*)::int` })
      .from(volunteers)
      .groupBy(volunteers.status),
  ]);

  const countBy = new Map(counts.map((c) => [c.status, c.count]));
  const total = counts.reduce((sum, c) => sum + c.count, 0);
  const tabs = [
    { value: "new", label: "New", count: countBy.get("new") ?? 0 },
    { value: "in_progress", label: "In progress", count: countBy.get("in_progress") ?? 0 },
    { value: "archived", label: "Archived", count: countBy.get("archived") ?? 0 },
    { value: "all", label: "All", count: total },
  ];

  const filtered =
    Boolean(term) || (statusParam !== DEFAULT_STATUS && statusParam !== "all");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Volunteers</h1>
        <p className="mt-1 text-sm text-slate">
          Sign-ups from the volunteer form. Latest 100 shown.
        </p>
      </div>

      <AdminTabs
        options={tabs}
        current={status}
        baseHref="/admin/volunteers"
        preserve={{ q, sort }}
      />
      <ListToolbar
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search names, emails, messages…"
      />
      <ListMeta
        count={rows.length}
        filtered={filtered}
        clearHref="/admin/volunteers"
      />

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        rowAlign="top"
        empty="No volunteers yet."
      />
    </div>
  );
}
