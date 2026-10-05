import Link from "next/link";
import { asc } from "drizzle-orm";

import { deleteStatAction } from "@/app/actions/admin";
import {
  AdminTable,
  EditLink,
  RowActions,
  StatusBadge,
  type AdminColumn,
} from "@/components/admin/table";
import { DeleteButton } from "@/components/admin/ui";
import { db } from "@/db";
import { impactStats, type ImpactStat } from "@/db/schema";

export const metadata = { title: "Impact stats — Admin" };

const COLUMNS: AdminColumn<ImpactStat>[] = [
  {
    header: "Value + label",
    mobile: "title",
    cell: (row) => (
      <>
        {row.value} {row.label}
      </>
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

export default async function AdminStatsPage() {
  const rows = await db
    .select()
    .from(impactStats)
    .orderBy(asc(impactStats.sortOrder), asc(impactStats.id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Impact stats</h1>
          <p className="mt-1 text-sm text-slate">
            The floating stat card on the hero. The first three published
            stats are shown.
          </p>
        </div>
        <Link
          href="/admin/stats/edit"
          className="btn-donate w-fit shrink-0 px-5 py-2.5 text-sm font-semibold"
        >
          New stat
        </Link>
      </div>

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        empty="No stats yet."
      />
    </div>
  );
}
