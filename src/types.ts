import type { ReactNode } from "react";

/** Props for a root layout at a given route. */
export type LayoutProps<Route extends string> = {
  children: ReactNode;
};

/** Props for a page at a given route. */
export type PageProps<Route extends string> = {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | undefined>>;
};
