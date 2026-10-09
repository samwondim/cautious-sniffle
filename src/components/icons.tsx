import type { SVGProps } from "react";

/**
 * Icon paths are copied verbatim from the approved design bundle so the
 * rebuilt pages match the mockup stroke-for-stroke. Each icon is drawn on a
 * 24x24 grid with `fill="none"` and a 1.5 stroke, matching the source.
 */

export type IconName =
  | "plus-circle"
  | "book-open"
  | "sprout"
  | "leaf"
  | "flag"
  | "eye"
  | "heart"
  | "calendar"
  | "building"
  | "camera"
  | "mail"
  | "globe"
  | "message"
  | "phone"
  | "map-pin"
  | "arrow-right"
  | "hand-heart"
  | "check";

type IconProps = SVGProps<SVGSVGElement> & { name: IconName; size?: number };

const PATHS: Record<IconName, React.ReactNode> = {
  "plus-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  "book-open": (
    <>
      <path d="M3 6.5c2.5-1.5 5.5-1.5 8 0v11c-2.5-1.5-5.5-1.5-8 0v-11z" />
      <path d="M21 6.5c-2.5-1.5-5.5-1.5-8 0v11c2.5-1.5 5.5-1.5 8 0v-11z" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 21v-8" />
      <path d="M12 13c0-4 3-7 7-7 0 4-3 7-7 7z" />
      <path d="M12 13c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z" />
    </>
  ),
  leaf: (
    <>
      <path d="M6 20c-1-6 2-12 12-14 1 8-4 13-12 14z" />
      <path d="M7 19c3-4 6-7 10-10" />
    </>
  ),
  flag: (
    <>
      <path d="M5 3v18" />
      <path d="M5 4h12l-3 4 3 4H5" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12S6 5 12 5s10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  heart: (
    <path d="M12 21c-5-3.5-9-7-9-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4-4 7.5-9 11z" />
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v13" />
      <path d="M13 21v-9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v9" />
      <path d="M8 10h0M8 13h0M8 16h0" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 6l9 7 9-7" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9z" />
    </>
  ),
  message: (
    <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-4-1L3 20l1-5.5A8.5 8.5 0 1 1 21 11.5z" />
  ),
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z" />
  ),
  "map-pin": (
    <>
      <path d="M20 10.5c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10.5" r="3" />
    </>
  ),
  "arrow-right": (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  "hand-heart": (
    <>
      <path d="M12 21c-5-3.5-9-7-9-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4-4 7.5-9 11z" />
      <path d="M12 11.5c-1.5-1-3.5-.5-3.5 1.5 0 1.8 3.5 4 3.5 4s3.5-2.2 3.5-4c0-2-2-2.5-3.5-1.5z" />
    </>
  ),
};

export function Icon({ name, size = 24, ...props }: IconProps) {
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
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}

/** Resolves a DB-stored icon key to a known icon, falling back safely. */
export function toIconName(value: string | null | undefined): IconName {
  return value && value in PATHS ? (value as IconName) : "plus-circle";
}

/** The hand-drawn gold underline beneath "lasting change" in the hero. */
