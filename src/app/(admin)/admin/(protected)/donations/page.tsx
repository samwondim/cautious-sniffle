import { desc } from "drizzle-orm";

import { updateDonationStatusAction } from "@/app/actions/admin";
import {
  AdminTable,
  StatusForm,
  type AdminColumn,
} from "@/components/admin/table";
import { db } from "@/db";
import { donations, type Donation } from "@/db/schema";

export const metadata = { title: "Donations — Admin" };

const STATUSES = ["pending", "completed", "refunded", "failed"] as const;

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
        {(row.amountCents / 100).toFixed(2)} {row.currency}
      </span>
    ),
  },
  {
    header: "Frequency",
    cell: (row) => <span className="text-slate">{row.frequency}</span>,
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

export default async function AdminDonationsPage() {
  const rows = await db
    .select()
    .from(donations)
    .orderBy(desc(donations.createdAt), desc(donations.id))
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Donations</h1>
        <p className="mt-1 text-sm text-slate">
          Gifts recorded through the public form. Latest 100 shown.
        </p>
      </div>

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
