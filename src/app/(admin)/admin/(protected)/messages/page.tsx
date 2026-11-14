import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

import { updateLeadStatusAction } from "@/app/actions/admin";
import { ListMeta } from "@/components/admin/list-meta";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { StatusForm } from "@/components/admin/status-form";
import { AdminTable, type AdminColumn } from "@/components/admin/table";
import { AdminTabs } from "@/components/admin/tabs";
import { db } from "@/db";
import { messages, type LeadStatus, type Message } from "@/db/schema";

export const metadata = { title: "Messages — Admin" };

const STATUSES: readonly LeadStatus[] = ["new", "in_progress", "archived"];
const DEFAULT_STATUS: LeadStatus = "new";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "sender", label: "Sender A–Z" },
  { value: "subject", label: "Subject A–Z" },
];

const COLUMNS: AdminColumn<Message>[] = [
  {
    header: "From",
    mobile: "title",
    cell: (row) => (
      <>
        <span className="font-medium text-ink">{row.name}</span>
        <span className="block text-xs font-normal break-all text-slate">
          {row.email}
        </span>
      </>
    ),
  },
  {
    header: "Subject",
    cell: (row) => (
      <>
        <span className="font-medium text-ink">{row.subject}</span>
        <span className="mt-1 block max-w-[360px] text-xs whitespace-pre-wrap text-slate">
          {row.body}
        </span>
      </>
    ),
  },
  {
    header: "Status",
    mobile: "footer",
    cell: (row) => (
      <StatusForm
        action={updateLeadStatusAction}
        id={row.id}
        kind="message"
        status={row.status}
        options={STATUSES}
      />
    ),
  },
];

function orderFor(sort: string | undefined) {
  switch (sort) {
    case "oldest":
      return [asc(messages.createdAt), asc(messages.id)];
    case "sender":
      return [asc(messages.name), asc(messages.id)];
    case "subject":
      return [asc(messages.subject), asc(messages.id)];
    default:
      return [desc(messages.createdAt), desc(messages.id)];
  }
}

export default async function AdminMessagesPage({
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
      .from(messages)
      .where(
        and(
          statusFilter ? eq(messages.status, statusFilter) : undefined,
          term
            ? or(
                ilike(messages.name, `%${term}%`),
                ilike(messages.email, `%${term}%`),
                ilike(messages.subject, `%${term}%`),
                ilike(messages.body, `%${term}%`),
              )
            : undefined,
        ),
      )
      .orderBy(...orderFor(sort))
      .limit(100),
    db
      .select({ status: messages.status, count: sql<number>`count(*)::int` })
      .from(messages)
      .groupBy(messages.status),
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
        <h1 className="font-display text-3xl text-ink">Messages</h1>
        <p className="mt-1 text-sm text-slate">
          Contact form submissions. Latest 100 shown.
        </p>
      </div>

      <AdminTabs
        options={tabs}
        current={status}
        baseHref="/admin/messages"
        preserve={{ q, sort }}
      />
      <ListToolbar
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search senders, subjects, bodies…"
      />
      <ListMeta
        count={rows.length}
        filtered={filtered}
        clearHref="/admin/messages"
      />

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        rowAlign="top"
        empty="No messages yet."
      />
    </div>
  );
}
