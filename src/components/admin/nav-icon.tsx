import { Icon, type IconName } from "@/components/icons";

/**
 * Admin navigation glyphs.
 *
 * The public icon set (`components/icons.tsx`) is copied from the design
 * bundle and only covers content concepts (sectors, giving, contact). The
 * dashboard needs a few chrome concepts the site never had — overview, theme,
 * stats, media, donations, volunteers — so those are drawn here on the same
 * 24px grid with the same 1.5 stroke. Anything that already exists in the
 * shared set is delegated to `Icon` rather than duplicated.
 */

export type NavIconName =
  | IconName
  | "layout"
  | "palette"
  | "bar-chart"
  | "image"
  | "credit-card"
  | "users";

const ADMIN_PATHS: Record<string, React.ReactNode> = {
  layout: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  palette: (
    <>
      <path d="M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3 3h-2a2 2 0 0 0-1.4 3.4A1.9 1.9 0 0 1 12 21z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="9.5" cy="7" r="1" />
      <circle cx="14" cy="7" r="1" />
    </>
  ),
  "bar-chart": (
    <>
      <path d="M3 21h18" />
      <path d="M6 21V11" />
      <path d="M12 21V4" />
      <path d="M18 21v-6" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 16l-4.5-4.5L6 20" />
    </>
  ),
  "credit-card": (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 10h19" />
      <path d="M6 15h3" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20v-1a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v1" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
      <path d="M17.5 14.3a4 4 0 0 1 4 3.9V20" />
    </>
  ),
};

export function NavIcon({
  name,
  size = 18,
  className,
}: {
  name: NavIconName;
  size?: number;
  className?: string;
}) {
  const paths = ADMIN_PATHS[name];
  if (!paths) {
    return <Icon name={name as IconName} size={size} className={className} />;
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths}
    </svg>
  );
}
