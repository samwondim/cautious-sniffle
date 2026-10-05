import Link from "next/link";
import { asc, eq } from "drizzle-orm";

import { deleteProjectAction } from "@/app/actions/admin";
import {
  AdminTable,
  EditLink,
  RowActions,
  StatusBadge,
  type AdminColumn,
} from "@/components/admin/table";
import { DeleteButton } from "@/components/admin/ui";
import { db } from "@/db";
import { projects, sectors } from "@/db/schema";

export const metadata = { title: "Projects — Admin" };

type Row = {
  id: number;
  title: string;
  location: string;
  status: string;
  sortOrder: number;
  sectorName: string | null;
};

const COLUMNS: AdminColumn<Row>[] = [
  {
    header: "Title",
    mobile: "title",
    cell: (row) => (
      <>
        {row.title} <span className="font-normal text-slate">— {row.location}</span>
      </>
    ),
  },
  {
    header: "Sector",
    cell: (row) => <span className="text-slate">{row.sectorName ?? "—"}</span>,
  },
  { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  {
    header: "Actions",
    align: "right",
    mobile: "footer",
    cell: (row) => (
      <RowActions>
        <EditLink href={`/admin/projects/edit?id=${row.id}`} />
        <DeleteButton id={row.id} action={deleteProjectAction} label="project" />
      </RowActions>
    ),
  },
];

export default async function AdminProjectsPage() {
  const rows = await db
    .select({
      id: projects.id,
      title: projects.title,
      location: projects.location,
      status: projects.status,
      sortOrder: projects.sortOrder,
      sectorName: sectors.name,
    })
    .from(projects)
    .leftJoin(sectors, eq(projects.sectorId, sectors.id))
    .orderBy(asc(projects.sortOrder), asc(projects.id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Projects</h1>
          <p className="mt-1 text-sm text-slate">
            Cards on “Our Work”. Only published projects appear on the site.
          </p>
        </div>
        <Link
          href="/admin/projects/edit"
          className="btn-donate w-fit shrink-0 px-5 py-2.5 text-sm font-semibold"
        >
          New project
        </Link>
      </div>

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        empty="No projects yet."
      />
    </div>
  );
}
