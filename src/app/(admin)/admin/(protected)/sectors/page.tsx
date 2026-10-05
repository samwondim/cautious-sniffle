import Link from "next/link";
import { asc } from "drizzle-orm";

import { deleteSectorAction } from "@/app/actions/admin";
import {
  AdminTable,
  EditLink,
  RowActions,
  StatusBadge,
  type AdminColumn,
} from "@/components/admin/table";
import { DeleteButton } from "@/components/admin/ui";
import { db } from "@/db";
import { sectors, type Sector } from "@/db/schema";

export const metadata = { title: "Sectors — Admin" };

const COLUMNS: AdminColumn<Sector>[] = [
  { header: "Name", cell: (row) => row.name, mobile: "title" },
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

export default async function AdminSectorsPage() {
  const rows = await db
    .select()
    .from(sectors)
    .orderBy(asc(sectors.sortOrder), asc(sectors.id));

  return (
    <div className="flex flex-col gap-6">
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

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        empty="No sectors yet."
      />
    </div>
  );
}
