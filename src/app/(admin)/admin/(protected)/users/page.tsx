import { asc } from "drizzle-orm";

import { AdminTable, type AdminColumn } from "@/components/admin/table";
import { UserForm } from "@/components/admin/user-form";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Admins — Admin" };

// Never select `passwordHash`: the row type below has no such field, so it
// cannot reach the table or the client.
type AdminRow = {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const COLUMNS: AdminColumn<AdminRow>[] = [
  {
    header: "Name",
    mobile: "title",
    cell: (row) => <span className="font-medium text-ink">{row.name}</span>,
  },
  {
    header: "Email",
    cell: (row) => <span className="break-all text-slate">{row.email}</span>,
  },
  {
    header: "Added",
    cell: (row) => (
      <time dateTime={row.createdAt.toISOString()} className="text-slate">
        {dateFormat.format(row.createdAt)}
      </time>
    ),
  },
];

export default async function AdminUsersPage() {
  // Pages re-check the session themselves, as actions do.
  await requireAdmin();

  const rows: AdminRow[] = await db
    .select({
      id: admins.id,
      email: admins.email,
      name: admins.name,
      createdAt: admins.createdAt,
    })
    .from(admins)
    .orderBy(asc(admins.createdAt), asc(admins.id));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Admins</h1>
        <p className="mt-1 text-sm text-slate">
          Everyone who can sign in to this dashboard. Every admin has full
          access.
        </p>
      </div>

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        empty="No admins yet."
      />

      <section
        aria-labelledby="add-user-title"
        className="rounded-2xl border border-hairline bg-white p-6"
      >
        <h2 id="add-user-title" className="font-display text-xl text-ink">
          Add user
        </h2>
        <p className="mt-1 mb-5 text-sm text-slate">
          Creates a new admin account. Share the password with them securely;
          no email is sent.
        </p>
        <UserForm />
      </section>
    </div>
  );
}
