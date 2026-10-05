import Link from "next/link";
import { asc } from "drizzle-orm";

import { deleteGivingAction } from "@/app/actions/admin";
import {
  AdminTable,
  EditLink,
  RowActions,
  StatusBadge,
  type AdminColumn,
} from "@/components/admin/table";
import { DeleteButton } from "@/components/admin/ui";
import { db } from "@/db";
import { givingOptions, type GivingOption } from "@/db/schema";

export const metadata = { title: "Giving options — Admin" };

const COLUMNS: AdminColumn<GivingOption>[] = [
  { header: "Title", cell: (row) => row.title, mobile: "title" },
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

export default async function AdminGivingPage() {
  const rows = await db
    .select()
    .from(givingOptions)
    .orderBy(asc(givingOptions.sortOrder), asc(givingOptions.id));

  return (
    <div className="flex flex-col gap-6">
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

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        empty="No giving options yet."
      />
    </div>
  );
}
