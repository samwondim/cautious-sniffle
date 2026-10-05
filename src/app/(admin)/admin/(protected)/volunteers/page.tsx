import { desc } from "drizzle-orm";

import { updateLeadStatusAction } from "@/app/actions/admin";
import {
  AdminTable,
  StatusForm,
  type AdminColumn,
} from "@/components/admin/table";
import { db } from "@/db";
import { volunteers, type Volunteer } from "@/db/schema";

export const metadata = { title: "Volunteers — Admin" };

const STATUSES = ["new", "in_progress", "archived"] as const;

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

export default async function AdminVolunteersPage() {
  const rows = await db
    .select()
    .from(volunteers)
    .orderBy(desc(volunteers.createdAt), desc(volunteers.id))
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Volunteers</h1>
        <p className="mt-1 text-sm text-slate">
          Sign-ups from the volunteer form. Latest 100 shown.
        </p>
      </div>

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
