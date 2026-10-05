import Link from "next/link";
import { asc } from "drizzle-orm";

import { deleteAccountAction } from "@/app/actions/admin";
import {
  AdminTable,
  EditLink,
  RowActions,
  StatusBadge,
  type AdminColumn,
} from "@/components/admin/table";
import { DeleteButton } from "@/components/admin/ui";
import { bankAccounts, type BankAccount } from "@/db/schema";
import { db } from "@/db";

export const metadata = { title: "Bank accounts — Admin" };

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

export default async function AdminAccountsPage() {
  const rows = await db
    .select()
    .from(bankAccounts)
    .orderBy(asc(bankAccounts.sortOrder), asc(bankAccounts.id));

  return (
    <div className="flex flex-col gap-6">
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

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        empty="No bank accounts yet."
      />
    </div>
  );
}
