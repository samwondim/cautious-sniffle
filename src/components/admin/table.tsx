import Link from "next/link";

/**
 * The pieces every admin list page is built from.
 *
 * `AdminTable` renders one column spec two ways: the table the dashboard has
 * always had at `md` and up, and a stack of cards below it. The table markup
 * is carried over verbatim so the desktop view is unchanged; the cards exist
 * because the table's wrapper is `overflow-hidden`, which on a phone clipped
 * the trailing columns — including Edit and Delete — rather than scrolling to
 * them, leaving those controls unreachable.
 *
 * Driving it from a spec rather than converting eight pages by hand follows
 * the same approach as `AdminForm` and its `FieldDef[]`, and keeps the
 * responsive behaviour in one place. It is a Server Component: `cell` is a
 * render function, which cannot be passed across the boundary to a Client one.
 */

export type AdminColumn<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Right-align at `md` and up — used by the trailing Actions column. */
  align?: "right";
  /**
   * Placement in the small-screen card:
   * - `"title"` — the card heading (defaults to the first column)
   * - `"footer"` — below a divider, for the row's controls
   * - `"hidden"` — left out of the card
   * - omitted — a label/value row
   */
  mobile?: "title" | "footer" | "hidden";
};

export function AdminTable<T>({
  rows,
  rowKey,
  columns,
  empty,
  rowAlign,
}: {
  rows: readonly T[];
  rowKey: (row: T) => React.Key;
  columns: AdminColumn<T>[];
  /** Message shown when there is nothing to list. */
  empty: string;
  /**
   * Top-align cells instead of centring them. Use where a row's cells differ
   * a lot in height — the inbox pages, whose first column stacks a name, an
   * address and a message body.
   */
  rowAlign?: "top";
}) {
  const titleColumn =
    columns.find((column) => column.mobile === "title") ?? columns[0];
  const footerColumns = columns.filter((column) => column.mobile === "footer");
  const detailColumns = columns.filter(
    (column) =>
      column !== titleColumn &&
      column.mobile !== "footer" &&
      column.mobile !== "hidden",
  );

  return (
    <>
      {/* `md` and up: the original table. */}
      <div className="hidden overflow-hidden rounded-2xl border border-hairline bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs tracking-wide text-slate uppercase">
              {columns.map((column) => (
                <th
                  key={column.header}
                  className={`px-5 py-3 font-semibold ${
                    column.align === "right" ? "text-right" : ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-6 text-slate">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={`border-b border-hairline last:border-0 ${
                    rowAlign === "top" ? "align-top" : ""
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.header}
                      // The title column carries the row's emphasis, as it
                      // did when each page hand-rolled its own table.
                      className={`px-5 py-3 ${
                        column === titleColumn ? "font-medium text-ink" : ""
                      } ${column.align === "right" ? "text-right" : ""}`}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Below `md`: one card per row, so nothing is clipped. */}
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-hairline bg-white px-5 py-6 text-sm text-slate md:hidden">
          {empty}
        </p>
      ) : (
        <ul className="flex flex-col gap-3 md:hidden">
          {rows.map((row) => (
            <li
              key={rowKey(row)}
              className="rounded-2xl border border-hairline bg-white p-4"
            >
              <div className="text-[15px] font-medium text-ink">
                {titleColumn?.cell(row)}
              </div>

              {detailColumns.length > 0 ? (
                <dl className="mt-3 grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1.5 text-sm">
                  {detailColumns.map((column) => (
                    <div key={column.header} className="contents">
                      <dt className="text-xs tracking-wide text-slate uppercase">
                        {column.header}
                      </dt>
                      <dd className="min-w-0 text-ink">{column.cell(row)}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {footerColumns.map((column) => (
                <div
                  key={column.header}
                  className="mt-4 border-t border-hairline pt-3"
                >
                  {column.cell(row)}
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** Publication-status pill, shared by every list page that shows one. */
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-accent">
      {status}
    </span>
  );
}

/** Outlined pill link to a record's edit page. */
export function EditLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-hairline px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-teal"
    >
      Edit
    </Link>
  );
}

/**
 * Row controls. Right-aligned in the table's Actions column; full width and
 * left-aligned in a card footer, where there is no column to align against.
 */
export function RowActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2 md:justify-end">{children}</div>
  );
}

/**
 * Inline status control for the inbox pages. Posts straight to a Server
 * Action, so it stays a Server Component and needs no client JavaScript.
 * `kind` is the discriminator `updateLeadStatusAction` uses to tell
 * volunteers from messages; donations have their own action and omit it.
 */
export function StatusForm({
  action,
  id,
  kind,
  status,
  options,
}: {
  action: (formData: FormData) => Promise<void>;
  id: number;
  kind?: string;
  status: string;
  options: readonly string[];
}) {
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      {kind ? <input type="hidden" name="kind" value={kind} /> : null}
      <select
        name="status"
        defaultValue={status}
        aria-label="Status"
        className="h-9 rounded-lg border border-hairline bg-white px-2 text-xs font-medium text-ink"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-teal"
      >
        Set
      </button>
    </form>
  );
}
