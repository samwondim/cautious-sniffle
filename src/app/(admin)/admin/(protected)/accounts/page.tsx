import Link from "next/link";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";

import { deleteAccountAction } from "@/app/actions/admin";
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
import { bankAccounts, type BankAccount } from "@/db/schema";
import { db } from "@/db";

export const metadata = { title: "Bank accounts — Admin" };

const SORT_OPTIONS = [
  { value: "order", label: "Sort order" },
  { value: "bank", label: "Bank A–Z" },
];

const CONTENT_STATUSES = ["draft", "published"] as const;

const COLUMNS: AdminColumn<BankAccount>[] = [
  {
    header: "Bank",
    mobile: "title",
    cell: (row) => (
      <>
        {row.bankName}{" "}
        <span className="font-normal text-slate">· {row.currency}</span>
      </>
    ),
  },
  { header: "Scope", cell: (row) => <span className="text-slate">{row.scope}</span> },
  { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  {
    header: "Actions",
    align: "right",
    mobile: "footer",
    cell: (row) => (
      <RowActions>
        <EditLink href={`/admin/accounts/edit?id=${row.id}`} />
        <DeleteButton
          id={row.id}
          action={deleteAccountAction}
          label="bank account"
        />
      </RowActions>
    ),
  },
];

export default async function AdminAccountsPage({
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
      .from(bankAccounts)
      .where(
        and(
          statusFilter ? eq(bankAccounts.status, statusFilter) : undefined,
          term
            ? or(
                ilike(bankAccounts.bankName, `%${term}%`),
                ilike(bankAccounts.accountName, `%${term}%`),
                ilike(bankAccounts.accountNumber, `%${term}%`),
                ilike(bankAccounts.branch, `%${term}%`),
                ilike(bankAccounts.note, `%${term}%`),
              )
            : undefined,
        ),
      )
      .orderBy(
        ...(sort === "bank"
          ? [asc(bankAccounts.bankName), asc(bankAccounts.id)]
          : [asc(bankAccounts.sortOrder), asc(bankAccounts.id)]),
      ),
    db
      .select({
        status: bankAccounts.status,
        count: sql<number>`count(*)::int`,
      })
      .from(bankAccounts)
      .groupBy(bankAccounts.status),
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
        <FlashToast message="Bank account saved — live on the site now." />
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Bank accounts</h1>
          <p className="mt-1 text-sm text-slate">
            Transfer details on the donate page. Publish only verified
            numbers — the placeholder notice covers drafts.
          </p>
        </div>
        <Link
          href="/admin/accounts/edit"
          className="btn-donate w-fit shrink-0 px-5 py-2.5 text-sm font-semibold"
        >
          New account
        </Link>
      </div>

      <AdminTabs
        options={tabs}
        current={status}
        baseHref="/admin/accounts"
        preserve={{ q, sort }}
      />
      <ListToolbar
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search banks, account numbers…"
      />
      <ListMeta
        count={rows.length}
        filtered={Boolean(term) || Boolean(statusFilter)}
        clearHref="/admin/accounts"
      />

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        empty="No bank accounts yet."
      />
    </div>
  );
}
