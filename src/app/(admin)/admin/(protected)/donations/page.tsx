import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

import { updateDonationStatusAction } from "@/app/actions/admin";
import { ListMeta } from "@/components/admin/list-meta";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { StatusForm } from "@/components/admin/status-form";
import { AdminTable, type AdminColumn } from "@/components/admin/table";
import { AdminTabs } from "@/components/admin/tabs";
import { db } from "@/db";
import { donations, type Donation, type DonationStatus } from "@/db/schema";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Donations — Admin" };

const STATUSES: readonly DonationStatus[] = [
  "pending",
  "completed",
  "refunded",
  "failed",
];
const DEFAULT_STATUS: DonationStatus = "pending";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount", label: "Largest amount" },
  { value: "name", label: "Donor A–Z" },
];

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Addis_Ababa",
});

const COLUMNS: AdminColumn<Donation>[] = [
  {
    header: "Donor",
    mobile: "title",
    cell: (row) => (
      <>
        <span className="font-medium text-ink">{row.donorName}</span>
        <span className="block text-xs font-normal break-all text-slate">
          {row.donorEmail}
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
    header: "Amount",
    cell: (row) => (
      <span className="whitespace-nowrap text-ink">
        {formatMoney(row.amountCents, row.currency)}
      </span>
    ),
  },
  {
    header: "Frequency",
    cell: (row) => (
      <span className="text-slate">
        {row.frequency === "monthly" ? "Monthly" : "One-off"}
      </span>
    ),
  },
  {
    // When the donor told us — the date to look for on the bank statement.
    header: "Received",
    cell: (row) => (
      <time
        dateTime={row.createdAt.toISOString()}
        className="whitespace-nowrap text-slate"
      >
        {DATE.format(row.createdAt)}
      </time>
    ),
  },
  {
    header: "Status",
    mobile: "footer",
    cell: (row) => (
      <StatusForm
        action={updateDonationStatusAction}
        id={row.id}
        status={row.status}
        options={STATUSES}
      />
    ),
  },
];

function orderFor(sort: string | undefined) {
  switch (sort) {
    case "oldest":
      return [asc(donations.createdAt), asc(donations.id)];
    case "amount":
      return [desc(donations.amountCents), desc(donations.id)];
    case "name":
      return [asc(donations.donorName), asc(donations.id)];
    default:
      return [desc(donations.createdAt), desc(donations.id)];
  }
}

export default async function AdminDonationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; status?: string }>;
}) {
  const { q, sort, status } = await searchParams;
  const term = q?.trim();

  const statusParam = status ?? DEFAULT_STATUS;
  const statusFilter: DonationStatus | undefined =
    statusParam === "all"
      ? undefined
      : STATUSES.includes(statusParam as DonationStatus)
        ? (statusParam as DonationStatus)
        : DEFAULT_STATUS;

  const [rows, counts] = await Promise.all([
    db
      .select()
      .from(donations)
      .where(
        and(
          statusFilter ? eq(donations.status, statusFilter) : undefined,
          term
            ? or(
                ilike(donations.donorName, `%${term}%`),
                ilike(donations.donorEmail, `%${term}%`),
                ilike(donations.message, `%${term}%`),
              )
            : undefined,
        ),
      )
      .orderBy(...orderFor(sort))
      .limit(100),
    db
      .select({ status: donations.status, count: sql<number>`count(*)::int` })
      .from(donations)
      .groupBy(donations.status),
  ]);

  const countBy = new Map(counts.map((c) => [c.status, c.count]));
  const total = counts.reduce((sum, c) => sum + c.count, 0);
  const tabs = [
    { value: "pending", label: "Pending", count: countBy.get("pending") ?? 0 },
    { value: "completed", label: "Completed", count: countBy.get("completed") ?? 0 },
    { value: "refunded", label: "Refunded", count: countBy.get("refunded") ?? 0 },
    { value: "failed", label: "Failed", count: countBy.get("failed") ?? 0 },
    { value: "all", label: "All", count: total },
  ];

  const filtered =
    Boolean(term) || (statusParam !== DEFAULT_STATUS && statusParam !== "all");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Donations</h1>
        <p className="mt-1 text-sm text-slate">
          Transfers donors have told us about on the Donate page. Each one
          arrives as <strong className="font-semibold text-ink">Pending</strong>:
          mark it Completed once the money shows on the bank statement, and the
          Overview total updates. Latest 100 shown.
        </p>
      </div>

      <AdminTabs
        options={tabs}
        current={status}
        baseHref="/admin/donations"
        preserve={{ q, sort }}
      />
      <ListToolbar
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search donors, emails, notes…"
      />
      <ListMeta
        count={rows.length}
        filtered={filtered}
        clearHref="/admin/donations"
      />

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        rowAlign="top"
        empty="No donations yet."
      />
    </div>
  );
}
