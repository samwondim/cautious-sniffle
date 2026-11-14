import Link from "next/link";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

import { deleteProjectAction } from "@/app/actions/admin";
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
import { db } from "@/db";
import { projects, sectors } from "@/db/schema";

export const metadata = { title: "Projects — Admin" };

const SORT_OPTIONS = [
  { value: "order", label: "Sort order" },
  { value: "title", label: "Title A–Z" },
  { value: "newest", label: "Newest first" },
];

const CONTENT_STATUSES = ["draft", "published"] as const;

type Row = {
  id: number;
  title: string;
  location: string;
  status: string;
  sortOrder: number;
  sectorName: string | null;
  createdAt: Date;
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

export default async function AdminProjectsPage({
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
      .select({
        id: projects.id,
        title: projects.title,
        location: projects.location,
        status: projects.status,
        sortOrder: projects.sortOrder,
        sectorName: sectors.name,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .leftJoin(sectors, eq(projects.sectorId, sectors.id))
      .where(
        and(
          statusFilter ? eq(projects.status, statusFilter) : undefined,
          term
            ? or(
                ilike(projects.title, `%${term}%`),
                ilike(projects.location, `%${term}%`),
                ilike(projects.summary, `%${term}%`),
              )
            : undefined,
        ),
      )
      .orderBy(
        ...(sort === "title"
          ? [asc(projects.title), asc(projects.id)]
          : sort === "newest"
            ? [desc(projects.createdAt), desc(projects.id)]
            : [asc(projects.sortOrder), asc(projects.id)]),
      ),
    db
      .select({ status: projects.status, count: sql<number>`count(*)::int` })
      .from(projects)
      .groupBy(projects.status),
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
        <FlashToast message="Project saved — live on the site now." />
      ) : null}
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

      <AdminTabs
        options={tabs}
        current={status}
        baseHref="/admin/projects"
        preserve={{ q, sort }}
      />
      <ListToolbar
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search projects, locations…"
      />
      <ListMeta
        count={rows.length}
        filtered={Boolean(term) || Boolean(statusFilter)}
        clearHref="/admin/projects"
      />

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        empty="No projects yet."
      />
    </div>
  );
}
